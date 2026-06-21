# Data Analytics Dashboard

A full-stack Data Analytics and Machine Learning Dashboard built using React, FastAPI, Pandas, Scikit-Learn, and Matplotlib.

The application allows users to upload datasets, analyze data quality, generate visualizations, train machine learning models, and make predictions through an intuitive web interface.

---

## Features

### Dataset Upload

* Upload CSV datasets
* Automatic dataset loading and validation

### Dataset Profiling

* Total rows and columns
* Numeric and categorical column detection
* Missing value analysis
* Duplicate row detection

### Data Quality Analysis

* Missing values detection
* Outlier detection
* Duplicate record identification
* High-cardinality column detection
* Constant column detection

### Cleaning Recommendations

* Automatic recommendations for detected issues
* Suggestions for handling missing values
* Outlier treatment guidance
* Duplicate removal recommendations

### Data Visualization

* Histogram generation
* Boxplot generation
* Correlation heatmap
* Bar charts for categorical columns

### Machine Learning

* Automatic Regression and Classification detection
* Random Forest Regressor
* Random Forest Classifier
* Model evaluation metrics

### Prediction System

* Train model on uploaded dataset
* Predict target values using custom input data
* Real-time prediction results

---

## Tech Stack

### Frontend

* React
* Vite
* Axios
* React Router
* Tailwind CSS

### Backend

* FastAPI
* Pandas
* NumPy
* Scikit-Learn
* Matplotlib
* Seaborn
* Pydantic

---

## Project Structure

```text
Data-analytics-dashboard/
│
├── backend/
│   ├── routers/
│   │   ├── upload.py
│   │   ├── analysis.py
│   │   ├── visualization.py
│   │   └── ml.py
│   │
│   ├── charts/
│   ├── uploads/
│   ├── main.py
│   ├── state.py
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── services/
│   │
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

---

## Installation

### Clone Repository

```bash
git clone https://github.com/gauravgupta5813-coder/smart-data-analytics-platform.git

cd data-analytics-dashboard
```

---

### Backend Setup

```bash
cd backend

python -m venv venv

venv\Scripts\activate

pip install -r requirements.txt
```

Run backend:

```bash
uvicorn main:app --reload
```

Backend URL:

```text
http://127.0.0.1:8000
```

Swagger Documentation:

```text
http://127.0.0.1:8000/docs
```

---

### Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

Frontend URL:

```text
http://localhost:5173
```

---

## API Endpoints

### Upload

```http
POST /upload
```

### Dataset Profile

```http
GET /profile
```

### Issues Detection

```http
GET /issues
```

### Recommendations

```http
GET /recommendations
```

### Visualizations

```http
GET /histogram/{column}
GET /boxplot/{column}
GET /bar/{column}
GET /heatmap
```

### Machine Learning

```http
POST /train
POST /predict
```

---

## Example Workflow

1. Upload CSV Dataset
2. View Dataset Profile
3. Analyze Data Quality Issues
4. Review Cleaning Recommendations
5. Generate Visualizations
6. Train Machine Learning Model
7. Evaluate Model Performance
8. Make Predictions

---

## Future Improvements

* Interactive chart dashboards
* Multiple ML algorithm selection
* Feature importance visualization
* Model download and export
* User authentication
* Cloud dataset storage
* PDF analytics reports
* Dark mode support

---

## Author

Gaurav Gupta

B.Tech Computer Science Engineering

---

## License

This project is licensed under the MIT License.
