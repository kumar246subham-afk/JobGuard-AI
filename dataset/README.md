# JobGuard AI - Dataset Instructions

## Expected Dataset: EMSCAD (Employment Scam Aegean Dataset)

Place the dataset CSV file in this directory with the exact name:
`dataset/fake_job_postings.csv`

### Dataset Details
- **Filename**: `fake_job_postings.csv`
- **Total Records**: ~17,880 job postings
- **Target Column**: `fraudulent` (0 = Legitimate, 1 = Fraudulent/Fake)
- **Source**: University of the Aegean / Kaggle Real or Fake Job Posting Prediction dataset (`https://www.kaggle.com/datasets/shivamb/real-or-fake-fake-jobposting-prediction`)

### Expected Columns
1. `job_id` (Integer) - Unique identifier
2. `title` (String) - Job advertisement title
3. `location` (String) - Country, State, City (e.g., US, NY, New York)
4. `department` (String) - Corporate department
5. `salary_range` (String) - Indicative compensation range
6. `company_profile` (Text) - Overview of the hiring organization
7. `description` (Text) - Detailed job description
8. `requirements` (Text) - Candidate requirements and qualifications
9. `benefits` (Text) - Perks and compensation benefits
10. `telecommuting` (Binary: 0 or 1) - Remote/telecommuting allowed
11. `has_company_logo` (Binary: 0 or 1) - Whether corporate logo was uploaded
12. `has_questions` (Binary: 0 or 1) - Presence of screening questions
13. `employment_type` (String) - Full-time, Part-time, Contract, Temporary, Other
14. `required_experience` (String) - Entry level, Mid-Senior level, Associate, Executive, etc.
15. `required_education` (String) - Bachelor's Degree, Master's, High School, Unspecified, etc.
16. `industry` (String) - Industry category (e.g. Information Technology, Marketing, etc.)
17. `function` (String) - Function domain (e.g. Engineering, Sales, Customer Service)
18. `fraudulent` (Binary: 0 or 1) - Target label (0 for legitimate, 1 for fraudulent)

### How to Train the Model Once the CSV is Placed
Run:
```bash
python -m backend.app.ml.train
```
Or from the backend directory:
```bash
cd backend
python -m app.ml.train
```

The system will validate the schema, run exploratory data analysis, train the stratified Logistic Regression with TF-IDF and structured feature transformers, evaluate metrics (Accuracy, Precision, Recall, F1, ROC-AUC, PR-AUC), generate confusion matrix and classification reports under `backend/reports/`, and save the fitted production pipeline in `backend/models/jobguard_pipeline_v1.joblib`.
