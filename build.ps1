# variables
$name = 'build.zip'

# build
npm run-script build

# compress for upload
Write-Host 'Compressing...'
Remove-Item .\$name
Compress-Archive .\build\* .\$name
Remove-Item .\build

Write-Host 'Ding!'