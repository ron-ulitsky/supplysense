# SupplySense ADK Agent Backend

This directory contains the Python-based Google ADK (Agent Development Kit) backend
that powers the SupplySense intelligence engine.

## Architecture

The agent system uses multiple ADK patterns:

- **Coordinator-Dispatcher**: A root `LlmAgent` receives disruption events and
  delegates to specialized sub-agents based on the disruption type.
- **Tool-based Agents**: Each specialist agent uses Python tool functions to
  look up inventory, check supplier health, and draft mitigation strategies.
- **FastAPI Server**: Exposes the ADK agent pipeline as a REST endpoint
  (`POST /analyze`) that the Next.js frontend calls.

## Running Locally

```bash
cd agent
pip install -r requirements.txt
python server.py
```

The server starts on `http://localhost:8000`.
