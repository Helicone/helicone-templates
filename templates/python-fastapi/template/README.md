# Python FastAPI + Helicone Template

Minimal FastAPI server with a `/chat` endpoint that forwards requests to OpenAI **via [Helicone](https://www.helicone.ai/)** so you can monitor usage out-of-the-box.

## 1. Setup

```bash
# Install deps
pip install -r requirements.txt

# Copy environment variables
cp env.example .env  # then edit .env and add your keys
```

## 2. Run locally

```bash
uvicorn app.main:app --reload
```

Open <http://localhost:8000/docs> to try the interactive Swagger UI.

## 3. Test

```bash
pytest -q
```

## 4. Deploy

This app is deployment-agnostic; you can deploy to Fly.io, Railway, Render, etc. Make sure to set `OPENAI_API_KEY` and (optionally) `HELICONE_API_KEY` in your environment.

---

### How the Helicone integration works

1. The OpenAI client is configured to use the Helicone proxy host (`https://oai.hconeai.com/v1`).
2. If you provide a `HELICONE_API_KEY`, the app adds the `Helicone-Auth` header so the request is authenticated in your Helicone dashboard.
3. All requests are visible in your Helicone workspace—no additional instrumentation required.
