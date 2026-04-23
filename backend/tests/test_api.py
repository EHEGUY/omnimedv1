import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import pytest
from fastapi.testclient import TestClient
from api import app
from PIL import Image
import io
import base64
import json

# Default API key used in api.py
API_KEY = "your-default-secret-key"
HEADERS = {"x-api-key": API_KEY}

@pytest.fixture(scope="module")
def client():
    """Create a TestClient that triggers the lifespan (startup/shutdown),
    ensuring ResNet and other global state are properly initialized."""
    with TestClient(app) as c:
        yield c

def create_dummy_image() -> bytes:
    """Create a simple 100x100 RGB image in memory and return as bytes."""
    img = Image.new("RGB", (100, 100), color="red")
    img_byte_arr = io.BytesIO()
    img.save(img_byte_arr, format="PNG")
    return img_byte_arr.getvalue()

def test_health_check(client):
    """Verify the health endpoint returns a 200 OK and valid JSON structure."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert data["status"] == "online"

def test_missing_api_key(client):
    """Verify that requests without the x-api-key are rejected."""
    # /analyze-dermo requires auth
    img_bytes = create_dummy_image()
    files = {"image": ("test.png", img_bytes, "image/png")}
    response = client.post("/analyze-dermo", files=files)
    assert response.status_code == 403
    assert response.json()["detail"] == "Could not validate credentials"

def test_analyze_endpoint_mock(client):
    """Test the /analyze endpoint in mock mode with a dummy image and prompt."""
    img_bytes = create_dummy_image()
    files = {"image": ("test.png", img_bytes, "image/png")}
    data = {"prompt": "Analyze this test image"}
    
    response = client.post("/analyze", files=files, data=data, headers=HEADERS)
    assert response.status_code == 200
    res_data = response.json()
    
    assert res_data["status"] == "success"
    assert "mock" in res_data
    # If it's truly falling back to mock mode
    if res_data["mock"] is True:
        assert "MOCK AI MODE" in res_data["report"]
    else:
        assert isinstance(res_data["report"], str)

def test_chat_endpoint_mock(client):
    """Test the /chat endpoint with history."""
    img_bytes = create_dummy_image()
    files = {"image": ("test.png", img_bytes, "image/png")}
    
    # Simulate history containing the initial prompt
    history = [
        {"role": "user", "content": "What do you see in this scan?"}
    ]
    data = {"history": json.dumps(history)}
    
    response = client.post("/chat", files=files, data=data, headers=HEADERS)
    assert response.status_code == 200
    res_data = response.json()
    
    assert res_data["status"] == "success"
    assert "mock" in res_data
    if res_data["mock"] is True:
        assert "MOCK AI MODE" in res_data["response"]
        assert "What do you see in this scan?" in res_data["response"]

def test_analyze_dermo_gradcam(client):
    """Test the Grad-CAM generation endpoint using ResNet-18."""
    img_bytes = create_dummy_image()
    files = {"image": ("test.png", img_bytes, "image/png")}
    
    response = client.post("/analyze-dermo", files=files, headers=HEADERS)
    assert response.status_code == 200
    res_data = response.json()
    
    assert res_data["status"] == "success"
    assert "heatmap" in res_data
    assert res_data["heatmap"].startswith("data:image/jpeg;base64,")
    
    # Try decoding the base64 part
    b64_str = res_data["heatmap"].split(",")[1]
    decoded_bytes = base64.b64decode(b64_str)
    
    # Verify it can be opened as an image
    heatmap_img = Image.open(io.BytesIO(decoded_bytes))
    assert heatmap_img.size == (100, 100)  # Should match our dummy image size

def test_load_and_unload_model(client):
    """Test the hardware lifecycle endpoints."""
    # Unload
    response = client.post("/unload-model", headers=HEADERS)
    assert response.status_code == 200
    assert response.json() == {"status": "success", "engine": "mock"}

    # Load (this might fail gracefully if no CUDA/VRAM, but should still return 200 with an error status inside JSON)
    response = client.post("/load-model", headers=HEADERS)
    assert response.status_code == 200
    res_data = response.json()
    assert res_data["status"] in ["success", "error"]
    if res_data["status"] == "error":
        assert "reason" in res_data

def test_get_all_doctors(client):
    """Test that GET /doctors returns a list of doctors."""
    response = client.get("/doctors")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert isinstance(data["doctors"], list)
    assert data["count"] == len(data["doctors"])
    assert data["count"] > 0  # seed data should have doctors

def test_filter_doctors_by_specialization(client):
    """Test that GET /doctors?specialization=Dermatology filters correctly."""
    response = client.get("/doctors?specialization=Dermatology")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    for doc in data["doctors"]:
        assert doc["specialization"] == "Dermatology"

def test_get_single_doctor(client):
    """Test that GET /doctors/{id} returns a single doctor."""
    # First get a valid ID
    all_res = client.get("/doctors")
    first_id = all_res.json()["doctors"][0]["id"]

    response = client.get(f"/doctors/{first_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["doctor"]["id"] == first_id

def test_get_nonexistent_doctor(client):
    """Test that GET /doctors/{id} returns 404 for invalid ID."""
    response = client.get("/doctors/does-not-exist")
    assert response.status_code == 404
