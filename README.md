# JobGuard AI 🛡️
### An Explainable Machine Learning Approach for Fake Job and Internship Posting Detection

[![Python](https://img.shields.io/badge/Python-3.10%2B-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite%206-61DAFB.svg)](https://reactjs.org/)
[![Scikit-Learn](https://img.shields.io/badge/ML-Scikit--Learn%201.9-F7931E.svg)](https://scikit-learn.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Academic Level](https://img.shields.io/badge/B.Tech-AI%20Mini--Project-purple.svg)](#academic-project-information)

JobGuard AI is a comprehensive, production-style decision-support system engineered to protect university students and early-career jobseekers from fraudulent job listings, deceptive recruitment drives, and predatory internship fee scams.

The platform pairs a Scikit-Learn Machine Learning pipeline (TF-IDF Vectorizer + Balanced Logistic Regression) with a domain-specific heuristic scam rule engine, Explainable AI (XAI) feature attribution, in-memory PDF extraction, and a SaaS-style responsive web interface.

---

## 🎓 Academic Project Information
- **Project Title:** JobGuard AI: An Explainable Machine Learning Approach for Fake Job and Internship Posting Detection
- **Author:** **Subham Kumar Keshari**
- **Enrollment Number:** **92400103120**
- **Department:** Department of Computer Engineering
- **University:** Marwadi University, Rajkot, Gujarat, India
- **Core Dataset:** Real Employment Scam Aegean Dataset (EMSCAD) — 17,880 verified listings.

---

## 📄 Key Project Deliverables & Artifacts
| Deliverable | Description | File Link |
| :--- | :--- | :--- |
| **Google Colab Notebook** | Complete, reproducible 38-cell training notebook with EDA, benchmarks, XAI & export | [JobGuard_AI_Complete_Training.ipynb](./JobGuard_AI_Complete_Training.ipynb) |
| **Academic Research Paper (PDF)** | Exactly 5-page IEEE two-column paper with architecture, confusion matrix & references | [JobGuard_AI_Research_Paper_Subham_Kumar_Keshari.pdf](./JobGuard_AI_Research_Paper_Subham_Kumar_Keshari.pdf) |
| **Academic Research Paper (DOCX)** | Fully editable Microsoft Word version with verified layout | [JobGuard_AI_Research_Paper_Subham_Kumar_Keshari.docx](./JobGuard_AI_Research_Paper_Subham_Kumar_Keshari.docx) |
| **Trained Pipeline Artifact** | Fitted Scikit-Learn pipeline (`FeatureUnion` + `LogisticRegression`) | [backend/models/jobguard_pipeline_v1.joblib](./backend/models/jobguard_pipeline_v1.joblib) |
| **Artifacts Archive** | Complete zip bundle with model, metrics, plots & metadata | [jobguard_ai_artifacts.zip](./jobguard_ai_artifacts.zip) |
| **Evaluation Metrics** | Held-out test evaluation report with confusion matrix counts | [backend/reports/training_metrics.json](./backend/reports/training_metrics.json) |

---

## 📊 Real Evaluation Results (Held-Out Test Set: N = 3,576)

Evaluated strictly on held-out test data partitioned with stratified sampling (14,304 training vs 3,576 testing, 19.6 : 1 class imbalance):

| Metric | Score | Performance Context |
| :--- | :---: | :--- |
| **Overall Accuracy** | **96.20%** | Zero majority-class gaming |
| **Fraud Recall (Sensitivity)** | **93.64%** | **Caught 162 out of 173 test scams** |
| **Fraud Precision** | **56.45%** | Cost-sensitive tradeoff protecting students |
| **Fraud F1-Score** | **0.7043** | Harmonic mean on imbalanced fraud class |
| **ROC-AUC** | **0.9919** | Outstanding diagnostic separability |
| **PR-AUC** | **0.9042** | High area under the precision-recall curve |
| **5-Fold CV Mean F1** | **0.7010** | Consistent cross-validation stability |

### Held-Out Test Confusion Matrix ($N = 3,576$):
$$\begin{bmatrix} \text{True Negatives (TN): } \mathbf{3,278} & \text{False Positives (FP): } \mathbf{125} \\ \text{False Negatives (FN): } \mathbf{11} & \text{True Positives (TP): } \mathbf{162} \end{bmatrix}$$
- **Missed Fraud Listings:** Only 11 out of 173 ($6.36\%$ false negative rate).
- **Detection Rate:** 162 caught out of 173 ($93.64\%$ sensitivity).

### Algorithm Benchmark Comparison:
| Model | Accuracy | Fraud Precision | Fraud Recall | Fraud F1 | ROC-AUC |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Balanced Logistic Regression (Production)** | **96.20%** | **56.45%** | **93.64%** | **0.7043** | **0.9919** |
| **Calibrated Linear SVM** | 98.88% | 95.86% | 80.35% | 0.8742 | 0.9946 |
| **Multinomial Naive Bayes** | 97.12% | 97.30% | 41.62% | 0.5830 | 0.9505 |
| **Random Forest (Metadata Only)** | 95.86% | 61.22% | 17.34% | 0.2703 | 0.7812 |

---

## 🚀 Key Features

1. **Dual-Engine Fraud Risk Assessment**:
   - **Machine Learning Pipeline**: Trained on the EMSCAD benchmark dataset with 10,000 sublinear TF-IDF n-grams and structured organizational metadata.
   - **Internship Scam Heuristic Engine**: Scans for upfront fee requests (registration, training, laptop deposits), Telegram-only recruiters, guaranteed job offers without interviews, and unrealistic compensation promises.
   - **Composite Formula**: $S_{risk} = 0.60 \times (P_{ML} \times 100) + 0.40 \times S_{Rule}$ (categorized into Low, Medium, High risk).
2. **Explainable AI (XAI) Feature Attribution**:
   - Computes mathematical token impact weights from Logistic Regression coefficients ($w_i \times x_i$), showing students exactly which terms influenced the prediction (positive fraud indicators vs negative legitimacy indicators).
3. **Multi-Modal Input Options**:
   - Manual form entry with preset legitimate and scam demonstration samples.
   - In-memory PDF document scanner (`pypdf`) with strict zero-disk-storage privacy.
4. **Company Transparency Checklist**:
   - Audits company background completeness (Name, Profile, Official Domain, Corporate Logo, and Third-Party verification status).
5. **Syntactic URL Safety Inspector**:
   - Evaluates host domain reputation, free blog builders, and private IP literals without making outbound network connections (SSRF protection).
6. **Bilingual User Interface**:
   - Instant language toggle between English and Hindi (`हिंदी`).
7. **Downloadable Analysis Reports**:
   - Generates client-side PDF verification certificates (`jsPDF` + `autoTable`) for students to share with campus placement cells (TPO).
8. **Cloud & Local Offline Resilience**:
   - Firebase Auth & Cloud Firestore with seamless localStorage fallback for offline demonstration.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite 6, Tailwind CSS, Lucide React, Recharts, React Router v6, jsPDF
- **Backend**: FastAPI, Uvicorn, Pydantic v2, Python 3.10–3.13
- **Machine Learning & NLP**: Scikit-Learn, Pandas, NumPy, NLTK, Joblib
- **Document Processing**: PyPDF
- **Authentication & Database**: Firebase Auth, Firebase Cloud Firestore

---

## 📁 Repository Directory Structure

```
JobGuard-AI/
├── JobGuard_AI_Complete_Training.ipynb        # Complete Colab Training Notebook (38 cells)
├── JobGuard_AI_Research_Paper_Subham_Kumar_Keshari.pdf   # 5-Page IEEE Research Paper
├── JobGuard_AI_Research_Paper_Subham_Kumar_Keshari.docx  # Editable Research Paper
├── jobguard_ai_artifacts.zip                 # Compressed Model & Reports Package
├── jobguard_ai_artifacts/                    # Model & Metadata Directory
├── backend/
│   ├── app/
│   │   ├── api/                              # REST API endpoints (health, predict, metrics, model)
│   │   ├── ml/                               # Pipeline, preprocessor, rules engine, predictor, XAI explainer
│   │   ├── schemas/                          # Pydantic v2 data models
│   │   ├── services/                         # PDF & URL parsing services
│   │   ├── utils/                            # Structured logger
│   │   ├── config.py                         # System configuration & path resolutions
│   │   └── main.py                           # FastAPI application entrypoint with lifespan
│   ├── models/                               # jobguard_pipeline_v1.joblib (Trained model)
│   ├── reports/                              # training_metrics.json, confusion_matrix.png, eda_summary.json
│   └── tests/                                # 15 Unit tests (100% passing)
├── frontend/                                 # React + Vite + Tailwind CSS Dashboard
│   ├── src/
│   │   ├── components/                       # Navbar, Footer, RiskBadge, Checklist, Toast
│   │   ├── contexts/                         # AuthContext (Firebase + Guest), LanguageContext (EN + HI)
│   │   ├── pages/                            # Landing, Scanner, PDF Scanner, Results, Insights, History
│   │   └── services/                         # API client, Firestore history, jsPDF export
├── dataset/                                  # EMSCAD dataset instructions & fake_job_postings.csv
├── docs/                                     # Architecture, API Reference, Dataset & Firebase Setup
├── firestore.rules                           # Cloud Firestore security rules
├── requirements.txt                          # Python dependencies
└── README.md                                 # Project documentation
```

---

## 🚀 Quickstart Guide

### 1. Prerequisites
- Python 3.10, 3.11, 3.12, or 3.13
- Node.js 18+ and npm

### 2. Backend Setup
```bash
# Clone the repository
git clone https://github.com/<YOUR_USERNAME>/JobGuard-AI.git
cd JobGuard-AI

# Create and activate virtual environment
python -m venv venv
# Windows:
venv\Scripts\activate
# Linux/macOS:
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run backend server
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```
- Interactive API Docs (Swagger): [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- API Health Status: [http://127.0.0.1:8000/api/health](http://127.0.0.1:8000/api/health)

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🧪 Testing & Quality Assurance

Run the automated backend test suite:
```powershell
python -m pytest backend/tests -v
```
**Results:** `15 passed in 13.19s`
- `test_health_endpoint`: **PASSED**
- `test_dataset_status_endpoint`: **PASSED**
- `test_model_status_endpoint`: **PASSED**
- `test_predict_endpoint_success`: **PASSED**
- `test_predict_endpoint_when_model_not_trained`: **PASSED**
- `test_extract_text_and_parse_pdf`: **PASSED**
- `test_parse_pdf_text_to_job`: **PASSED**
- `test_clean_html`: **PASSED**
- `test_normalize_text`: **PASSED**
- `test_text_combiner`: **PASSED**
- `test_structured_feature_extractor`: **PASSED**
- `test_analyze_rules_detects_scam_patterns`: **PASSED**
- `test_analyze_rules_legitimate_job`: **PASSED**
- `test_generate_company_checklist`: **PASSED**
- `test_safety_recommendations`: **PASSED**

---

## ⚖️ Academic Disclaimer
JobGuard AI is developed as an educational decision-support platform for academic research and college demonstration purposes. Predictions represent statistical correlations with historical recruitment scam listings and do not constitute absolute legal certainty or proof of fraud. Candidates must always exercise independent due diligence before sharing sensitive personal information or paying any monetary fees.
