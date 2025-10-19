from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from backend.database import test_database_connection
from logger import logger

router = APIRouter(tags=["health"])

@router.get("/health")
async def health_check():
    try:
        if test_database_connection():
            return JSONResponse(
                status_code=200,
                content={"status": "healthy", "database": "connected"}
            )
        else:
            return JSONResponse(
                status_code=503,
                content={"status": "unhealthy", "database": "disconnected"}
            )
    except Exception as e:
        logger.error(f"Health check error: {str(e)}")
        return JSONResponse(
            status_code=503,
            content={"status": "unhealthy", "error": str(e)}
        )

@router.get("/")
async def root():
    return {
        "message": "Quiz App API",
        "version": "1.0.0",
        "docs": "/docs"
    }