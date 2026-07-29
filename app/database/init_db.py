from app.database.connection import Base, engine
from app.models.wardrobe import WardrobeItemModel

Base.metadata.create_all(bind=engine)

print("Tables created successfully.")