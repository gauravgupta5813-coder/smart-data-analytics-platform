from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any
import pandas as pd
import state

from sklearn.model_selection import train_test_split

from sklearn.ensemble import (
    RandomForestRegressor,
    RandomForestClassifier
)

from sklearn.metrics import (
    r2_score,
    mean_absolute_error,
    accuracy_score,
    precision_score,
    recall_score,
    f1_score
)

router = APIRouter(
    tags=["Machine Learning"]
)


class TrainRequest(BaseModel):
    target_column: str
    
class PredictRequest(BaseModel):
    features: Dict[str, Any]
    
@router.post("/train")
def train_model(req: TrainRequest):

    if state.clean_df is None:
        raise HTTPException(
            status_code=400,
            detail="Run cleaning first"
        )

    df = state.clean_df.copy()

    if req.target_column not in df.columns:
        raise HTTPException(
            status_code=400,
            detail="Target column not found"
        )

    target = req.target_column

    X = df.drop(columns=[target])
    y = df[target]

    # Encode categorical features
    X = pd.get_dummies(X, drop_first=True)
    state.feature_columns = list(X.columns)
    
    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.2,
        random_state=42
    )

    # -------------------------
    # Regression
    # -------------------------

    if pd.api.types.is_numeric_dtype(y):

        model = RandomForestRegressor(
            n_estimators=100,
            random_state=42
        )

        model.fit(X_train, y_train)

        predictions = model.predict(X_test)

        metrics = {
            "problem_type": "Regression",
            "r2_score": round(
                r2_score(y_test, predictions),
                4
            ),
            "mae": round(
                mean_absolute_error(
                    y_test,
                    predictions
                ),
                4
            )
        }

    # -------------------------
    # Classification
    # -------------------------
    
    else:

        model = RandomForestClassifier(
            n_estimators=100,
            random_state=42
        )

        model.fit(X_train, y_train)

        predictions = model.predict(X_test)

        metrics = {
            "problem_type": "Classification",
            "accuracy": round(
                accuracy_score(
                    y_test,
                    predictions
                ),
                4
            ),
            "precision": round(
                precision_score(
                    y_test,
                    predictions,
                    average="weighted",
                    zero_division=0
                ),
                4
            ),
            "recall": round(
                recall_score(
                    y_test,
                    predictions,
                    average="weighted",
                    zero_division=0
                ),
                4
            ),
            "f1_score": round(
                f1_score(
                    y_test,
                    predictions,
                    average="weighted",
                    zero_division=0
                ),
                4
            )
        }

    # Calculate feature importances
    importances = model.feature_importances_
    feature_importances = [
        {"feature": col, "importance": round(float(imp), 4)}
        for col, imp in zip(X.columns, importances)
    ]
    feature_importances = sorted(feature_importances, key=lambda x: x["importance"], reverse=True)

    state.model = model
    state.metrics = {**metrics, "feature_importances": feature_importances}
    state.target_column = target
    state.feature_columns = list(X.columns)

    return {
        "message": "Model trained successfully",
        **metrics,
        "feature_importances": feature_importances
    }

@router.get("/model/status")
def model_status():
    if state.model is None:
        return {"trained": False}
    return {
        "trained": True,
        "target_column": state.target_column,
        "feature_columns": state.feature_columns,
        **state.metrics
    }
    
@router.post("/predict")
def predict(req: PredictRequest):

    if state.model is None:
        raise HTTPException(
            status_code=400,
            detail="Train a model first"
        )

    input_df = pd.DataFrame(
        [req.features]
    )

    input_df = pd.get_dummies(
        input_df,
        drop_first=True
    )

    input_df = input_df.reindex(
        columns=state.feature_columns,
        fill_value=0
    )

    prediction = state.model.predict(
        input_df
    )[0]

    # Regression prediction
    if isinstance(prediction, (int, float)):
        prediction = round(float(prediction), 2)

    return {
        "target_column": state.target_column,
        "prediction": prediction
    }