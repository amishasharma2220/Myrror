from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

@app.get("/health")
def health_check():
    return {"status": "ok"}

class WardrobeItem(BaseModel):
    name: str
    category: str
    color: str

@app.post("/wardrobe")
def add_wardrobe_item(item: WardrobeItem):
    return {"message": "Item received", "item": item}

@app.get("/wardrobe")
def get_wardrobe_items():
    return {"items": []}