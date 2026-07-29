from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends, HTTPException
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

@router.get("/wardrobe/{item_id}")
def get_wardrobe_item(item_id: int, db: Session = Depends(get_db)):
    item = db.query(WardrobeItemModel).filter(WardrobeItemModel.id == item_id).first()
    if item is None:
        raise HTTPException(status_code=404, detail="Wardrobe item not found")
    return item

@router.put("/wardrobe/{item_id}")
def update_wardrobe_item(item_id: int, item: WardrobeItem, db: Session = Depends(get_db)):
    db_item = db.query(WardrobeItemModel).filter(WardrobeItemModel.id == item_id).first()
    if db_item is None:
        raise HTTPException(status_code=404, detail="Wardrobe item not found")

    db_item.name = item.name
    db_item.category = item.category
    db_item.color = item.color

    db.commit()
    db.refresh(db_item)
    return db_item


@router.delete("/wardrobe/{item_id}")
def delete_wardrobe_item(item_id: int, db: Session = Depends(get_db)):
    db_item = db.query(WardrobeItemModel).filter(WardrobeItemModel.id == item_id).first()
    if db_item is None:
        raise HTTPException(status_code=404, detail="Wardrobe item not found")

    db.delete(db_item)
    db.commit()
    return {"message": "Wardrobe item deleted successfully"}