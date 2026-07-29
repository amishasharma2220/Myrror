from app.database.connection import Base, engine
from app.models.wardrobe import WardrobeItemModel
from app.models.user import UserModel

Base.metadata.create_all(bind=engine)

print("Tables created successfully.")