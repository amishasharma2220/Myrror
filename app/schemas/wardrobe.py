from pydantic import BaseModel


class WardrobeItem(BaseModel):
    name: str
    category: str
    color: str