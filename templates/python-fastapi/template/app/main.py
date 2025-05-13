from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import os
from typing import Dict, Any

try:
    import openai
except ImportError:  # pragma: no cover
    # The template's tests can still run without installing openai.
    openai = None  # type: ignore

app = FastAPI(title="Helicone Chat Echo")


class ChatRequest(BaseModel):
    message: str


@app.post("/chat")
async def chat(req: ChatRequest) -> Dict[str, Any]:
    """Simple chat endpoint.

    * If `OPENAI_API_KEY` is provided, the request is forwarded to OpenAI
      through the Helicone proxy so you can observe traces in your Helicone
      dashboard.
    * Otherwise, the endpoint simply echoes the incoming message so the
      template works out-of-the-box without any credentials.
    """

    # Attempt to call OpenAI only when credentials are configured *and* the
    # library is available. This keeps the template lightweight and avoids
    # network calls during CI tests where no keys are present.
    if openai and os.getenv("OPENAI_API_KEY"):
        try:
            # Configure OpenAI client to route traffic through Helicone.
            openai.api_key = os.getenv("OPENAI_API_KEY")
            openai.api_base = "https://oai.hconeai.com/v1"

            # Attach Helicone Auth header if key is present.
            headers = {}
            helicone_key = os.getenv("HELICONE_API_KEY")
            if helicone_key:
                headers["Helicone-Auth"] = f"Bearer {helicone_key}"

            # This call uses the legacy v0.x openai-python interface for
            # broader compatibility.
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": req.message}],
                headers=headers or None,
            )
            content: str = response.choices[0].message.get("content", "")  # type: ignore
            return {"reply": content}
        except Exception as exc:  # pragma: no cover – network/credentials issue
            # Surface any errors from OpenAI/Helicone so they can be debugged.
            raise HTTPException(status_code=500, detail=str(exc))

    # Fallback: echo the message when no API key is configured.
    return {"reply": f"Echo: {req.message}"} 