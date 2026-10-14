$taskLocalUrl = 'http://127.0.0.1:3000'
for ($taskAttempt = 0; $taskAttempt -lt 30; $taskAttempt++) {
    try {
        $taskHealth = Invoke-RestMethod -Uri "$taskLocalUrl/api/health" -TimeoutSec 2
        if ($taskHealth.ready -and $taskHealth.mode -eq 'private-local') {
            Start-Process $taskLocalUrl
            break
        }
    } catch { }
    Start-Sleep -Seconds 1
}
