$ErrorActionPreference = "Stop"

Set-Location (Split-Path $PSScriptRoot -Parent)

$pythonExe = ".venv\\Scripts\\python.exe"
if (!(Test-Path $pythonExe)) {
  throw "Missing .venv. Run scripts\\setup.ps1 first."
}

Write-Host "Installing CUDA-enabled PyTorch (cu128) into .venv ..."
& $pythonExe -m pip install --upgrade --index-url https://download.pytorch.org/whl/cu128 torch torchvision torchaudio

Write-Host ""
Write-Host "Verification:"
& $pythonExe -c "import torch; print('torch=', torch.__version__); print('torch.version.cuda=', torch.version.cuda); print('cuda_available=', torch.cuda.is_available())"
