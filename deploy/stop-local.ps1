$ErrorActionPreference = "Stop"

$runDir = Join-Path $PSScriptRoot "run"

if (-not (Test-Path $runDir)) {
    Write-Host "No run directory found."
    exit 0
}

$pidFiles = Get-ChildItem -Path $runDir -Filter "*.pid" -File
if (-not $pidFiles) {
    Write-Host "No PID files found."
    exit 0
}

foreach ($pidFile in $pidFiles) {
    $pidValue = Get-Content $pidFile.FullName -ErrorAction SilentlyContinue
    if ($pidValue -and (Get-Process -Id $pidValue -ErrorAction SilentlyContinue)) {
        Stop-Process -Id $pidValue -Force
        Write-Host ("Stopped {0} (PID {1})" -f $pidFile.BaseName, $pidValue)
    } else {
        Write-Host ("Process already stopped for {0}" -f $pidFile.BaseName)
    }
    Remove-Item $pidFile.FullName -Force
}
