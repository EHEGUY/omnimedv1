from unsloth import FastLanguageModel
import torch

# This points to the optimized version for your 4050
model_name = "unsloth/medgemma-1.5-4b-it-bnb-4bit"

print(" Starting the OmniMed Engine Download (Approx 3.5GB)...")

model, tokenizer = FastLanguageModel.from_pretrained(
    model_name = model_name,
    load_in_4bit = True, # Critical for your 6GB VRAM
    device_map = "cuda",
)

print("\n DOWNLOAD COMPLETE!")

# Check how much space it took on your GPU
allocated = torch.cuda.memory_allocated() / 1024**3
reserved = torch.cuda.memory_reserved() / 1024**3

print(f"📊 GPU Resource Report:")
print(f"   - VRAM Allocated: {allocated:.2f} GB")
print(f"   - VRAM Reserved:  {reserved:.2f} GB")
print(f"   - Status: READY FOR DIAGNOSTICS")