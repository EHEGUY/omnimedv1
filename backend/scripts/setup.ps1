$ErrorActionPreference = "Stop"

Set-Location (Split-Path $PSScriptRoot -Parent)

$venvPath = Join-Path (Get-Location) ".venv"
$pythonExe = Join-Path $venvPath "Scripts\python.exe"
$pipExe = Join-Path $venvPath "Scripts\pip.exe"

Write-Host "== OmniMed setup =="

if (!(Test-Path $pythonExe)) {
  Write-Host "Creating virtual environment at .venv ..."
  py -3.12 -m venv .venv
}

Write-Host "Upgrading pip ..."
& $pythonExe -m pip install --upgrade pip

Write-Host "Installing base dependencies ..."
& $pipExe install -r requirements.txt

Write-Host ""
Write-Host "Setup complete."
Write-Host "Start the backend with: scripts\run-backend.ps1"
