from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import time

from .config import settings
from .utils.logger import logger
from .api import health, dataset_info, model_info, predict
from .ml.predictor import get_model, is_model_trained

from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info(f"Starting {settings.PROJECT_NAME} v{settings.VERSION}...")
    logger.info(f"Checking dataset presence: {settings.DATASET_PATH.exists()}")
    trained = is_model_trained()
    logger.info(f"Checking model artifact presence: {trained}")
    if trained:
        get_model()
        logger.info("ML model pipeline warmed up and ready in memory.")
    else:
        logger.warning(
            "ML model pipeline has not been trained yet. "
            "Inference requests will return a ModelNotTrained status until "
            "'fake_job_postings.csv' is placed in dataset/ and training is run."
        )
    yield
    logger.info(f"Shutting down {settings.PROJECT_NAME}...")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=settings.DESCRIPTION,
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request logging and timing middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    duration = time.time() - start_time
    logger.info(f"{request.method} {request.url.path} returned {response.status_code} in {duration:.3f}s")
    return response

# Global exception handler
@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error handling {request.method} {request.url.path}: {exc}")
    return JSONResponse(
        status_code=500,
        content={
            "detail": "An internal server error occurred while processing the request.",
            "error_message": str(exc),
            "path": request.url.path
        }
    )

# Include Routers with /api prefix
app.include_router(health.router, prefix="/api")
app.include_router(dataset_info.router, prefix="/api")
app.include_router(model_info.router, prefix="/api")
app.include_router(predict.router, prefix="/api")



@app.get("/")
def root():
    return {
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs": "/docs",
        "health": "/api/health"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
