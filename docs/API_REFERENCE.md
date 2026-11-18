# JobGuard AI – API Reference Documentation

Base URL: `http://localhost:8000/api`

Interactive Swagger UI: `http://localhost:8000/docs`
Interactive ReDoc: `http://localhost:8000/redoc`

---

### 1. Health Check
- **Endpoint**: `GET /api/health`
- **Description**: Verifies service operational status, dataset presence, and model readiness.
- **Sample Response**:
```json
{
  "status": "online",
  "service": "JobGuard AI",
  "version": "1.0.0",
  "timestamp": "2026-11-18T11:25:00.000000",
  "dataset_ready": false,
  "model_ready": false
}
```

---

### 2. Dataset Status
- **Endpoint**: `GET /api/dataset/status`
- **Description**: Inspects whether `dataset/fake_job_postings.csv` is placed. Returns genuine row counts and column distributions if available; never fabricates data.
- **Sample Response (Pending)**:
```json
{
  "dataset_found": false,
  "file_path": ".../dataset/fake_job_postings.csv",
  "row_count": null,
  "column_count": null,
  "fraudulent_count": null,
  "legitimate_count": null,
  "fraudulent_percentage": null,
  "missing_values": null,
  "message": "EMSCAD dataset 'fake_job_postings.csv' was not found...",
  "instructions": "1. Download the EMSCAD dataset..."
}
```

---

### 3. Model Status & Metrics
- **Endpoint**: `GET /api/model/status`
- **Description**: Informs frontend if the pipeline artifact is trained.
- **Sample Response (Pending)**:
```json
{
  "is_trained": false,
  "model_path": ".../backend/models/jobguard_pipeline_v1.joblib",
  "message": "Machine Learning model has not been trained yet. Training is pending dataset placement.",
  "how_to_train": "Run terminal command: python -m backend.app.ml.train"
}
```

- **Endpoint**: `GET /api/model/metrics`
- **Description**: Returns precision, recall, F1-score, confusion matrix, and model comparison benchmarks once trained. Returns HTTP 404 if model is not yet trained.

- **Endpoint**: `GET /api/model/confusion-matrix`
- **Description**: Returns PNG visualization of the held-out test evaluation confusion matrix.

---

### 4. Job Posting Analysis
- **Endpoint**: `POST /api/predict`
- **Content-Type**: `application/json`
- **Request Body**:
```json
{
  "title": "Junior Software Engineer",
  "company_name": "Nexus Cloud Technologies",
  "company_profile": "Enterprise SaaS company specializing in microservices.",
  "description": "We are seeking a junior engineer to develop backend APIs...",
  "requirements": "Proficiency in Python and REST APIs.",
  "benefits": "Health insurance and competitive stipend.",
  "location": "Bangalore, Karnataka, IN",
  "employment_type": "Full-time",
  "required_experience": "Entry level",
  "required_education": "Bachelor's Degree",
  "website_url": "https://nexuscloud.example.com",
  "telecommuting": 1,
  "has_company_logo": 1,
  "has_questions": 1
}
```
- **Response**: `200 OK` (when model trained) or `503 Service Unavailable` with `ModelNotTrained` explanation.

---

### 5. PDF Advertisement Analysis
- **Endpoint**: `POST /api/predict/pdf`
- **Content-Type**: `multipart/form-data`
- **Parameters**: `file`: Uploaded `.pdf` binary (Max 5 MB).
- **Processing**: Extracts text in memory using `pypdf`, partitions fields, and executes dual-engine risk inference.
