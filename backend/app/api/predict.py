from fastapi import APIRouter, HTTPException, UploadFile, File
from ..schemas.job import JobInput
from ..schemas.prediction import PredictionResponse
from ..ml.predictor import predict_job, is_model_trained
from ..services.url_service import analyze_url_safely
from ..services.pdf_service import process_pdf_upload
from ..utils.logger import logger

router = APIRouter(tags=["Prediction"])

@router.post("/predict", response_model=PredictionResponse)
def analyze_job_posting(job: JobInput):
    """
    Analyzes manually entered or pasted job details using the ML pipeline and heuristic risk engine.
    """
    if not is_model_trained():
        raise HTTPException(
            status_code=503,
            detail=(
                "ModelNotTrained: The Machine Learning model has not been trained yet. "
                "Please place 'fake_job_postings.csv' into the 'dataset/' folder and run "
                "'python -m backend.app.ml.train' to generate the model artifact."
            )
        )

    try:
        # Check URL safely if provided
        url_analysis = analyze_url_safely(job.website_url)

        # Run predictor
        result = predict_job(job.model_dump(), url_analysis_result=url_analysis)
        return PredictionResponse(**result)
    except RuntimeError as re:
        raise HTTPException(status_code=503, detail=str(re))
    except Exception as e:
        logger.error(f"Prediction failed: {e}")
        raise HTTPException(status_code=500, detail=f"Inference error: {str(e)}")

@router.post("/predict/pdf", response_model=PredictionResponse)
async def analyze_job_pdf(file: UploadFile = File(...)):
    """
    Extracts text from an uploaded PDF document and executes job fraud analysis.
    The PDF is processed in memory and never stored permanently on disk.
    """
    if not is_model_trained():
        raise HTTPException(
            status_code=503,
            detail=(
                "ModelNotTrained: The Machine Learning model has not been trained yet. "
                "Please place 'fake_job_postings.csv' into the 'dataset/' folder and run "
                "'python -m backend.app.ml.train' to generate the model artifact."
            )
        )

    try:
        job_data = await process_pdf_upload(file)
        result = predict_job(job_data)
        return PredictionResponse(**result)
    except HTTPException:
        raise
    except RuntimeError as re:
        raise HTTPException(status_code=503, detail=str(re))
    except Exception as e:
        logger.error(f"PDF prediction error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to process PDF job: {str(e)}")
