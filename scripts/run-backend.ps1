$ErrorActionPreference = "Stop"

Set-Location (Split-Path $PSScriptRoot -Parent)

$venvPath = Join-Path (Get-Location) ".venv"
$pythonExe = Join-Path $venvPath "Scripts\python.exe"

if (Test-Path $pythonExe) {
  Write-Host "Starting backend using .venv ..."
  & $pythonExe api.py
  exit $LASTEXITCODE
}

Write-Host "WARNING: .venv not found. Starting backend using system python."
python api.py
