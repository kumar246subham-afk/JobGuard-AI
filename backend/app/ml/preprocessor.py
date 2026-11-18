import re
import html
import numpy as np
import pandas as pd
from typing import List, Union
from sklearn.base import BaseEstimator, TransformerMixin

def clean_html(text: str) -> str:
    """Removes HTML tags and unescapes HTML entities."""
    if not isinstance(text, str):
        return ""
    text = html.unescape(text)
    # Replace URLs with 'url' token before stripping tags
    text = re.sub(r"https?://\S+|www\.\S+", " url ", text)
    # Remove HTML tags
    clean_re = re.compile(r"<[^>]+>")
    text = clean_re.sub(" ", text)
    # Remove email addresses
    text = re.sub(r"\S+@\S+", " email ", text)
    # Normalize extra whitespaces
    text = re.sub(r"\s+", " ", text).strip()
    return text

def normalize_text(text: str) -> str:
    """Normalizes text by lowercasing, cleaning html and removing extraneous symbols."""
    if not isinstance(text, str):
        return ""
    text = clean_html(text)
    text = text.lower()
    # Keep alphanumeric characters and basic punctuation
    text = re.sub(r"[^a-z0-9\s.,!?-]", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text

def combine_job_text_series(df: pd.DataFrame) -> pd.Series:
    """
    Combines key text fields for vectorization:
    title, company_profile, description, requirements, benefits.
    """
    title = df.get("title", pd.Series("", index=df.index)).fillna("").astype(str).apply(normalize_text)
    company_profile = df.get("company_profile", pd.Series("", index=df.index)).fillna("").astype(str).apply(normalize_text)
    description = df.get("description", pd.Series("", index=df.index)).fillna("").astype(str).apply(normalize_text)
    requirements = df.get("requirements", pd.Series("", index=df.index)).fillna("").astype(str).apply(normalize_text)
    benefits = df.get("benefits", pd.Series("", index=df.index)).fillna("").astype(str).apply(normalize_text)
    
    combined = (
        title + " " +
        company_profile + " " +
        description + " " +
        requirements + " " +
        benefits
    )
    return combined

class TextCombiner(BaseEstimator, TransformerMixin):
    """
    Custom Scikit-Learn transformer to combine and clean text columns
    from a DataFrame or dict records into a single text series.
    """
    def __init__(self, text_columns: List[str] = None):
        if text_columns is None:
            self.text_columns = ["title", "company_profile", "description", "requirements", "benefits"]
        else:
            self.text_columns = text_columns

    def fit(self, X, y=None):
        self.is_fitted_ = True
        return self

    def __sklearn_is_fitted__(self):
        return getattr(self, "is_fitted_", False)

    def transform(self, X):
        if isinstance(X, dict):
            X = pd.DataFrame([X])
        elif isinstance(X, list):
            X = pd.DataFrame(X)
        elif not isinstance(X, pd.DataFrame):
            X = pd.DataFrame(X)

        combined = []
        for col in self.text_columns:
            if col in X.columns:
                s = X[col].fillna("").astype(str)
            else:
                s = pd.Series("", index=X.index)
            combined.append(s)

        result = combined[0]
        for c in combined[1:]:
            result = result + " " + c

        return [normalize_text(t) or "empty" for t in result.values]


class StructuredFeatureExtractor(BaseEstimator, TransformerMixin):
    """
    Extracts structured binary and length-based metadata features:
    - has_company_logo (0/1)
    - has_questions (0/1)
    - telecommuting (0/1)
    - has_company_profile (0/1)
    - has_requirements (0/1)
    - has_benefits (0/1)
    - description_char_len
    """
    def fit(self, X, y=None):
        self.is_fitted_ = True
        self.n_features_in_ = 7
        return self

    def __sklearn_is_fitted__(self):
        return getattr(self, "is_fitted_", False)

    def transform(self, X):
        if isinstance(X, dict):
            X = pd.DataFrame([X])
        elif isinstance(X, list):
            X = pd.DataFrame(X)
        elif not isinstance(X, pd.DataFrame):
            X = pd.DataFrame(X)

        has_logo = X.get("has_company_logo", pd.Series(0, index=X.index)).isin([1, "1", True]).astype(np.float32).values
        has_questions = X.get("has_questions", pd.Series(0, index=X.index)).isin([1, "1", True]).astype(np.float32).values
        telecommuting = X.get("telecommuting", pd.Series(0, index=X.index)).isin([1, "1", True]).astype(np.float32).values

        cp = X.get("company_profile", pd.Series("", index=X.index)).fillna("").astype(str).str.strip().str.len()
        has_cp = (cp > 20).astype(np.float32).values

        req = X.get("requirements", pd.Series("", index=X.index)).fillna("").astype(str).str.strip().str.len()
        has_req = (req > 10).astype(np.float32).values

        ben = X.get("benefits", pd.Series("", index=X.index)).fillna("").astype(str).str.strip().str.len()
        has_ben = (ben > 10).astype(np.float32).values

        desc_len = X.get("description", pd.Series("", index=X.index)).fillna("").astype(str).str.len()
        desc_len_norm = np.clip(desc_len.values / 2000.0, 0.0, 5.0).astype(np.float32)

        return np.column_stack([
            has_logo,
            has_questions,
            telecommuting,
            has_cp,
            has_req,
            has_ben,
            desc_len_norm
        ])
