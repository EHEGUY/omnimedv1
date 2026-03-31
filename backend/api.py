from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware 
from contextlib import asynccontextmanager
from unsloth import FastLanguageModel
from PIL import Image
import torch
import io

@asynccontextmanager
async def lifespan(app: FastAPI):
    print(" [SINGLETON] Loading OmniMed Engine into VRAM...")
    model_name = "unsloth/medgemma-1.5-4b-it-bnb-4bit"
    model, processor = FastLanguageModel.from_pretrained(
        model_name=model_name,
        load_in_4bit=True,
        device_map="cuda",
    )
    app.state.model = model
    app.state.processor = processor
    print(" [SINGLETON] Engine is Locked and laka lakaaaa.")
    yield 
    del app.state.model
    del app.state.processor
    torch.cuda.empty_cache()

app = FastAPI(lifespan=lifespan)

# 2. ADD THIS SECTION RIGHT HERE
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],      
    allow_credentials=True,
    allow_methods=["*"],      # Allows GET, POST, etc.
    allow_headers=["*"],      # Allows sending files and JSON
)


@app.get("/health")
async def health_check():
    # This checks if the model was successfully loaded into the app state
    if hasattr(app.state, "model") and app.state.model is not None:
        return {
            "status": "online",
            "device": str(torch.cuda.get_device_name(0)),
            "engine": "MedGemma-4B-VRAM-Locked"
        }
    return {"status": "loading", "message": "Model is still initializing..."}






@app.post("/analyze")
async def analyze_scan(
    image: UploadFile = File(...), 
    prompt: str = Form("Act as an expert radiologist.")
):
    model = app.state.model
    processor = app.state.processor

    image_data = await image.read()

    scan_image = Image.open(io.BytesIO(image_data)).convert("RGB").resize((512, 512))

    messages = [{"role": "user", "content": [{"type": "image", "image": scan_image}, {"type": "text", "text": prompt}]}]
    
    prompt_text = processor.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
    inputs = processor(text=prompt_text, images=scan_image, return_tensors="pt").to("cuda")

    with torch.inference_mode():
        outputs = model.generate(**inputs, max_new_tokens=300)
        response = processor.decode(outputs[0][inputs["input_ids"].shape[-1]:], skip_special_tokens=True)
    
    return {"status": "success", "report": response}