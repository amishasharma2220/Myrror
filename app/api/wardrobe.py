from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.wardrobe import WardrobeItemModel
from app.schemas.wardrobe import WardrobeItem

router = APIRouter()


@router.post("/wardrobe")
def add_wardrobe_item(item: WardrobeItem, db: Session = Depends(get_db)):
    db_item = WardrobeItemModel(
        name=item.name, category=item.category, color=item.color
    )
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item


@router.get("/wardrobe")
def get_wardrobe_items(db: Session = Depends(get_db)):
    return db.query(WardrobeItemModel).all()