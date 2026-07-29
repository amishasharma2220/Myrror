from fastapi import FastAPI
from app.api.auth import router as auth_router
from app.api.wardrobe import router as wardrobe_router

app = FastAPI()


@app.get("/health")
def health_check():
    return {"status": "ok"}


app.include_router(wardrobe_router)
app.include_router(auth_router)