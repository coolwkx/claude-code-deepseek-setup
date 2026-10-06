$ErrorActionPreference = 'Stop'
$code = (Get-Command code.cmd -ErrorAction Stop).Source
foreach ($folder in @('client-data\User', 'extensions', 'workspace', 'config')) {
    New-Item -ItemType Directory -Path (Join-Path $PSScriptRoot $folder) -Force | Out-Null
}
foreach ($name in @('settings.json', 'argv.json')) {
    $target = Join-Path $PSScriptRoot ('client-data\User\' + $name)
    if (-not (Test-Path -LiteralPath $target)) {
        Copy-Item -LiteralPath (Join-Path $PSScriptRoot ('templates\' + $name)) -Destination $target
    }
}
$arguments = @('--user-data-dir', (Join-Path $PSScriptRoot 'client-data'), '--extensions-dir', (Join-Path $PSScriptRoot 'extensions'))
foreach ($extension in @('anthropic.claude-code@2.1.291', 'MS-CEINTL.vscode-language-pack-zh-hans@1.104.2025091009')) {
    & $code @arguments --install-extension $extension --force
    if ($LASTEXITCODE -ne 0) { throw "Extension installation failed: $extension" }
}
$shell = New-Object -ComObject WScript.Shell
$shortcut = $shell.CreateShortcut((Join-Path ([Environment]::GetFolderPath('Desktop')) 'Claude Code + DeepSeek.lnk'))
$shortcut.TargetPath = Join-Path $env:SystemRoot 'System32\wscript.exe'
$shortcut.Arguments = '"' + (Join-Path $PSScriptRoot 'Start-Client.vbs') + '"'
$shortcut.WorkingDirectory = $PSScriptRoot
$shortcut.Description = 'Claude Code graphical client with DeepSeek'
$shortcut.Save()
Write-Host 'Client prepared. Save an API key and apply the optional Chinese patch before starting.'
