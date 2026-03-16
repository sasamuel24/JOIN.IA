# Mata cualquier proceso en el puerto 8000
$proc = Get-NetTCPConnection -LocalPort 8000 -State Listen -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess
if ($proc) {
    Stop-Process -Id $proc -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 1
}

# Cambia al directorio del backend para que pydantic-settings encuentre el .env
Set-Location $PSScriptRoot
$env:PYTHONPATH = $PSScriptRoot
& "$PSScriptRoot\venv\Scripts\python.exe" -m uvicorn app.main:app --reload --port 8000
