param(
    [string]$MavenCmd = "D:\apache-maven-3.6.3\bin\mvn.cmd",
    [switch]$SkipPackage,
    [switch]$SkipBackend,
    [switch]$SkipFrontend,
    [ValidateSet("compact", "standard")]
    [string]$MemoryProfile = "compact",
    [int]$FrontendPort = 5173,
    [int]$FrontendNodeMemoryMb = 192
)

$ErrorActionPreference = "Stop"

function Resolve-Executable {
    param([Parameter(Mandatory = $true)][string]$CommandText)

    if (Test-Path $CommandText) {
        return (Resolve-Path $CommandText).Path
    }

    $command = Get-Command $CommandText -ErrorAction SilentlyContinue
    if ($command) {
        return $command.Source
    }

    throw "Command not found: $CommandText"
}

function Test-TcpPort {
    param(
        [Parameter(Mandatory = $true)][int]$Port,
        [string]$TargetHost = "127.0.0.1",
        [int]$TimeoutMilliseconds = 500
    )

    $client = $null
    try {
        $client = New-Object System.Net.Sockets.TcpClient
        $asyncResult = $client.BeginConnect($TargetHost, $Port, $null, $null)
        if (-not $asyncResult.AsyncWaitHandle.WaitOne($TimeoutMilliseconds, $false)) {
            return $false
        }

        $client.EndConnect($asyncResult)
        return $true
    } catch {
        return $false
    } finally {
        if ($client) {
            $client.Close()
        }
    }
}

$repoRoot = Split-Path -Parent $PSScriptRoot
$logDir = Join-Path $PSScriptRoot "logs"
$runDir = Join-Path $PSScriptRoot "run"
$frontendRoot = Join-Path $repoRoot "mall-web"

New-Item -ItemType Directory -Force -Path $logDir | Out-Null
New-Item -ItemType Directory -Force -Path $runDir | Out-Null

if (-not $SkipBackend) {
    $backendArgs = @{
        MavenCmd = $MavenCmd
        MemoryProfile = $MemoryProfile
    }

    if ($SkipPackage) {
        $backendArgs.SkipPackage = $true
    }

    & (Join-Path $PSScriptRoot "start-local.ps1") @backendArgs
}

if ($SkipFrontend) {
    Write-Host "Frontend startup skipped."
    exit 0
}

if (-not (Test-Path $frontendRoot)) {
    throw "Frontend directory not found: $frontendRoot"
}

$nodeCmd = Resolve-Executable -CommandText "node"
$pidFile = Join-Path $runDir "mall-web.pid"
$outLog = Join-Path $logDir "mall-web.out.log"
$errLog = Join-Path $logDir "mall-web.err.log"

if (Test-Path $pidFile) {
    $existingPid = Get-Content $pidFile -ErrorAction SilentlyContinue
    if ($existingPid -and (Get-Process -Id $existingPid -ErrorAction SilentlyContinue)) {
        Write-Host "mall-web is already running on port $FrontendPort with PID $existingPid"
        exit 0
    }
    Remove-Item $pidFile -Force
}

if (Test-Path $outLog) { Remove-Item $outLog -Force }
if (Test-Path $errLog) { Remove-Item $errLog -Force }

$frontendArgs = @(
    "--max-old-space-size=$FrontendNodeMemoryMb",
    "./node_modules/vite/bin/vite.js",
    "--host",
    "0.0.0.0",
    "--port",
    "$FrontendPort",
    "--strictPort"
)

$process = Start-Process -FilePath $nodeCmd `
    -ArgumentList $frontendArgs `
    -WorkingDirectory $frontendRoot `
    -RedirectStandardOutput $outLog `
    -RedirectStandardError $errLog `
    -PassThru

Set-Content -Path $pidFile -Value $process.Id
Write-Host ("Started mall-web on port {0}, PID {1}, node cap {2} MB" -f $FrontendPort, $process.Id, $FrontendNodeMemoryMb)

Start-Sleep -Seconds 3

$runningProcess = Get-Process -Id $process.Id -ErrorAction SilentlyContinue
if (-not $runningProcess) {
    if (Test-Path $pidFile) {
        Remove-Item $pidFile -Force
    }
    $outTail = if (Test-Path $outLog) { (Get-Content $outLog -Tail 30) -join [Environment]::NewLine } else { "" }
    $errTail = if (Test-Path $errLog) { (Get-Content $errLog -Tail 30) -join [Environment]::NewLine } else { "" }
    throw ("mall-web exited during startup.{0}OUT:{0}{1}{0}{0}ERR:{0}{2}" -f [Environment]::NewLine, $outTail, $errTail)
}

$deadline = (Get-Date).AddSeconds(15)
$isListening = $false
while ((Get-Date) -lt $deadline) {
    if (Test-TcpPort -Port $FrontendPort) {
        $isListening = $true
        break
    }

    $runningProcess = Get-Process -Id $process.Id -ErrorAction SilentlyContinue
    if (-not $runningProcess) {
        if (Test-Path $pidFile) {
            Remove-Item $pidFile -Force
        }
        $outTail = if (Test-Path $outLog) { (Get-Content $outLog -Tail 30) -join [Environment]::NewLine } else { "" }
        $errTail = if (Test-Path $errLog) { (Get-Content $errLog -Tail 30) -join [Environment]::NewLine } else { "" }
        throw ("mall-web exited before port {0} became ready.{1}OUT:{1}{2}{1}{1}ERR:{1}{3}" -f $FrontendPort, [Environment]::NewLine, $outTail, $errTail)
    }

    Start-Sleep -Seconds 1
}

if ($isListening) {
    Write-Host ("mall-web is listening on port {0}" -f $FrontendPort)
} else {
    Write-Host ("mall-web is still warming up after 15s; process is alive and logs are in {0}" -f $outLog)
}
