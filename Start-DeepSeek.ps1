$ErrorActionPreference = 'Stop'
$claudePath = Join-Path $env:USERPROFILE '.local\bin\claude.exe'
if (-not (Test-Path -LiteralPath $claudePath)) {
    Write-Host 'Claude Code installation is not ready.'
    Read-Host 'Press Enter to close'
    exit 1
}
$keyFile = Join-Path $PSScriptRoot 'config\deepseek-key.clixml'
$secureKey = if (Test-Path -LiteralPath $keyFile) {
    Import-Clixml -LiteralPath $keyFile
} else {
    Read-Host 'Paste your DeepSeek API key (hidden; not saved)' -AsSecureString
}
$keyPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureKey)
try {
    $apiKey = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($keyPointer)
} finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($keyPointer)
}
if ([string]::IsNullOrWhiteSpace($apiKey)) { throw 'An API key is required.' }
$env:ANTHROPIC_BASE_URL = 'https://api.deepseek.com/anthropic'
$env:ANTHROPIC_AUTH_TOKEN = $apiKey
Remove-Item Env:ANTHROPIC_API_KEY -ErrorAction SilentlyContinue
Remove-Item Env:CLAUDE_CODE_OAUTH_TOKEN -ErrorAction SilentlyContinue
$env:ANTHROPIC_MODEL = 'deepseek-flash[1m]'
$env:ANTHROPIC_DEFAULT_OPUS_MODEL = 'deepseek-flash[1m]'
$env:ANTHROPIC_DEFAULT_SONNET_MODEL = 'deepseek-flash[1m]'
$env:ANTHROPIC_DEFAULT_HAIKU_MODEL = 'deepseek-flash'
$env:CLAUDE_CODE_SUBAGENT_MODEL = 'deepseek-flash'
$env:CLAUDE_CODE_EFFORT_LEVEL = 'max'
$env:CLAUDE_CODE_AUTO_COMPACT_WINDOW = '786432'
$proxySettings = Get-ItemProperty -LiteralPath 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Internet Settings' -ErrorAction SilentlyContinue
if ($proxySettings.ProxyEnable -eq 1 -and $proxySettings.ProxyServer -match '^127\.0\.0\.1:\d+$') {
    $env:HTTPS_PROXY = 'http://' + $proxySettings.ProxyServer
    $env:HTTP_PROXY = $env:HTTPS_PROXY
}
$apiKey = $null
Set-Location -LiteralPath (Join-Path $PSScriptRoot 'workspace')
try {
    Write-Host 'Starting Claude Code with DeepSeek. Usage is billed by DeepSeek.'
    & $claudePath
} finally {
    Remove-Item Env:ANTHROPIC_AUTH_TOKEN -ErrorAction SilentlyContinue
    $secureKey.Dispose()
}

