param(
    [string]$MavenCmd = "D:\apache-maven-3.6.3\bin\mvn.cmd",
    [switch]$SkipPackage,
    [ValidateSet("compact", "standard")]
    [string]$MemoryProfile = "compact",
    [string[]]$Services = @(),
    [int]$StartupDelaySeconds = 4,
    [int]$ReadyTimeoutSeconds = 20,
    [string[]]$ExtraJvmArgs = @()
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

function Get-JvmArgsForService {
    param(
        [Parameter(Mandatory = $true)][string]$ServiceName,
        [Parameter(Mandatory = $true)][string]$ProfileName
    )

    $compactCommon = @(
        "-Dfile.encoding=UTF-8",
        "-Dspring.main.lazy-initialization=true",
        "-Dspring.backgroundpreinitializer.ignore=true",
        "-Dspring.data.redis.repositories.enabled=false",
        "-Dspring.jmx.enabled=false",
        "-Djdk.nio.maxCachedBufferSize=262144",
        "-Dio.netty.eventLoopThreads=2",
        "-Dio.netty.noPreferDirect=true",
        "-Dio.netty.allocator.maxOrder=3",
        "-Dio.netty.allocator.numHeapArenas=2",
        "-Dio.netty.allocator.numDirectArenas=0",
        "-Dio.netty.recycler.maxCapacityPerThread=0",
        "-Dreactor.netty.ioWorkerCount=2",
        "-Dreactor.netty.ioSelectCount=1",
        "-Dreactor.schedulers.defaultPoolSize=2",
        "-Djava.util.concurrent.ForkJoinPool.common.parallelism=2",
        "-Dserver.tomcat.threads.max=32",
        "-Dserver.tomcat.threads.min-spare=2",
        "-Dspring.datasource.hikari.maximum-pool-size=4",
        "-Dspring.datasource.hikari.minimum-idle=1",
        "-Dspring.task.execution.pool.core-size=2",
        "-Dspring.task.execution.pool.max-size=4",
        "-Dspring.task.scheduling.pool.size=1",
        "-XX:+UseSerialGC",
        "-XX:ActiveProcessorCount=2",
        "-XX:CICompilerCount=2",
        "-XX:HeapBaseMinAddress=4g",
        "-XX:TieredStopAtLevel=1",
        "-Xss256k"
    )

    $standardCommon = @(
        "-Dfile.encoding=UTF-8",
        "-Dio.netty.eventLoopThreads=4",
        "-Dreactor.netty.ioWorkerCount=4",
        "-Dreactor.netty.ioSelectCount=2",
        "-Djava.util.concurrent.ForkJoinPool.common.parallelism=4",
        "-Dserver.tomcat.threads.max=64",
        "-Dserver.tomcat.threads.min-spare=4",
        "-Dspring.datasource.hikari.maximum-pool-size=6",
        "-Dspring.datasource.hikari.minimum-idle=1",
        "-Dspring.task.execution.pool.core-size=4",
        "-Dspring.task.execution.pool.max-size=8",
        "-Dspring.task.scheduling.pool.size=2",
        "-XX:ActiveProcessorCount=4",
        "-XX:HeapBaseMinAddress=4g",
        "-Xss512k"
    )

    switch ($ProfileName) {
        "compact" {
            $commonArgs = $compactCommon
            $serviceArgs = switch ($ServiceName) {
                "mall-gateway" {
                    @("-Xms48m", "-Xmx256m", "-XX:MaxMetaspaceSize=192m", "-XX:MaxDirectMemorySize=64m", "-XX:ReservedCodeCacheSize=64m")
                }
                { $_ -in @("auth-service", "order-service", "payment-service") } {
                    @("-Xms24m", "-Xmx224m", "-XX:MaxMetaspaceSize=192m", "-XX:MaxDirectMemorySize=48m", "-XX:ReservedCodeCacheSize=64m")
                }
                default {
                    @("-Xms24m", "-Xmx160m", "-XX:MaxMetaspaceSize=128m", "-XX:MaxDirectMemorySize=32m", "-XX:ReservedCodeCacheSize=48m")
                }
            }
        }
        "standard" {
            $commonArgs = $standardCommon
            $serviceArgs = switch ($ServiceName) {
                "mall-gateway" {
                    @("-Xms96m", "-Xmx448m", "-XX:MaxMetaspaceSize=224m", "-XX:MaxDirectMemorySize=192m", "-XX:ReservedCodeCacheSize=96m")
                }
                { $_ -in @("auth-service", "order-service", "payment-service") } {
                    @("-Xms72m", "-Xmx320m", "-XX:MaxMetaspaceSize=192m", "-XX:MaxDirectMemorySize=128m", "-XX:ReservedCodeCacheSize=96m")
                }
                default {
                    @("-Xms72m", "-Xmx256m", "-XX:MaxMetaspaceSize=160m", "-XX:MaxDirectMemorySize=96m", "-XX:ReservedCodeCacheSize=80m")
                }
            }
        }
        default {
            throw "Unsupported memory profile: $ProfileName"
        }
    }

    return $commonArgs + $serviceArgs
}

function Import-DotEnvFile {
    param([Parameter(Mandatory = $true)][string]$Path)

    if (-not (Test-Path $Path)) {
        return
    }

    Get-Content $Path | ForEach-Object {
        $line = $_.Trim()
        if (-not $line -or $line.StartsWith("#")) {
            return
        }

        $separatorIndex = $line.IndexOf("=")
        if ($separatorIndex -lt 1) {
            return
        }

        $name = $line.Substring(0, $separatorIndex).Trim()
        $value = $line.Substring($separatorIndex + 1).Trim()
        if (
            ($value.StartsWith('"') -and $value.EndsWith('"')) -or
            ($value.StartsWith("'") -and $value.EndsWith("'"))
        ) {
            $value = $value.Substring(1, $value.Length - 2)
        }

        if (-not [string]::IsNullOrWhiteSpace($name) -and -not (Test-Path "Env:$name")) {
            Set-Item -Path "Env:$name" -Value $value
        }
    }
}

function Set-DefaultMallInfraEnv {
    $envMap = @{
        "MALL_VM_HOST" = $env:HOST_IP
        "MALL_MYSQL_PASSWORD" = $env:MYSQL_ROOT_PASSWORD
        "MALL_REDIS_PASSWORD" = $env:REDIS_PASSWORD
    }

    foreach ($entry in $envMap.GetEnumerator()) {
        if (-not (Test-Path "Env:$($entry.Key)") -and -not [string]::IsNullOrWhiteSpace($entry.Value)) {
            Set-Item -Path "Env:$($entry.Key)" -Value $entry.Value
        }
    }
}

$repoRoot = Split-Path -Parent $PSScriptRoot
$logDir = Join-Path $PSScriptRoot "logs"
$runDir = Join-Path $PSScriptRoot "run"
$dotEnvPath = Join-Path $PSScriptRoot ".env"

Import-DotEnvFile -Path $dotEnvPath
Set-DefaultMallInfraEnv

New-Item -ItemType Directory -Force -Path $logDir | Out-Null
New-Item -ItemType Directory -Force -Path $runDir | Out-Null

$javaCmd = if ($env:JAVA_HOME) {
    Resolve-Executable -CommandText (Join-Path $env:JAVA_HOME "bin\java.exe")
} else {
    Resolve-Executable -CommandText "java"
}

if (-not $SkipPackage) {
    $resolvedMavenCmd = Resolve-Executable -CommandText $MavenCmd
    Write-Host "Packaging project with Maven: $resolvedMavenCmd"
    & $resolvedMavenCmd -q -DskipTests package
    if ($LASTEXITCODE -ne 0) {
        throw "Maven package failed."
    }
}

$allServices = @(
    @{ Name = "auth-service"; Port = 18081; Jar = (Join-Path $repoRoot "mall-services\auth-service\target\auth-service-1.0.0-SNAPSHOT.jar") },
    @{ Name = "user-service"; Port = 18082; Jar = (Join-Path $repoRoot "mall-services\user-service\target\user-service-1.0.0-SNAPSHOT.jar") },
    @{ Name = "product-service"; Port = 18083; Jar = (Join-Path $repoRoot "mall-services\product-service\target\product-service-1.0.0-SNAPSHOT.jar") },
    @{ Name = "inventory-service"; Port = 18084; Jar = (Join-Path $repoRoot "mall-services\inventory-service\target\inventory-service-1.0.0-SNAPSHOT.jar") },
    @{ Name = "cart-service"; Port = 18085; Jar = (Join-Path $repoRoot "mall-services\cart-service\target\cart-service-1.0.0-SNAPSHOT.jar") },
    @{ Name = "order-service"; Port = 18086; Jar = (Join-Path $repoRoot "mall-services\order-service\target\order-service-1.0.0-SNAPSHOT.jar") },
    @{ Name = "payment-service"; Port = 18087; Jar = (Join-Path $repoRoot "mall-services\payment-service\target\payment-service-1.0.0-SNAPSHOT.jar") },
    @{ Name = "mall-gateway"; Port = 18080; Jar = (Join-Path $repoRoot "mall-gateway\target\mall-gateway-1.0.0-SNAPSHOT.jar") }
)

$selectedServices = if ($Services.Count -gt 0) {
    $requestedNames = [System.Collections.Generic.HashSet[string]]::new([System.StringComparer]::OrdinalIgnoreCase)
    foreach ($serviceName in $Services) {
        $null = $requestedNames.Add($serviceName)
    }

    $matched = @($allServices | Where-Object { $requestedNames.Contains($_.Name) })
    $unknown = @($requestedNames | Where-Object { $_ -notin $allServices.Name })
    if ($unknown.Count -gt 0) {
        throw "Unknown service name(s): $($unknown -join ', ')"
    }

    $matched
} else {
    $allServices
}

Write-Host ("Starting {0} service(s) with '{1}' memory profile." -f @($selectedServices).Count, $MemoryProfile)
Write-Host ("Logs: {0}" -f $logDir)
Write-Host ("PID files: {0}" -f $runDir)

foreach ($service in @($selectedServices)) {
    if (-not (Test-Path $service.Jar)) {
        throw "Jar not found: $($service.Jar)"
    }

    $pidFile = Join-Path $runDir ($service.Name + ".pid")
    if (Test-Path $pidFile) {
        $existingPid = Get-Content $pidFile -ErrorAction SilentlyContinue
        if ($existingPid -and (Get-Process -Id $existingPid -ErrorAction SilentlyContinue)) {
            Write-Host "$($service.Name) is already running on port $($service.Port) with PID $existingPid"
            continue
        }
        Remove-Item $pidFile -Force
    }

    $outLog = Join-Path $logDir ($service.Name + ".out.log")
    $errLog = Join-Path $logDir ($service.Name + ".err.log")
    if (Test-Path $outLog) { Remove-Item $outLog -Force }
    if (Test-Path $errLog) { Remove-Item $errLog -Force }

    $jvmArgs = Get-JvmArgsForService -ServiceName $service.Name -ProfileName $MemoryProfile
    $effectiveArgs = $jvmArgs + $ExtraJvmArgs + @("-jar", $service.Jar)
    $xmxArg = ($jvmArgs | Where-Object { $_ -like "-Xmx*" } | Select-Object -First 1)

    $process = Start-Process -FilePath $javaCmd `
        -ArgumentList $effectiveArgs `
        -WorkingDirectory $repoRoot `
        -RedirectStandardOutput $outLog `
        -RedirectStandardError $errLog `
        -PassThru

    Set-Content -Path $pidFile -Value $process.Id
    Write-Host ("Started {0} on port {1}, PID {2}, cap {3}" -f $service.Name, $service.Port, $process.Id, $xmxArg)

    Start-Sleep -Seconds $StartupDelaySeconds

    $runningProcess = Get-Process -Id $process.Id -ErrorAction SilentlyContinue
    if (-not $runningProcess) {
        if (Test-Path $pidFile) {
            Remove-Item $pidFile -Force
        }
        $outTail = if (Test-Path $outLog) { (Get-Content $outLog -Tail 30) -join [Environment]::NewLine } else { "" }
        $errTail = if (Test-Path $errLog) { (Get-Content $errLog -Tail 30) -join [Environment]::NewLine } else { "" }
        throw ("{0} exited during startup.{1}OUT:{1}{2}{1}{1}ERR:{1}{3}" -f $service.Name, [Environment]::NewLine, $outTail, $errTail)
    }

    $isListening = Test-TcpPort -Port $service.Port
    if (-not $isListening) {
        $deadline = (Get-Date).AddSeconds($ReadyTimeoutSeconds)
        while ((Get-Date) -lt $deadline) {
            Start-Sleep -Seconds 1

            $runningProcess = Get-Process -Id $process.Id -ErrorAction SilentlyContinue
            if (-not $runningProcess) {
                if (Test-Path $pidFile) {
                    Remove-Item $pidFile -Force
                }
                $outTail = if (Test-Path $outLog) { (Get-Content $outLog -Tail 30) -join [Environment]::NewLine } else { "" }
                $errTail = if (Test-Path $errLog) { (Get-Content $errLog -Tail 30) -join [Environment]::NewLine } else { "" }
                throw ("{0} exited before port {1} became ready.{2}OUT:{2}{3}{2}{2}ERR:{2}{4}" -f $service.Name, $service.Port, [Environment]::NewLine, $outTail, $errTail)
            }

            $isListening = Test-TcpPort -Port $service.Port
            if ($isListening) {
                break
            }
        }
    }

    if ($isListening) {
        Write-Host ("{0} is listening on port {1}" -f $service.Name, $service.Port)
    } else {
        Write-Host ("{0} is still warming up after {1}s; process is alive and logs are in {2}" -f $service.Name, $ReadyTimeoutSeconds, $outLog)
    }
}

Write-Host ""
Write-Host "Startup commands submitted."
Write-Host "Tip: use -MemoryProfile standard if you later move to a roomier machine."
Write-Host "Tip: use -Services product-service,mall-gateway to start only the slices you need."
