# PowerShell Build & Export Script for museumswiki
Write-Host "Building Docker image 'museumswiki:latest'..." -ForegroundColor Cyan
docker build -t museumswiki:latest .

Write-Host "Exporting image to 'museumswiki.tar.gz' for SSH/SCP transfer..." -ForegroundColor Cyan
docker save museumswiki:latest | gzip > museumswiki.tar.gz

Write-Host "Done! You can now transfer 'museumswiki.tar.gz' to your Linux client." -ForegroundColor Green
