$ErrorActionPreference = 'Stop'
$source = Join-Path $PSScriptRoot 'token-monitor'
$target = Join-Path $PSScriptRoot 'extensions\local-tools.deepseek-token-monitor-0.1.0'
New-Item -ItemType Directory -Path $target -Force | Out-Null
foreach ($name in @('package.json', 'extension.js', 'usage.js', 'balance.js', 'alerts.js', 'Get-Balance.ps1')) {
    Copy-Item -LiteralPath (Join-Path $source $name) -Destination (Join-Path $target $name) -Force
}
Write-Host 'Monitor installed. Reload the dedicated VS Code window to activate it.'
