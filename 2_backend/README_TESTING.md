Running the backend for local tests

This file describes how to start the FastAPI backend and run the test suite on Windows (using the repository's virtual environment).

Prerequisites

- A working Python 3.10+ virtual environment created at `venv` in the repository root (the project already uses this venv in tests).
- Dependencies installed (run `venv\Scripts\pip.exe install -r 2_backend\requirements.txt` if needed).

Start the backend (recommended; uses the helper script included in `2_backend`)

Open PowerShell in the repo root and run:

```powershell
cd 2_backend
# Use the venv Python executable
$venv = "C:\Users\nisha\OneDrive\Documents\genetic-dbms\venv\Scripts\python.exe"
& $venv .\run_server.py
```

This launches the backend with `uvicorn` bound to `localhost:8000`. The script is a minimal helper to avoid Windows asyncio signal issues.

Run the tests (in another terminal)

```powershell
cd C:\Users\nisha\OneDrive\Documents\genetic-dbms
# Run the full test suite
C:\Users\nisha\OneDrive\Documents\genetic-dbms\venv\Scripts\python.exe -m pytest 7_tests/ -v
```

Notes

- The project includes `run_server.py` (in `2_backend`) used during local testing. If you prefer to run `uvicorn` directly, use:

```powershell
cd 2_backend
C:\path\to\venv\Scripts\python.exe -m uvicorn app.main:app --host localhost --port 8000
```

- Docker compose is not used in CI for these tests; if you prefer Docker, ensure Docker Desktop is installed and use `docker compose up --build backend` from the repo root.

Undoing changes

If you'd like me to remove the helper scripts (`run_server.py`, `startup.py`) and leave the repo unchanged, tell me and I will revert them.
