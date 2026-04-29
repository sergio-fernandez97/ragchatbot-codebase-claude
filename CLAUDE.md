# RAG Chatbot Codebase

## Architecture

- **Backend** (`backend/`): FastAPI app serving the RAG chatbot API. Entry point is `backend/app.py`, run via uvicorn on port 8000. Key modules: `rag_system.py`, `vector_store.py`, `ai_generator.py`, `document_processor.py`, `session_manager.py`, `models.py`, `config.py`.
- **Frontend** (`frontend/`): Static HTML/CSS/JS served by FastAPI. Files: `index.html`, `script.js`, `style.css`.
- **Docs** (`docs/`): Course material documents ingested by the RAG pipeline.

## Launch

```bash
uv sync
chmod +x run.sh
./run.sh
```

- App: http://localhost:8000
- API docs: http://localhost:8000/docs
- Requires `ANTHROPIC_API_KEY` in `.env`

## Live-Session Features (to build)

1. **Course and lesson quick links** — clickable course/lesson links in the sidebar UI
2. **Guided search filters and better source citations** — course/lesson query filters, structured citation rendering
3. **Content health dashboard** — admin panel showing ingested course data quality and coverage

## Agent-Team File Ownership

When using agent teams, enforce strict file ownership to avoid merge conflicts:

- **Backend teammate**: only edits `backend/*`
- **Frontend teammate**: only edits `frontend/*`
- **QA teammate**: validation and verification only — does not edit production files

> **Warning:** Multiple teammates must NOT edit the same file. This is the primary failure mode for agent teams. Keep backend and frontend changes strictly separated.
