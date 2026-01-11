$filePath = 'e:\realEstateV2\frontend\src\pages\AddProperty.jsx'
$content = Get-Content $filePath -Raw

# Remove the extra closing div after photos and before attachments section
$content = $content -replace '(?s)(\)})\s*</div>\s*(<div className="mb-4">\s*<label[^>]*>\s*📎 Uploaded Attachments)', '$1$2'

Set-Content $filePath -Value $content -Encoding UTF8
Write-Host "Fixed AddProperty.jsx - removed extra closing div tag"
