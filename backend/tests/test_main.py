import pytest
from main import app

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_health_check(client):
    response = client.get("/")
    assert response.status_code == 200
    assert response.json == {"status": "ok"}

def test_get_density(client):
    response = client.get("/api/density")
    assert response.status_code == 200
    assert isinstance(response.json, list)

def test_chat_empty_query(client):
    response = client.post("/api/chat", json={"query": ""})
    assert response.status_code == 400

def test_chat_valid_query(client):
    response = client.post("/api/chat", json={"query": "where is food?", "language": "en", "location": "Gate A"})
    assert response.status_code == 200
    assert "reply" in response.json
    assert "intent" in response.json

def test_incidents_flow(client):
    # 1. Post incident
    res1 = client.post("/api/incidents", json={"type": "spill", "location": "Gate A"})
    assert res1.status_code == 201
    incident_id = res1.json["id"]
    
    # 2. Get incidents
    res2 = client.get("/api/incidents")
    assert res2.status_code == 200
    assert len(res2.json) >= 1
    assert res2.json[0]["id"] == incident_id
    
    # 3. Resolve incident
    res3 = client.post(f"/api/incidents/{incident_id}/resolve")
    assert res3.status_code == 200
    
    # 4. Check resolved
    res4 = client.get("/api/incidents")
    assert incident_id not in [i["id"] for i in res4.json]

def test_route_missing_dest(client):
    response = client.post("/api/route", json={"current_location": "", "destination": ""})
    assert response.status_code == 400

def test_route_valid(client):
    response = client.post("/api/route", json={"current_location": "A", "destination": "B", "needs_wheelchair": True})
    assert response.status_code == 200
    data = response.json
    assert "route" in data
    assert data["stepFree"] is True
