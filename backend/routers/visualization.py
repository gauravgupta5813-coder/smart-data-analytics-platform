from fastapi import APIRouter, HTTPException
import pandas as pd
import matplotlib
matplotlib.use('Agg')  # Non-interactive backend — prevents Tkinter thread crash on reload
import matplotlib.pyplot as plt
import seaborn as sns
import os
import state

router = APIRouter(
    tags=["Visualization"]
)

CHARTS_FOLDER = "charts"

if not os.path.exists(CHARTS_FOLDER):
    os.makedirs(CHARTS_FOLDER)


def validate_dataset():

    if state.clean_df is None:
        raise HTTPException(
            status_code=400,
            detail="No dataset available. Upload and clean a dataset first."
        )

    if state.clean_df.empty:
        raise HTTPException(
            status_code=400,
            detail="Dataset is empty."
        )


def validate_column(column):

    if column not in state.clean_df.columns:
        raise HTTPException(
            status_code=404,
            detail=f"Column '{column}' not found"
        )


@router.get("/histogram/{column}")
def histogram(column: str):

    validate_dataset()
    validate_column(column)

    if not pd.api.types.is_numeric_dtype(
        state.clean_df[column]
    ):
        raise HTTPException(
            status_code=400,
            detail="Histogram requires a numeric column"
        )

    plt.figure(figsize=(8, 5))

    sns.histplot(
        state.clean_df[column],
        kde=True
    )

    plt.title(f"Histogram - {column}")

    path = f"{CHARTS_FOLDER}/{column}_hist.png"

    plt.savefig(path)
    plt.close()

    return {
        "chart": path
    }


@router.get("/boxplot/{column}")
def boxplot(column: str):

    validate_dataset()
    validate_column(column)

    if not pd.api.types.is_numeric_dtype(
        state.clean_df[column]
    ):
        raise HTTPException(
            status_code=400,
            detail="Boxplot requires a numeric column"
        )

    plt.figure(figsize=(8, 5))

    sns.boxplot(
        x=state.clean_df[column]
    )

    plt.title(f"Boxplot - {column}")

    path = f"{CHARTS_FOLDER}/{column}_box.png"

    plt.savefig(path)
    plt.close()

    return {
        "chart": path
    }


@router.get("/bar/{column}")
def bar_chart(column: str):

    validate_dataset()
    validate_column(column)

    plt.figure(figsize=(8, 5))

    state.clean_df[column] \
        .value_counts() \
        .head(15) \
        .plot(kind="bar")

    plt.title(f"Bar Chart - {column}")

    path = f"{CHARTS_FOLDER}/{column}_bar.png"

    plt.savefig(path)
    plt.close()

    return {
        "chart": path
    }


@router.get("/heatmap")
def heatmap():

    validate_dataset()

    numeric_df = state.clean_df.select_dtypes(
        include="number"
    )

    if numeric_df.shape[1] < 2:
        raise HTTPException(
            status_code=400,
            detail="At least 2 numeric columns required for heatmap"
        )

    corr = numeric_df.corr()

    plt.figure(figsize=(10, 6))

    sns.heatmap(
        corr,
        annot=True,
        cmap="coolwarm"
    )

    plt.title("Correlation Heatmap")

    path = f"{CHARTS_FOLDER}/heatmap.png"

    plt.savefig(path)
    plt.close()

    return {
        "chart": path
    }