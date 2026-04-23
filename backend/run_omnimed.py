from unsloth import FastLanguageModel
import torch

# 1. The Model ID (Optimized 4-bit version)
model_name = "unsloth/medgemma-1.5-4b-it-bnb-4bit"

print(" Initializing OmniMed Engine on RTX 4050...")

# 2. Load the model (This will trigger the 3.5GB download)
model, tokenizer = FastLanguageModel.from_pretrained(
    model_name = model_name,
    load_in_4bit = True, # This is why it won't crash my 6GB card
    device_map = "cuda",
)

# 3. Hardware Health Check
allocated = torch.cuda.memory_allocated() / 1024**3
reserved = torch.cuda.memory_reserved() / 1024**3

print("\n---  GPU Status Report ---")
print(f" VRAM Allocated: {allocated:.2f} GB")
print(f"-VRAM Reserved:  {reserved:.2f} GB")
print(f" Status: READY FOR CLINICAL REASONING")
print("----------------------------\n")

# 4. Quick Test: Ask a medical question
print("Self-Test: 'What are the common signs of a hairline fracture?'")
messages = [
    {"role": "user", "content": "What are the common signs of a hairline fracture?"},
]
inputs = tokenizer.apply_chat_template(messages, add_generation_prompt=True, return_tensors="pt").to("cuda")

with torch.inference_mode():
    outputs = model.generate(**inputs, max_new_tokens=100)
    response = tokenizer.decode(outputs[0][len(inputs[0]):], skip_special_tokens=True)

print(f"\nModel Response: {response}")
