#!/usr/bin/env python
"""Simple server startup wrapper to avoid Windows asyncio signal issues."""
import sys
import os
import asyncio

# Add backend directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.main import app
import uvicorn

if __name__ == "__main__":
    print("Starting server...", flush=True)
    # Use WindowsSelectorEventLoop on Windows to avoid signal handling issues
    if sys.platform == "win32":
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    
    # Run server with signal handling disabled
    config = uvicorn.Config(
        app,
        host="127.0.0.1",
        port=8000,
        log_level="warning"
    )
    server = uvicorn.Server(config)
    
    try:
        print("Running server...", flush=True)
        asyncio.run(server.serve())
    except KeyboardInterrupt:
        print("Server stopped.")
    except Exception as e:
        print(f"Server error: {e}", flush=True)
        import traceback
        traceback.print_exc()
