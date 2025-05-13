from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)

def test_chat_echo():
    body = {"message": "ping"}
    resp = client.post("/chat", json=body)
    assert resp.status_code == 200
    # In CI we don't set OPENAI_API_KEY so the endpoint should echo.
    assert resp.json()["reply"].lower().startswith("echo") 