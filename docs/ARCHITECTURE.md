# JobGuard AI – System Architecture Documentation

## 1. Overview
JobGuard AI is a full-stack, enterprise-grade decision support platform engineered to protect students and early-career jobseekers from fraudulent employment advertisements and predatory internship scams.

## 2. High-Level Architecture

```
[ User Browser ]
   │
   ├── (React 18 + Vite + Tailwind CSS + Recharts + Lucide)
   │     │
   │     ├── Bilingual UI (English & Hindi)
   │     ├── Client-Side PDF Report Generator (jsPDF + autoTable)
   │     ├── Firebase Auth & Firestore SDK (with LocalStorage Fallback)
   │     └── REST Client (Fetch API)
   │
   ▼
[ FastAPI Backend Gateway (Uvicorn / Port 8000) ]
   │
   ├── CORS Middleware (Whitelisted Origins)
   ├── In-Memory PDF Parser (pypdf - No Disk Storage)
   ├── Syntactic Domain & URL Safety Analyzer (Anti-SSRF)
   │
   ▼
[ Dual-Engine Fraud Risk Engine ]
   │
   ├── Engine 1: Rule-Based Heuristic Detector (backend/app/ml/rules.py)
   │     ├── Upfront Monetary Demands (Registration fees, Security deposits)
   │     ├── Guaranteed Offers / No Interview Claims
   │     ├── Unrealistic Salary & High Earning Claims
   │     ├── Premature Sensitive Identity / Banking Requests
   │     ├── Unprofessional Contact Channels (Telegram, WhatsApp only)
   │     └── Artificial Urgency Tactics
   │
   ├── Engine 2: Machine Learning Classification Pipeline (backend/app/ml/)
   │     ├── Text Cleaner & HTML Stripper (preprocessor.py)
   │     ├── TextCombiner & Sublinear TF-IDF (10,000 N-gram features)
   │     ├── StructuredFeatureExtractor (Logo, Questions, Completeness)
   │     ├── Scikit-Learn FeatureUnion
   │     └── Balanced Logistic Regression (liblinear solver)
   │
   └── Engine 3: Explainable AI & Transparency Engine (backend/app/ml/explainer.py)
         ├── Logistic Regression Feature Contribution Extraction (w_i * x_i)
         ├── Company Information Completeness Checklist
         └── Student Safety Guidance Recommendation Engine
```

## 3. Machine Learning Pipeline Details

### A. Dataset Foundation
- **Dataset**: Employment Scam Aegean Dataset (EMSCAD).
- **Size**: ~17,880 historical job postings.
- **Target Feature**: `fraudulent` (0: Legitimate, 1: Fraudulent).
- **Class Imbalance**: Approximately 95.2% legitimate vs 4.8% fraudulent postings.

### B. Feature Representation
1. **Unstructured Text Pipeline**:
   - Fields combined: `title`, `company_profile`, `description`, `requirements`, `benefits`.
   - HTML stripping, URL normalization (`url` token), Email normalization (`email` token).
   - TF-IDF Vectorizer with `ngram_range=(1, 2)`, `min_df=3`, `sublinear_tf=True`.
2. **Structured Metadata Pipeline**:
   - `has_company_logo` (0 or 1).
   - `has_questions` (0 or 1).
   - `telecommuting` (0 or 1).
   - `has_company_profile` (Boolean derived from length > 20 chars).
   - `has_requirements` (Boolean derived from length > 10 chars).
   - `description_char_len` (Normalized length).

### C. Training & Validation Strategy
- Stratified 80/20 train/test split preserving the minority fraudulent ratio.
- Class-weight balancing (`class_weight='balanced'`) to prevent minority-class vanishing.
- 5-Fold Stratified Cross Validation.
- Metrics evaluated: Precision, Recall, F1-Score on the Fraudulent class, ROC-AUC, and PR-AUC.

## 4. Privacy & Security Architecture
- **In-Memory PDF Handling**: Uploaded PDF files are buffered into memory via `io.BytesIO` and discarded immediately after text extraction. Files are never stored on persistent storage.
- **Anti-SSRF Protection**: URL checking performs purely syntactic URI parsing and domain analysis. The backend never initiates outbound network connections to user-supplied URLs.
- **Cloud & Offline Resilience**: When Firebase credentials are unconfigured, the application runs seamlessly in local mode with browser localStorage persistence.
