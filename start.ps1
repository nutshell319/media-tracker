# 影视记录站启动脚本
Write-Host "🚀 启动服务器..." -ForegroundColor Magenta

# 杀掉可能残留的旧进程
$old = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
if ($old) {
    Write-Host "清理旧进程..." -ForegroundColor Yellow
    $old | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }
    Start-Sleep -Seconds 1
}

# 启动生产服务器（后台运行）
$job = Start-Job -Name "media-tracker" -ArgumentList $PSScriptRoot {
    Set-Location $using:PSScriptRoot
    node .output/server/index.mjs
}

Write-Host "⏳ 等待服务器就绪..." -ForegroundColor Yellow
do { Start-Sleep -Seconds 1 } while (-not (Test-NetConnection -ComputerName localhost -Port 3000 -InformationLevel Quiet -ErrorAction SilentlyContinue))

Write-Host "✅ 服务器已启动: http://localhost:3000" -ForegroundColor Green

# 启动 SSH 公网隧道
Write-Host "🌐 启动公网隧道..." -ForegroundColor Magenta
ssh -o StrictHostKeyChecking=no -o ServerAliveInterval=60 -R 80:localhost:3000 localhost.run

# 用户 Ctrl+C 退出隧道后清理
Write-Host "隧道已关闭，正在清理..." -ForegroundColor Yellow
Remove-Job -Name "media-tracker" -Force -ErrorAction SilentlyContinue
