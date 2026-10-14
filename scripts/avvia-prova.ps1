param([switch]$NoBrowser)
$ErrorActionPreference = 'Stop'
$taskProjectRoot = Split-Path -Parent $PSScriptRoot
$taskWebRoot = Join-Path $taskProjectRoot 'web'
$taskLocalUrl = 'http://127.0.0.1:3000'
try {
    try {
        $taskHealth = Invoke-RestMethod -Uri "$taskLocalUrl/api/health" -TimeoutSec 2
    } catch { $taskHealth = $null }
    if ($taskHealth -and $taskHealth.mode -eq 'private-local' -and $taskHealth.ready) {
        Write-Host 'La prova privata e gia avviata.'
        Write-Host "Apri $taskLocalUrl"
        if (-not $NoBrowser) { Start-Process $taskLocalUrl }
        exit 0
    }
    $taskNode = Get-Command node.exe -ErrorAction SilentlyContinue
    if (-not $taskNode) { throw 'Node.js non e disponibile. Occorre Node.js 24.14 o successivo per questa prova.' }
    $taskNodeVersion = [version]((& $taskNode.Source --version).Trim().TrimStart('v'))
    if ($taskNodeVersion -lt [version]'24.14.0') { throw 'Aggiorna Node.js almeno alla versione 24.14 per avviare la prova.' }
    $taskNextEntry = Join-Path $taskWebRoot 'node_modules/next/dist/bin/next'
    if (-not (Test-Path -LiteralPath $taskNextEntry)) { throw 'Le dipendenze non sono installate. Consulta web/README.md per la preparazione.' }
    Set-Location -LiteralPath $taskWebRoot
    $env:APP_MODE = 'private-local'
    $env:NEXT_TELEMETRY_DISABLED = '1'
    if (-not (Test-Path -LiteralPath (Join-Path $taskWebRoot '.next/BUILD_ID'))) {
        Write-Host 'Preparo la versione privata. La prima apertura puo richiedere qualche istante.'
        & $taskNode.Source $taskNextEntry build --webpack
        if ($LASTEXITCODE -ne 0) { throw 'La preparazione non e riuscita. Conserva il messaggio per la verifica.' }
    }
    if (-not $NoBrowser) {
        $taskOpenHelper = Join-Path $PSScriptRoot 'apri-prova.ps1'
        Start-Process -FilePath 'powershell.exe' -WindowStyle Hidden -ArgumentList @('-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', ('"' + $taskOpenHelper + '"'))
    }
    Write-Host ''
    Write-Host 'Preparati - prova privata sul tuo computer'
    Write-Host "Indirizzo: $taskLocalUrl"
    Write-Host 'Lascia questa finestra aperta mentre usi la prova. Per terminarla premi Ctrl+C.'
    Write-Host ''
    & $taskNode.Source $taskNextEntry start --hostname 127.0.0.1 --port 3000
    if ($LASTEXITCODE -ne 0) { throw 'Non e stato possibile avviare il server. Verifica che la porta 3000 sia libera.' }
} catch {
    Write-Host ''
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}
