@echo off
echo Building Docker image 'museumswiki:latest'...
docker build -t museumswiki:latest .

echo Exporting image to 'museumswiki.tar'...
docker save -o museumswiki.tar museumswiki:latest

echo Done! Created museumswiki.tar in current directory.
pause
