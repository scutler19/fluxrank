# Test script for FluxRank collectors in batch mode
$baseUrl = "http://localhost:54321/functions/v1"
$headers = @{
    "Authorization" = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0"
    "Content-Type" = "application/json"
}

$packages = @("react", "vue", "angular", "next", "nuxt", "svelte", "express", "fastify", "prisma", "typeorm")
$batchBody = @{
    mode = "batch"
    packages = $packages
} | ConvertTo-Json

Write-Host "Testing GitHub batch mode..." -ForegroundColor Green
try {
    $githubResult = Invoke-RestMethod -Uri "$baseUrl/github" -Method POST -Headers $headers -Body $batchBody
    Write-Host "GitHub batch result: $($githubResult | ConvertTo-Json -Depth 3)" -ForegroundColor Cyan
} catch {
    Write-Host "GitHub batch error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nTesting npm batch mode..." -ForegroundColor Green
try {
    $npmResult = Invoke-RestMethod -Uri "$baseUrl/npm" -Method POST -Headers $headers -Body $batchBody
    Write-Host "npm batch result: $($npmResult | ConvertTo-Json -Depth 3)" -ForegroundColor Cyan
} catch {
    Write-Host "npm batch error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nTesting Reddit batch mode..." -ForegroundColor Green
try {
    $redditResult = Invoke-RestMethod -Uri "$baseUrl/reddit" -Method POST -Headers $headers -Body $batchBody
    Write-Host "Reddit batch result: $($redditResult | ConvertTo-Json -Depth 3)" -ForegroundColor Cyan
} catch {
    Write-Host "Reddit batch error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nBatch testing complete!" -ForegroundColor Yellow 