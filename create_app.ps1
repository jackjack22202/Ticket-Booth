# variables
$name = 'monday_app_ticketbooth.zip'

# custom style replacements
Write-Host 'Replacing @trendmicro\react-sidnav...'
Copy-Item .\custom_styles\react-sidenav.css -Destination '.\node_modules\@trendmicro\react-sidenav\dist\react-sidenav.css'

Write-Host 'Replacing react-loadingmask.css...'
Copy-Item .\custom_styles\react-loadingmask.css -Destination '.\node_modules\react-loadingmask\dist\react-loadingmask.css'

# build
npm run-script build

# compress for upload
Write-Host 'Compressing...'
Remove-Item .\$name
Compress-Archive .\build\* .\$name

Write-Host 'Ding!'