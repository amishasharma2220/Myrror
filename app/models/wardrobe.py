from sqlalchemy import Column, Integer, String

from app.database.connection import Base


class WardrobeItemModel(Base):
    __tablename__ = "wardrobe_items"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    category = Column(String, nullable=False)
    color = Column(String, nullable=False)