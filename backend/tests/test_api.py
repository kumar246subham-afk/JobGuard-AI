import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert data["service"] == "JobGuard AI"
    assert "version" in data

def test_dataset_status_endpoint():
    response = client.get("/api/dataset/status")
    assert response.status_code == 200
    data = response.json()
    assert "dataset_found" in data
    assert isinstance(data["dataset_found"], bool)
    if data["dataset_found"]:
        assert data["row_count"] is not None
        assert data["row_count"] > 0
    else:
        assert "fake_job_postings.csv" in data["message"]

def test_model_status_endpoint():
    response = client.get("/api/model/status")
    assert response.status_code == 200
    data = response.json()
    assert "is_trained" in data
    assert isinstance(data["is_trained"], bool)
    if data["is_trained"]:
        assert data["model_name"] is not None
        assert data["metrics"] is not None
    else:
        assert "how_to_train" in data

def test_predict_endpoint_success():
    payload = {
        "title": "Software Engineer",
        "description": "Looking for Python and FastAPI full stack developer with cloud experience.",
        "company_name": "Test Labs"
    }
    response = client.post("/api/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "prediction" in data
    assert "risk_level" in data
    assert "risk_score" in data
    assert "confidence_score" in data

def test_predict_endpoint_when_model_not_trained(monkeypatch):
    import backend.app.api.predict as predict_module
    monkeypatch.setattr(predict_module, "is_model_trained", lambda: False)
    payload = {
        "title": "Software Engineer",
        "description": "Looking for Python and FastAPI full stack developer.",
        "company_name": "Test Labs"
    }
    response = client.post("/api/predict", json=payload)
    assert response.status_code == 503
    data = response.json()
    assert "ModelNotTrained" in data["detail"]
