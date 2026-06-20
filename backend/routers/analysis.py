from fastapi import APIRouter
from fastapi import FastAPI, UploadFile, File, HTTPException
import pandas as pd
import matplotlib
matplotlib.use('Agg')  # Non-interactive backend — prevents Tkinter thread crash on reload
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np
import os
import state

df = state.df

router = APIRouter(
    tags=["Analysis"]
)

@router.get("/profile")
def profile():

    if state.df is None:
        raise HTTPException(400, "Upload dataset first")

    return {
        "rows": len(state.df),
        "columns": len(state.df.columns),
        "numeric_columns":
            state.df.select_dtypes(include=np.number)
            .columns.tolist(),

        "categorical_columns":
            state.df.select_dtypes(include="object")
            .columns.tolist(),

        "missing_values":
            state.df.isnull().sum().to_dict(),

        "duplicate_rows":
            int(state.df.duplicated().sum()),

        "categorical_uniques": {
            col: state.df[col].dropna().unique().tolist()[:50]
            for col in state.df.select_dtypes(include="object").columns
        }
    }
    
@router.get("/issues")
def detect_issues():

    if state.df is None:
        raise HTTPException(
            status_code=400,
            detail="Upload dataset first"
        )


    issues = {
        "missing_values": {},
        "outliers": {},
        "constant_columns": [],
        "high_cardinality_columns": [],
        "duplicate_rows": int(state.df.duplicated().sum())
    }

    rows = len(state.df)

    for col in state.df.columns:

        # Missing values
        missing = int(state.df[col].isnull().sum())

        if missing > 0:
            issues["missing_values"][col] = missing

        # Constant columns
        if state.df[col].nunique(dropna=True) <= 1:
            issues["constant_columns"].append(col)

        # High Cardinality
        if rows > 0:
            unique_ratio = (
                state.df[col].nunique(dropna=True) / rows
            )

            if unique_ratio > 0.90:
                issues["high_cardinality_columns"].append(col)

        # Outlier Detection
        if pd.api.types.is_numeric_dtype(state.df[col]):

            clean_col = state.df[col].dropna()

            if len(clean_col) > 0:

                Q1 = clean_col.quantile(0.25)
                Q3 = clean_col.quantile(0.75)

                IQR = Q3 - Q1

                lower = Q1 - 1.5 * IQR
                upper = Q3 + 1.5 * IQR

                outliers = int(
                    ((clean_col < lower) |
                     (clean_col > upper)).sum()
                )

                if outliers > 0:
                    issues["outliers"][col] = outliers

    return issues

@router.get("/recommendations")
def recommendations():

    if state.df is None:
        raise HTTPException(
            status_code=400,
            detail="Upload dataset first"
        )

    recommendations = []

    rows = len(state.df)

    for col in state.df.columns:

        missing = int(state.df[col].isnull().sum())

        # Missing values
        if missing > 0:

            if pd.api.types.is_numeric_dtype(state.df[col]):

                recommendations.append({
                    "column": col,
                    "issue": "missing_values",
                    "recommendation":
                        "Fill using median"
                })

            else:

                recommendations.append({
                    "column": col,
                    "issue": "missing_values",
                    "recommendation":
                        "Fill using mode"
                })

        # Constant columns
        if state.df[col].nunique(dropna=True) <= 1:

            recommendations.append({
                "column": col,
                "issue": "constant_column",
                "recommendation":
                    "Drop column"
            })

        # High cardinality
        if rows > 0:

            unique_ratio = (
                state.df[col].nunique(dropna=True) / rows
            )

            if unique_ratio > 0.90:

                recommendations.append({
                    "column": col,
                    "issue": "high_cardinality",
                    "recommendation":
                        "Exclude from correlation and charts"
                })

        # Outliers
        if pd.api.types.is_numeric_dtype(state.df[col]):

            clean_col = state.df[col].dropna()

            if len(clean_col) > 0:

                Q1 = clean_col.quantile(0.25)
                Q3 = clean_col.quantile(0.75)

                IQR = Q3 - Q1

                lower = Q1 - 1.5 * IQR
                upper = Q3 + 1.5 * IQR

                outlier_count = int(
                    ((clean_col < lower) |
                     (clean_col > upper)).sum()
                )

                if outlier_count > 0:

                    recommendations.append({
                        "column": col,
                        "issue": "outliers",
                        "recommendation":
                            "Review and treat outliers"
                    })

    if state.df.duplicated().sum() > 0:

        recommendations.append({
            "column": "dataset",
            "issue": "duplicate_rows",
            "recommendation":
                "Review duplicate records"
        })

    return {
        "recommendations": recommendations
    }
    
@router.post("/clean/apply")
def apply_cleaning():

    if state.df is None:
        raise HTTPException(
            status_code=400,
            detail="Upload dataset first"
        )

    state.df = state.df.copy()

    # -------------------
    # Missing Values
    # -------------------

    for col in state.df.columns:

        if state.df[col].isnull().sum() > 0:

            if pd.api.types.is_numeric_dtype(state.df[col]):

                state.df[col] = state.df[col].fillna(
                    state.df[col].median()
                )

            else:

                mode = state.df[col].mode()

                if not mode.empty:
                    state.df[col] = state.df[col].fillna(
                        mode[0]
                    )

    # -------------------
    # Duplicate Rows
    # -------------------

    state.df = state.df.drop_duplicates()

    # -------------------
    # Constant Columns
    # -------------------

    constant_cols = []

    for col in state.df.columns:

        if state.df[col].nunique(dropna=True) <= 1:
            constant_cols.append(col)

    state.df = state.df.drop(
        columns=constant_cols,
        errors="ignore"
    )

    state.clean_df = state.df

    return {
        "message": "Cleaning completed",
        "rows": len(state.df),
        "columns": len(state.df.columns),
        "removed_constant_columns":
            constant_cols
    }
    
@router.get("/clean/summary")
def clean_summary():

    if state.clean_df is None:

        raise HTTPException(
            status_code=400,
            detail="Run cleaning first"
        )

    return {

        "original_rows":
            len(state.df),

        "clean_rows":
            len(state.clean_df),

        "original_columns":
            len(state.df.columns),

        "clean_columns":
            len(state.clean_df.columns)
    }