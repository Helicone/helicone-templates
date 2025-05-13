# Python FastAPI + Helicone Template

> **Version:** 0.1.0 _(work-in-progress)_

This template spins up a minimal FastAPI server with a single `/chat` endpoint that proxies your request to OpenAI **through the Helicone proxy** so you can monitor and analyze usage out-of-the-box.

## Quick Start

1.  Clone the template or use the `create-helicone` CLI:

    ```bash
    npx create-helicone --template python-fastapi my-app && cd my-app
    ```

2.  Copy the example environment file and add your keys:

    ```bash
    cp .env.example .env
    # then edit .env and set OPENAI_API_KEY (+ optional HELICONE_API_KEY)
    ```

3.  Install dependencies & run the server:

    ```bash
    pip install -r requirements.txt
    uvicorn app.main:app --reload
    ```

4.  Send a test request:

    ```bash
    curl -X POST http://localhost:8000/chat \
      -H "Content-Type: application/json" \
      -d '{"message": "Hello!"}'
    ```

---

Detailed explanation of the integration, code walkthrough, and troubleshooting tips coming soon.
