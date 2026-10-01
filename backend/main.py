from fastapi import FastAPI
from routers.users import router as users_router
from database import engine, Base
from models.user import User
from models.intern_profile import InternProfile
from routers.auth import router as auth_router
from routers.interns import router as intern_router
from models.intern_document import InternDocument
from routers.documents import router as documents_router

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Intern Management System")
app.include_router(auth_router)

app.include_router(users_router)
app.include_router(intern_router)

app.include_router(documents_router)

@app.get("/")
def root():
    return {
        "message": "Intern Management System API is running"
    }


@app.get("/api/health")
def health_check():
    return {
        "status": "ok"
    }


@app.get("/api/test-db")
def test_database():
    try:
        with engine.connect():
            return {
                "status": "ok",
                "message": "Database connected successfully"
            }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }