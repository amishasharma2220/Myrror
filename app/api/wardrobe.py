from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.database.connection import get_db
from app.models.user import UserModel
from app.models.wardrobe import WardrobeItemModel
from app.schemas.wardrobe import WardrobeItem

router = APIRouter()


@router.post("/wardrobe")
def add_wardrobe_item(
    item: WardrobeItem,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
):
    db_item = WardrobeItemModel(
        name=item.name,
        category=item.category,
        color=item.color,
        user_id=current_user.id,
    )
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item


@router.get("/wardrobe")
def get_wardrobe_items(
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
):
    return (
        db.query(WardrobeItemModel)
        .filter(WardrobeItemModel.user_id == current_user.id)
        .all()
    )


@router.get("/wardrobe/{item_id}")
def get_wardrobe_item(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
):
    item = (
        db.query(WardrobeItemModel)
        .filter(
            WardrobeItemModel.id == item_id,
            WardrobeItemModel.user_id == current_user.id,
        )
        .first()
    )
    if item is None:
        raise HTTPException(status_code=404, detail="Wardrobe item not found")
    return item


@router.put("/wardrobe/{item_id}")
def update_wardrobe_item(
    item_id: int,
    item: WardrobeItem,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
):
    db_item = (
        db.query(WardrobeItemModel)
        .filter(
            WardrobeItemModel.id == item_id,
            WardrobeItemModel.user_id == current_user.id,
        )
        .first()
    )
    if db_item is None:
        raise HTTPException(status_code=404, detail="Wardrobe item not found")

    db_item.name = item.name
    db_item.category = item.category
    db_item.color = item.color

    db.commit()
    db.refresh(db_item)
    return db_item


@router.delete("/wardrobe/{item_id}")
def delete_wardrobe_item(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: UserModel = Depends(get_current_user),
):
    db_item = (
        db.query(WardrobeItemModel)
        .filter(
            WardrobeItemModel.id == item_id,
            WardrobeItemModel.user_id == current_user.id,
        )
        .first()
    )
    if db_item is None:
        raise HTTPException(status_code=404, detail="Wardrobe item not found")

    db.delete(db_item)
    db.commit()
    return {"message": "Wardrobe item deleted successfully"}