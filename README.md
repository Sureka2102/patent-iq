# PatentIQ – Multi-Agent AI System for Patent Novelty Assessment

A FastAPI backend that uses a **LangGraph pipeline** to analyze uploaded project documents and generate preliminary patent novelty assessment reports.

---

## Architecture Overview

```
Upload → DocumentParser → Summarizer → FeatureExtractor → InnovationDetector
       → SimilarityAnalyzer (local patent corpus) → NoveltyAssessor → RecommendationAgent → ReportGenerator
```

Each stage is an independent LangGraph node. The shared `AgentState` TypedDict flows through the graph, accumulating results at each step.

---

## Tech Stack

| Layer | Technology |
|---|---|
| API | FastAPI 0.115 |
| Agent Orchestration | LangGraph 0.2 |
| LLM | LangChain + Groq |
| Database | SQLite + SQLAlchemy 2 (async) |
| Vector Store | ChromaDB (project matches and local patent corpus) |
| Embeddings | SentenceTransformers (all-MiniLM-L6-v2) |
| Document Parsing | PyMuPDF, python-docx, python-pptx |
| PDF Reports | ReportLab |
| Auth | JWT (access + refresh tokens) |
| Containers | Docker + Docker Compose |

---

## Project Structure

```
backend/
├── app/
│   ├── api/            # FastAPI routers (auth, projects, patents, analysis, reports)
│   ├── agents/         # 8 LangGraph agent nodes
│   ├── graph/          # LangGraph state + pipeline wiring
│   ├── services/       # document, embedding, report and patent corpus services
│   ├── db/             # SQLAlchemy engine + session
│   ├── models/         # ORM models (User, Project, AnalysisReport)
│   ├── schemas/        # Pydantic request/response schemas
│   ├── core/           # config, security, logging
│   ├── utils/          # LLM wrapper, file utilities
│   └── main.py
├── tests/              # pytest test suite
├── uploads/            # Uploaded project documents
├── patent_uploads/     # Original locally imported patent PDFs
├── reports/            # Generated PDF reports (gitignored)
├── chroma_db/          # ChromaDB vector store (gitignored)
├── requirements.txt
├── Dockerfile
├── docker-compose.yml
└── alembic.ini
```

---

## Quick Start

### Option 1 – Docker Compose (recommended)

```powershell
Copy-Item .env.example .env
# Set SECRET_KEY and GROQ_API_KEY in .env before running an analysis.
# If patentiq.db does not exist yet, create the bind-mounted file:
if (!(Test-Path .\patentiq.db)) { New-Item -ItemType File .\patentiq.db }

docker compose up --build
```

API available at: `http://localhost:8000`  
Swagger UI: `http://localhost:8000/docs`
The Compose setup stores SQLite in `patentiq.db` and persists uploads, patent PDFs, reports, and ChromaDB in their backend directories. Existing database files are mounted directly and are not replaced.

### Option 2 – Local Development

```bash
# 1. Create and activate virtual environment in PowerShell
python -m venv venv
.\venv\Scripts\Activate.ps1

# 2. Install dependencies
pip install -r requirements.txt

# 3. Configure environment
Copy-Item .env.example .env
# Set SECRET_KEY before production and GROQ_API_KEY to run analyses

# 4. Start the server (the SQLite schema is created on startup)
uvicorn app.main:app --reload --port 8000
```

---

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login, get JWT tokens |
| POST | `/api/auth/refresh` | Refresh access token |
| GET | `/api/auth/me` | Get current user profile |

### Projects
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/projects/upload` | Upload PDF/DOCX/PPTX |
| GET | `/api/projects` | List user's projects |

### Local Patent Library
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/patents/upload` | Upload and index a readable patent PDF |
| GET | `/api/patents` | List indexed patent records and their source details |

### Analysis
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/analysis/run/{project_id}` | Trigger novelty analysis pipeline |

### Reports
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/reports/{project_id}` | Get report JSON data |
| GET | `/api/reports/download/{project_id}` | Download PDF report |

---

## Multi-Agent Pipeline

| Agent | Responsibility |
|---|---|
| **DocumentParser** | Extract & clean text from PDF/DOCX/PPTX |
| **Summarizer** | Executive summary, project goal & scope |
| **FeatureExtractor** | Problem statement, objectives, tech stack |
| **InnovationDetector** | Novel components, unique contributions |
| **SimilarityAnalyzer** | ChromaDB search across locally indexed patent PDFs and uploaded projects |
| **NoveltyAssessor** | novelty_score + patentability_score (0–100) |
| **RecommendationAgent** | Actionable improvement suggestions |
| **ReportGenerator** | Compiled PDF report via ReportLab |

---

## Running Tests

```powershell
python -m pytest -p no:cacheprovider tests -q
```

The test fixtures use temporary SQLite, upload/report directories, and an isolated ChromaDB path. Do not point tests at the demo database or ChromaDB directory.

---

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `SECRET_KEY` | JWT signing key | (required) |
| `GROQ_API_KEY` | Groq API key used for analysis | (required) |
| `GROQ_MODEL` | Groq model name | Configured in `.env.example` |
| `DATABASE_URL` | SQLAlchemy async SQLite connection URL | `sqlite+aiosqlite:///./patentiq.db` |
| `CORS_ALLOWED_ORIGINS` | JSON array of allowed browser origins | Local development origins |
| `GROQ_TIMEOUT_SECONDS` | LLM request timeout | `60` |
| `GROQ_MAX_RETRIES` | LLM retry count | `1` |
| `EMBEDDING_MODEL` | SentenceTransformer model | `all-MiniLM-L6-v2` |
| `MAX_FILE_SIZE_MB` | Upload file size limit | `50` |
| `CHROMA_DB_PATH` | Persistent ChromaDB directory | `./chroma_db` |
| `PATENT_UPLOAD_DIR` | Original imported patent PDF directory | `./patent_uploads` |

## Local Patent Corpus

Patent similarity search uses the `patent_corpus` ChromaDB collection and does not require EPO OPS credentials or an external patent API. Uploaded PDF text is embedded and indexed locally; the original PDF is saved under `PATENT_UPLOAD_DIR`. The patent corpus is separate from the collection of user project documents.

Signed-in users can add a PDF in the **Patent Library** page, including optional title, publication number, jurisdiction, and source URL. The library is shared across authenticated users of this application. Only PDFs with selectable text are accepted; scanned documents must be OCR-processed before indexing.

To bulk import a downloaded directory of patent PDFs, run from the backend directory:

```powershell
python -m app.services.import_patent_directory "C:\path\to\patent-pdfs"
```

The importer searches the directory recursively. It records the filename as the title when no metadata is provided and reports PDFs that could not be indexed. Results display the stored source details and any source URL. The novelty score is an AI estimate based on this local corpus; corpus coverage and freshness depend on the files imported and are not a guarantee of patentability.

Search backends implement `PatentSearchProvider` in `app/services/patent_search_service.py`, so a future EPO OPS adapter can be added without coupling the analysis agent to a specific provider.

---

## Extending with Future Agents

The pipeline is designed for easy extension. To add a new agent (e.g., Patent Search Agent):

1. Create `app/agents/patent_search_agent.py`
2. Add new fields to `AgentState` in `app/graph/state.py`
3. Register the node in `app/graph/pipeline.py` and wire it into the graph

---

## License

MIT
