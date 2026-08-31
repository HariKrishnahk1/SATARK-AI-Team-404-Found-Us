import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_root():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert "SATARK AI" in data["system"]

def test_analytics_stats():
    response = client.get("/api/v1/analytics/stats")
    assert response.status_code == 200
    data = response.json()
    assert data["total_challenges"] >= 3
    assert data["estimated_beneficiaries"] >= 1000

def test_list_challenges():
    response = client.get("/api/v1/challenges")
    assert response.status_code == 200
    challenges = response.json()
    assert len(challenges) >= 3
    assert challenges[0]["district"] in ["Ranchi", "Dhanbad", "East Singhbhum"]

def test_ai_classification_fallback():
    payload = {
        "title": "Pothole near school causing accidents",
        "citizen_description": "A very big hole in the middle of the road near school.",
        "latitude": 23.3441,
        "longitude": 85.3096,
        "address": "Main Road, Ranchi",
        "district": "Ranchi"
    }
    response = client.post("/api/v1/challenges", json=payload)
    assert response.status_code == 200
    ch = response.json()
    assert ch["priority_score"] > 70
    assert ch["category"] in ["Urban Infrastructure", "Road Damage & Traffic Safety"]

def test_login():
    payload = {
        "email": "admin@satark.gov.in",
        "password": "password123"
    }
    response = client.post("/api/v1/auth/login", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["role"] == "SUPER_ADMIN"
