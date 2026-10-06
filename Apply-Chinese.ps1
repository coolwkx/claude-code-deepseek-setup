param([switch]$Restore)
$ErrorActionPreference = 'Stop'
$extension = Get-ChildItem -LiteralPath (Join-Path $PSScriptRoot 'extensions') -Directory -Filter 'anthropic.claude-code-2.1.291-*' | Select-Object -First 1
if (-not $extension) { throw 'This patch requires Claude Code extension 2.1.291.' }
$file = Join-Path $extension.FullName 'webview\index.js'
$backup = Join-Path $PSScriptRoot 'config\claude-webview-original-2.1.291.js'
New-Item -ItemType Directory -Path (Split-Path -Parent $backup) -Force | Out-Null
if ($Restore) {
    if (-not (Test-Path -LiteralPath $backup)) { throw 'No original backup found.' }
    Copy-Item -LiteralPath $backup -Destination $file -Force
    Write-Host 'Original interface restored. Restart this client.'
    exit
}
if (-not (Test-Path -LiteralPath $backup)) { Copy-Item -LiteralPath $file -Destination $backup }
$text = [IO.File]::ReadAllText($backup)
$dictionary = Get-Content -LiteralPath (Join-Path $PSScriptRoot 'templates\translations.zh-CN.json') -Raw | ConvertFrom-Json
foreach ($entry in $dictionary.PSObject.Properties) {
    $from = ConvertTo-Json -InputObject ([string]$entry.Name) -Compress
    $to = ConvertTo-Json -InputObject ([string]$entry.Value) -Compress
    $text = $text.Replace($from, $to)
}
$text += [IO.File]::ReadAllText((Join-Path $PSScriptRoot 'templates\ui-zh-CN.js'))
[IO.File]::WriteAllText($file, $text, (New-Object Text.UTF8Encoding($false)))
Write-Host 'Common interface labels translated. Restart this client. Some labels may remain English.'
