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

router = APIRouter(
    tags=["Upload"]
)
df = state.df

UPLOAD_FOLDER = "uploads"

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
    
#upload csv route

@router.post("/upload")
async def upload_csv(file: UploadFile = File(...)):

    # Validate file type
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are allowed")

    try:
        filepath = os.path.join(
            UPLOAD_FOLDER,
            file.filename
        )

        with open(filepath, "wb") as buffer:
            buffer.write(await file.read())

        encodings = ["utf-8", "latin1", "cp1252"]

        for encoding in encodings:
            try:
                state.df = pd.read_csv(filepath, encoding=encoding)
                state.clean_df = state.df.copy()
                break
            except UnicodeDecodeError:
                continue
        else:
            raise HTTPException(
                  status_code=400,
                  detail="Unable to read file encoding"
            )

        return {
            "message": "File uploaded successfully",
            "rows": state.df.shape[0],
            "columns": state.df.shape[1]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

#preview route

@router.get("/preview")
def preview():

    if state.df is None:
        return {"error": "Upload dataset first"}

    return state.df.head(10).to_dict(
        orient="records"
    )
    
#Dataset info route

@router.get("/info")
def info():

    if state.df is None:
        return {"error": "Upload dataset first"}

    return {
        "rows": state.df.shape[0],
        "columns": list(state.df.columns),
        "data_types": {
            col: str(dtype)
            for col, dtype in state.df.dtypes.items()
        }
    }
    
#Missing values route

@router.get("/missing")
def missing():

    if state.df is None:
        return {"error": "Upload dataset first"}

    return state.df.isnull().sum().to_dict()

#Summary Statistics Route

@router.get("/summary")
def summary():

    if state.df is None:
        return {"error": "Upload dataset first"}

    return state.df.describe().to_dict()