from fastapi import FastAPI, File, UploadFile, Form, Depends, HTTPException, Security
from fastapi.security import APIKeyHeader
from fastapi.middleware.cors import CORSMiddleware
from starlette.status import HTTP_403_FORBIDDEN
from PIL import Image
import torch
import io
import os
import json
import sys
import base64
import cv2
import numpy as np
import torchvision.models as models
import torchvision.transforms as transforms
from contextlib import asynccontextmanager

# Optional AI engines. Backend must boot without them.
_UNSLOTH_IMPORT_ERROR = None
try:
    from unsloth import FastLanguageModel  # type: ignore
except Exception as e:
    FastLanguageModel = None
    _UNSLOTH_IMPORT_ERROR = str(e)

_TRANSFORMERS_IMPORT_ERROR = None
try:
    from transformers import (  # type: ignore
        AutoModelForCausalLM,
        AutoProcessor,
        AutoTokenizer,
        BitsAndBytesConfig,
    )
except Exception as e:
    AutoModelForCausalLM = None
    AutoProcessor = None
    AutoTokenizer = None
    BitsAndBytesConfig = None
    _TRANSFORMERS_IMPORT_ERROR = str(e)

resnet_model = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global resnet_model
    resnet_model = models.resnet18(weights=models.ResNet18_Weights.DEFAULT)
    resnet_model.eval()

    if _AUTOSTART:
        try:
            _load_model()
        except Exception as e:
            print(f" Autostart model load failed; staying in MOCK mode. Error: {e}")
    yield

# 1. Start the API
app = FastAPI(title="OmniMed AI Engine", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Key Validation setup
API_KEY_NAME = "x-api-key"
API_KEY = os.getenv("OMNIMED_API_KEY", "your-default-secret-key")
api_key_header = APIKeyHeader(name=API_KEY_NAME, auto_error=False)

async def get_api_key(api_key_header: str = Security(api_key_header)):
    if api_key_header == API_KEY:
        return api_key_header
    raise HTTPException(
        status_code=HTTP_403_FORBIDDEN, detail="Could not validate credentials"
    )

def _mock_template(user_input: str) -> str:
    return (
        "MOCK AI MODE (model unavailable)\n\n"
        f"Input:\n{user_input}\n\n"
        "Preliminary summary:\n"
        "- The AI model is not loaded in this environment, so this is a placeholder response.\n"
        "- Grad-CAM / image-processing endpoints remain functional.\n\n"
        "Next steps:\n"
        "- Install `unsloth` in the same Python environment running this server and ensure CUDA works.\n"
    )

def _mock_report(prompt: str) -> str:
    safe_prompt = (prompt or "").strip()
    if not safe_prompt:
        safe_prompt = "Act as an expert clinician."
    return _mock_template(safe_prompt)

def _mock_chat(history_list: list[dict]) -> str:
    last_user = None
    for msg in reversed(history_list or []):
        if msg.get("role") == "user":
            last_user = (msg.get("content") or "").strip()
            break
    return _mock_template(last_user)

def _get_device() -> str:
    return "cuda" if torch.cuda.is_available() else "cpu"

model = None
processor = None  # may be a tokenizer or a multimodal processor
ai_mode = "mock"
ai_error: str | None = None
_MODEL_NAME = os.getenv("OMNIMED_MODEL_ID", "unsloth/medgemma-1.5-4b-it-bnb-4bit")

# On low-VRAM laptops, autoloading at import time can crash the process.
# Default: do NOT autoload; call /load-model (or set OMNIMED_AUTOSTART=1).
_AUTOSTART = os.getenv("OMNIMED_AUTOSTART", "1") == "1"

engine_pref = os.getenv("OMNIMED_ENGINE", "transformers" if sys.platform.startswith("win") else "unsloth").lower()

print(f" Python: {sys.executable}")

def _load_model() -> None:
    """Load MedGemma into VRAM once. Raises on failure."""
    global model, processor, ai_mode, ai_error

    if model is not None and processor is not None and ai_mode.startswith("medgemma"):
        return

    if _get_device() != "cuda":
        ai_mode = "mock"
        ai_error = "cuda_not_available"
        raise RuntimeError("CUDA not available")

    # Small perf/mem tweaks for laptops
    try:
        torch.backends.cuda.matmul.allow_tf32 = True
    except Exception:
        pass

    if engine_pref == "unsloth":
        if FastLanguageModel is None:
            ai_mode = "mock"
            ai_error = f"unsloth_unavailable: {_UNSLOTH_IMPORT_ERROR or 'not installed'}"
            raise RuntimeError(ai_error)

        print(" Loading OmniMed Engine into VRAM (Unsloth)...")
        model, processor = FastLanguageModel.from_pretrained(
            model_name=_MODEL_NAME,
            load_in_4bit=True,
            device_map="cuda",
        )
        ai_mode = "medgemma-unsloth"
        ai_error = None
        print(" API is Live and Ready for Scans.")
        return

    # Transformers engine (default on Windows)
    if AutoModelForCausalLM is None or BitsAndBytesConfig is None:
        ai_mode = "mock"
        ai_error = f"transformers_unavailable: {_TRANSFORMERS_IMPORT_ERROR or 'not installed'}"
        raise RuntimeError(ai_error)

    print(" Loading OmniMed Engine into VRAM (Transformers)...")
    bnb_config = BitsAndBytesConfig(
        load_in_4bit=True,
        bnb_4bit_compute_dtype=torch.float16,
        bnb_4bit_use_double_quant=True,
        bnb_4bit_quant_type="nf4",
    )

    model = AutoModelForCausalLM.from_pretrained(
        _MODEL_NAME,
        device_map="cuda",
        quantization_config=bnb_config,
        torch_dtype=torch.float16,
        low_cpu_mem_usage=True,
    )

    proc = None
    if AutoProcessor is not None:
        try:
            proc = AutoProcessor.from_pretrained(_MODEL_NAME)
        except Exception:
            proc = None
    if proc is None and AutoTokenizer is not None:
        proc = AutoTokenizer.from_pretrained(_MODEL_NAME, use_fast=True)
    processor = proc

    ai_mode = "medgemma-transformers"
    ai_error = None
    print(" API is Live and Ready for Scans.")


def _unload_model() -> None:
    """Free VRAM (best-effort)."""
    global model, processor, ai_mode, ai_error
    model = None
    processor = None
    ai_mode = "mock"
    ai_error = None
    if torch.cuda.is_available():
        torch.cuda.empty_cache()





@app.post("/load-model")
async def load_model_endpoint(api_key: str = Depends(get_api_key)):
    try:
        _load_model()
        return {"status": "success", "engine": ai_mode, "model": _MODEL_NAME}
    except Exception as e:
        return {"status": "error", "engine": "mock", "reason": str(e)}


@app.post("/unload-model")
async def unload_model_endpoint(api_key: str = Depends(get_api_key)):
    _unload_model()
    return {"status": "success", "engine": "mock"}

def _generate_medgemma(messages: list[dict], scan_image: Image.Image) -> str:
    """
    Supports both:
    - multimodal processors (processor(text=..., images=..., return_tensors=...))
    - text tokenizers (apply_chat_template + return_tensors) as a fallback.
    """
    if model is None or processor is None:
        raise RuntimeError("AI engine not loaded")

    # Path A: multimodal processor API (preferred)
    try:
        prompt_text = processor.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
        inputs = processor(text=prompt_text, images=scan_image, return_tensors="pt").to("cuda")
        with torch.inference_mode():
            max_new_tokens = int(os.getenv("OMNIMED_MAX_NEW_TOKENS", "4096"))
            outputs = model.generate(**inputs, max_new_tokens=max_new_tokens)
        input_len = inputs["input_ids"].shape[-1]
        if hasattr(processor, "decode"):
            return processor.decode(outputs[0][input_len:], skip_special_tokens=True)
        if hasattr(processor, "batch_decode"):
            return processor.batch_decode(outputs[:, input_len:], skip_special_tokens=True)[0]
        return str(outputs)
    except Exception as e:
        print(f"Warning: Multimodal generation failed: {e}. Falling back to text-only mode.")
        fallback_warning = "[Warning: Multimodal processing failed, falling back to text-only mode]\n\n"
        # Path B: tokenizer-only (will ignore image content, but still produces a valid response)
        prompt_ids = processor.apply_chat_template(
            [{"role": "user", "content": (messages[-1].get("content") or [])}],
            add_generation_prompt=True,
            return_tensors="pt",
        ).to("cuda")
        with torch.inference_mode():
            max_new_tokens = int(os.getenv("OMNIMED_MAX_NEW_TOKENS", "4096"))
            outputs = model.generate(input_ids=prompt_ids, max_new_tokens=max_new_tokens)
        if hasattr(processor, "decode"):
            return fallback_warning + processor.decode(outputs[0][prompt_ids.shape[-1]:], skip_special_tokens=True)
        if hasattr(processor, "batch_decode"):
            return fallback_warning + processor.batch_decode(outputs[:, prompt_ids.shape[-1]:], skip_special_tokens=True)[0]
        return fallback_warning + str(outputs)

# 2. The API Endpoint
@app.post("/analyze")
async def analyze_scan(
    image: UploadFile = File(...), 
    prompt: str = Form("Act as an expert radiologist. Analyze this scan."),
    api_key: str = Depends(get_api_key)
):
    # Reads the image from the website
    image_data = await image.read()
    try:
        scan_image = Image.open(io.BytesIO(image_data)).convert("RGB")
    except Exception as e:
        return {"status": "error", "message": f"Failed to open image file: {str(e)}. Please ensure it is a valid JPG or PNG."}

    # Format the prompt
    messages = [
        {
            "role": "user", 
            "content": [
                {"type": "image", "image": scan_image},
                {"type": "text", "text": prompt}
            ]
        }
    ]
    
    if model is None or processor is None:
        return {"status": "success", "report": _mock_report(prompt), "mock": True}

    try:
        response = _generate_medgemma(messages, scan_image)
    except Exception as e:
        return {"status": "error", "message": f"Inference error: {str(e)}"}

    return {"status": "success", "report": response, "mock": False}

# 3. Chat Endpoint
@app.post("/chat")
async def chat_scan(
    image: UploadFile = File(...), 
    history: str = Form(...),
    api_key: str = Depends(get_api_key)
):
    try:
        history_list = json.loads(history)
    except json.JSONDecodeError as e:
        return {"status": "error", "message": f"Invalid JSON in history parameter: {str(e)}"}
    
    image_data = await image.read()
    try:
        scan_image = Image.open(io.BytesIO(image_data)).convert("RGB")
    except Exception as e:
        return {"status": "error", "message": f"Failed to open image file: {str(e)}. Please ensure it is a valid JPG or PNG."}

    messages = []
    for i, msg in enumerate(history_list):
        if i == 0 and msg["role"] == "user":
            messages.append({
                "role": "user",
                "content": [
                    {"type": "image", "image": scan_image},
                    {"type": "text", "text": msg["content"]}
                ]
            })
        else:
            messages.append(msg)
    
    if model is None or processor is None:
        return {"status": "success", "response": _mock_chat(history_list), "mock": True}

    try:
        response = _generate_medgemma(messages, scan_image)
    except Exception as e:
        return {"status": "error", "message": f"Inference error: {str(e)}"}

    return {"status": "success", "response": response, "mock": False}

@app.get("/health")
async def health():
    if ai_mode.startswith("medgemma") and torch.cuda.is_available():
        return {"status": "online", "engine": ai_mode, "device": torch.cuda.get_device_name(0)}
    return {
        "status": "online",
        "engine": "mock",
        "reason": ai_error or "unknown",
        "python": sys.executable,
        "hint": "Use scripts\\setup.ps1 then scripts\\run-backend.ps1 so the server always runs in the project .venv.",
    }



# 4. Dermatology Grad-CAM Endpoint
@app.post("/analyze-dermo")
async def analyze_dermo_scan(
    image: UploadFile = File(...),
    api_key: str = Depends(get_api_key)
):
    image_data = await image.read()
    try:
        orig_img = Image.open(io.BytesIO(image_data)).convert("RGB")
    except Exception as e:
        return {"status": "error", "message": f"Failed to process image for Grad-CAM: {str(e)}"}

    # --- VRAM management: free MedGemma before loading ResNet onto GPU ---
    medgemma_was_loaded = ai_mode.startswith("medgemma")
    if medgemma_was_loaded:
        print(" [VRAM] Unloading MedGemma to make room for Grad-CAM analysis...")
        _unload_model()

    try:
        # Preprocess
        transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
        ])
        input_tensor = transform(orig_img).unsqueeze(0)

        # Use global resnet_model
        global resnet_model
        dermo_model = resnet_model

        gradients = []
        activations = []

        def backward_hook(module, grad_input, grad_output):
            gradients.append(grad_output[0])

        def forward_hook(module, input, output):
            activations.append(output)

        # Hook the last conv layer
        target_layer = dermo_model.layer4[-1].conv2
        fwd_handle = target_layer.register_forward_hook(forward_hook)
        bwd_handle = target_layer.register_full_backward_hook(backward_hook)

        # Forward pass
        output = dermo_model(input_tensor)
        pred_class = output.argmax(dim=1).item()

        # Backward pass
        dermo_model.zero_grad()
        output[0, pred_class].backward()

        # Remove hooks immediately to avoid accumulation across requests
        fwd_handle.remove()
        bwd_handle.remove()

        # Calculate CAM
        grads = gradients[0].cpu().data.numpy()[0]
        acts = activations[0].cpu().data.numpy()[0]

        weights = np.mean(grads, axis=(1, 2))
        cam = np.zeros(acts.shape[1:], dtype=np.float32)
        for i, w in enumerate(weights):
            cam += w * acts[i]

        cam = np.maximum(cam, 0)
        cam = cv2.resize(cam, (orig_img.width, orig_img.height))
        # Avoid division by zero
        cam_max = np.max(cam)
        if cam_max > 0:
            cam = cam / cam_max

        # Convert to heatmap
        heatmap = cv2.applyColorMap(np.uint8(255 * cam), cv2.COLORMAP_JET)

        # Overlay on original image
        orig_cv = cv2.cvtColor(np.array(orig_img), cv2.COLOR_RGB2BGR)
        overlay = cv2.addWeighted(orig_cv, 0.6, heatmap, 0.4, 0)

        # Convert back to RGB and base64
        overlay_rgb = cv2.cvtColor(overlay, cv2.COLOR_BGR2RGB)
        result_img = Image.fromarray(overlay_rgb)

        buffered = io.BytesIO()
        result_img.save(buffered, format="JPEG")
        img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")

    finally:
        # --- VRAM management: reload MedGemma if it was active before ---
        if medgemma_was_loaded:
            print(" [VRAM] Reloading MedGemma after Grad-CAM analysis...")
            try:
                _load_model()
            except Exception as e:
                print(f" [VRAM] Warning: Failed to reload MedGemma after Grad-CAM: {e}")

    return {
        "status": "success", 
        "heatmap": f"data:image/jpeg;base64,{img_str}"
    }

# ─── 5. Doctor Profiles ───────────────────────────────────────────────────────
_DOCTORS_PATH = os.path.join(os.path.dirname(__file__), "data", "doctors.json")

def _load_doctors() -> list[dict]:
    """Load doctors from the JSON seed file."""
    try:
        with open(_DOCTORS_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        return []

@app.get("/doctors")
async def get_doctors(specialization: str | None = None):
    """Return all doctors, optionally filtered by specialization."""
    doctors = _load_doctors()
    if specialization:
        doctors = [d for d in doctors if d["specialization"].lower() == specialization.lower()]
    return {"status": "success", "doctors": doctors, "count": len(doctors)}

@app.get("/doctors/{doctor_id}")
async def get_doctor(doctor_id: str):
    """Return a single doctor by ID."""
    doctors = _load_doctors()
    for d in doctors:
        if d["id"] == doctor_id:
            return {"status": "success", "doctor": d}
    raise HTTPException(status_code=404, detail=f"Doctor '{doctor_id}' not found")

if __name__ == "__main__":
    import uvicorn
    # Pass the app object directly to avoid re-importing `api.py` (which can double-load the model).
    uvicorn.run(app, host="127.0.0.1", port=8000, reload=False, workers=1)