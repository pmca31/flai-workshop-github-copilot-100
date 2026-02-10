from fastapi.testclient import TestClient
from src.app import app

client = TestClient(app)

def test_get_activities():
    response = client.get("/activities")
    assert response.status_code == 200
    assert isinstance(response.json(), dict)

def test_signup_and_unregister():
    activity = "Basketball Team"
    email = "testuser@example.com"
    # Signup
    signup_resp = client.post(f"/activities/{activity}/signup?email={email}")
    assert signup_resp.status_code == 200 or signup_resp.status_code == 400
    # Unregister
    unregister_resp = client.post(f"/activities/{activity}/unregister?email={email}")
    assert unregister_resp.status_code == 200 or unregister_resp.status_code == 400

def test_signup_nonexistent_activity():
    email = "ghost@example.com"
    resp = client.post("/activities/Nonexistent Activity/signup?email=" + email)
    assert resp.status_code == 404
    assert resp.json()["detail"] == "Activity not found"


def test_unregister_non_participant():
    activity = "Drama Club"
    email = "not_signed_up@example.com"
    resp = client.post(f"/activities/{activity}/unregister?email={email}")
    assert resp.status_code == 400
    assert resp.json()["detail"] == "Participant not found"


def test_max_participants_limit():
    activity = "Art Workshop"
    emails = [f"user{i}@example.com" for i in range(1, 22)]
    # Fill up the activity
    for email in emails[:20]:
        resp = client.post(f"/activities/{activity}/signup?email={email}")
        assert resp.status_code == 200 or resp.status_code == 400
    # Try to add one more
    resp = client.post(f"/activities/{activity}/signup?email={emails[20]}")
    assert resp.status_code == 400
    assert resp.json()["detail"] == "Activity is full"


def test_static_index():
    resp = client.get("/static/index.html")
    assert resp.status_code == 200


def test_signup_twice():
    activity = "Soccer Club"
    email = "twiceuser@example.com"
    # First signup
    resp1 = client.post(f"/activities/{activity}/signup?email={email}")
    assert resp1.status_code == 200
    # Second signup should fail
    resp2 = client.post(f"/activities/{activity}/signup?email={email}")
    assert resp2.status_code == 400
    assert resp2.json()["detail"] == "Student already signed up for this activity"
