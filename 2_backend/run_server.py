#!/usr/bin/env python
"""Server wrapper that avoids Windows asyncio signal issues by using threading."""
import sys
import os
import subprocess
import time

# Just spawn uvicorn as a subprocess with no-reload flag
if __name__ == "__main__":
    print("Starting Genetic-DBMS Backend Server...", flush=True)
    
    # Get the path to uvicorn
    venv_path = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    backend_path = os.path.dirname(os.path.abspath(__file__))
    
    # Change to backend directory
    os.chdir(backend_path)
    
    # Start uvicorn as subprocess
    cmd = [
        sys.executable,
        "-m", "uvicorn",
        "app.main:app",
        "--host", "localhost",
        "--port", "8000",
        "--log-level", "info"
    ]
    
    print(f"Running: {' '.join(cmd)}", flush=True)
    
    try:
        proc = subprocess.Popen(cmd)
        proc.wait()
    except KeyboardInterrupt:
        print("Shutting down...", flush=True)
        proc.terminate()
        proc.wait(timeout=5)
    except Exception as e:
        print(f"ERROR: {e}", flush=True)
        sys.exit(1)
