# Run the backend API with automatic reloading
$env:PYTHONPATH = (Get-Item .\backend).FullName
.\.venv\Scripts\python.exe .\backend\entrypoint\api.py
