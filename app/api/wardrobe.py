from fastapi import APIRouter

from app.schemas.wardrobe import WardrobeItem

router = APIRouter()


@router.post("/wardrobe")
def add_wardrobe_item(item: WardrobeItem):
    return {"message": "Item received", "item": item}


@router.get("/wardrobe")
def get_wardrobe_items():
    return {"items": []}