$ErrorActionPreference = 'Stop'
New-Item -ItemType Directory -Path (Join-Path $PSScriptRoot 'config') -Force | Out-Null
$key = Read-Host 'Paste your DeepSeek API key (hidden)' -AsSecureString
try {
    if ($key.Length -eq 0) { throw 'An API key is required.' }
    $key | Export-Clixml -LiteralPath (Join-Path $PSScriptRoot 'config\deepseek-key.clixml')
    Write-Host 'Saved using Windows encryption for this user and computer.'
} finally {
    $key.Dispose()
}
