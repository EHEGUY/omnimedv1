from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from unsloth import FastLanguageModel
from PIL import Image
import torch
import io

# 1. Start the API
app = FastAPI(title="OmniMed AI Engine")

# Allow your Vercel frontend to talk to this local server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_methods=["*"],
    allow_headers=["*"],
)

print(" Loading OmniMed Engine into VRAM...")
model_name = "unsloth/medgemma-1.5-4b-it-bnb-4bit"
model, processor = FastLanguageModel.from_pretrained(
    model_name=model_name,
    load_in_4bit=True,
    device_map="cuda",
)
print(" API is Live and Ready for Scans.")

# 2. The API Endpoint
@app.post("/analyze")
async def analyze_scan(
    image: UploadFile = File(...), 
    prompt: str = Form("Act as an expert radiologist. Analyze this scan.")
):
    # Read the image from the website
    image_data = await image.read()
    scan_image = Image.open(io.BytesIO(image_data)).convert("RGB")

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
    
    # Process and Generate
    prompt_text = processor.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
    inputs = processor(text=prompt_text, images=scan_image, return_tensors="pt").to("cuda")

    with torch.inference_mode():
        outputs = model.generate(**inputs, max_new_tokens=300)
        response = processor.decode(outputs[0][inputs["input_ids"].shape[-1]:], skip_special_tokens=True)
    
    # Send the JSON back to the website
    return {"status": "success", "report": response}