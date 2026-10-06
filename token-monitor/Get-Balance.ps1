param([Parameter(Mandatory = $true)][string]$KeyFile)
$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'
$secureKey = $null
try {
    $secureKey = Import-Clixml -LiteralPath $KeyFile
    $pointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureKey)
    try { $key = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($pointer) }
    finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($pointer) }
    $arguments = @{
        Uri = 'https://api.deepseek.com/user/balance'
        Headers = @{ Authorization = 'Bearer ' + $key }
        TimeoutSec = 15
    }
    $proxy = Get-ItemProperty -LiteralPath 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Internet Settings' -ErrorAction SilentlyContinue
    if ($proxy.ProxyEnable -eq 1 -and $proxy.ProxyServer -match '^127\.0\.0\.1:\d+$') {
        $arguments.Proxy = 'http://' + $proxy.ProxyServer
    }
    $response = Invoke-RestMethod @arguments
    @{ is_available = $response.is_available; balance_infos = $response.balance_infos } | ConvertTo-Json -Depth 5 -Compress
} catch {
    Write-Output '{"error":"balance_unavailable"}'
    exit 1
} finally {
    $key = $null
    if ($secureKey) { $secureKey.Dispose() }
}
