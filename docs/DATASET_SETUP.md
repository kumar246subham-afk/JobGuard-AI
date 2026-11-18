# EMSCAD Dataset Setup & Model Training Guide

## 1. Dataset Overview
JobGuard AI uses the **Employment Scam Aegean Dataset (EMSCAD)**, the standard benchmark for fake job detection research:
- Source: University of the Aegean / Kaggle
- File Name: `fake_job_postings.csv`
- Total Records: ~17,880
- Binary Target: `fraudulent` (0: Legitimate, 1: Fake)

## 2. Where to Place the File
Download `fake_job_postings.csv` and place it in:
```
JobGuard-AI/
  dataset/
    fake_job_postings.csv   <-- Place here
```

Full path on your system:
```
c:\Users\ADMIN\OneDrive\Desktop\JobGuard-AI\dataset\fake_job_postings.csv
```

## 3. How to Train the Model
From the root of the project, run:
```bash
python -m backend.app.ml.train
```

Or from within the `backend/` directory:
```bash
cd backend
python -m app.ml.train
```

## 4. What Training Does Automatically
1. **Validates Schema**: Verifies presence of all 14 required columns and data types.
2. **Generates Exploratory Data Analysis (EDA)**: Produces `backend/reports/eda_summary.json` containing class imbalance ratios, missing value distributions, and job category breakdowns.
3. **Stratified Split**: Performs an 80% train / 20% test partition maintaining minority-class balance.
4. **Cross-Validation**: Runs 5-Fold Stratified Cross Validation on the training set.
5. **Model Comparisons**: Trains baseline Logistic Regression (with `class_weight='balanced'`), Calibrated Linear SVM, and Multinomial Naive Bayes.
6. **Evaluates Metrics**: Measures Test Accuracy, Fraud Precision, Fraud Recall, Fraud F1-Score, ROC-AUC, and PR-AUC.
7. **Saves Artifacts**:
   - `backend/models/jobguard_pipeline_v1.joblib` (Full fitted production pipeline)
   - `backend/reports/training_metrics.json` (Real evaluation report)
   - `backend/reports/confusion_matrix.png` (Confusion matrix plot)

## 5. Verifying Training
Once complete, refresh the JobGuard web dashboard. The status pill will turn green:
`Production ML Pipeline Loaded: TF-IDF + Structured Features Logistic Regression (Balanced)`.
