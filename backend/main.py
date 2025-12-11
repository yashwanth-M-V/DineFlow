from fastapi import FastAPI
from backend.routers import orders   # <-- FIXED IMPORT
import os

from dotenv import load_dotenv
load_dotenv()
print("Loaded user:", os.getenv("AZURE_SQL_USER"))
print("Password loaded:", os.getenv("AZURE_SQL_PASSWORD"))


app = FastAPI(title="DineFlow Backend API")

# Attach routes
app.include_router(orders.router)

@app.get("/")
def home():
    return {"message": "DineFlow API is running"}
