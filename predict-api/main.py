from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from datetime import timedelta
import numpy as np

app = FastAPI(title="LiquidTrack Forecast API")

# Allow Next.js dev server to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define the expected JSON payload from Next.js
class ComplaintData(BaseModel):
    date: str
    district: str
    category: str
    count: int

class PredictRequest(BaseModel):
    data: List[ComplaintData]

# Static mapping for Geo-coordinates (For production, this would use a Geocoding service or DB)
DISTRICT_COORDS = {
    "Mumbai": {"lat": 19.0760, "lng": 72.8777},
    "Chennai": {"lat": 13.0827, "lng": 80.2707},
    "Delhi": {"lat": 28.7041, "lng": 77.1025},
    "Bangalore": {"lat": 12.9716, "lng": 77.5946},
    "Hyderabad": {"lat": 17.3850, "lng": 78.4867},
    "Kolkata": {"lat": 22.5726, "lng": 88.3639},
    "Pune": {"lat": 18.5204, "lng": 73.8567},
    "Saraland": {"lat": 30.8207, "lng": -88.0706},
    "Unknown": {"lat": 20.5937, "lng": 78.9629} # Fallback center of India
}

def get_coords(district: str) -> Dict[str, float]:
    # Try exact match, otherwise return default coordinates
    return DISTRICT_COORDS.get(district, DISTRICT_COORDS["Unknown"])

@app.post("/predict")
def predict_complaints(payload: PredictRequest):
    if not payload.data:
        raise HTTPException(status_code=400, detail="No historical data provided")

    # 1. Convert payload to Pandas DataFrame
    df = pd.DataFrame([vars(d) for d in payload.data])
    
    # 2. Preprocess Time-Series Features
    # Convert 'date' to datetime objects
    df['date'] = pd.to_datetime(df['date'])
    df['day_of_year'] = df['date'].dt.dayofyear
    df['year'] = df['date'].dt.year
    df['day_of_week'] = df['date'].dt.dayofweek
    
    results = []
    
    # Unique districts and categories in the payload
    districts = df['district'].unique()
    categories = df['category'].unique()
    
    last_known_date = df['date'].max()
    
    # We want to predict the next 3 days
    future_dates = [last_known_date + timedelta(days=i) for i in range(1, 4)]
    
    # 3. Train models and generate predictions
    # We train a lightweight Random Forest model per district per category
    for district in districts:
        for category in categories:
            subset = df[(df['district'] == district) & (df['category'] == category)]
            
            # Scikit-learn Random Forest needs a few data points to train properly
            if len(subset) < 3:
                # If insufficient data, we could fallback to moving averages or skip. We'll skip for now.
                continue
                
            X = subset[['year', 'day_of_year', 'day_of_week']]
            y = subset['count']
            
            # Lightweight regressor (n_estimators=10 for speed in a hackathon)
            model = RandomForestRegressor(n_estimators=20, random_state=42)
            model.fit(X, y)
            
            # Prepare future feature set
            future_X = pd.DataFrame({
                'year': [d.year for d in future_dates],
                'day_of_year': [d.dayofyear for d in future_dates],
                'day_of_week': [d.dayofweek for d in future_dates]
            })
            
            # Predict counts
            predictions = model.predict(future_X)
            max_historical_count = max(1, y.max())
            
            for i, pred_val in enumerate(predictions):
                predicted_count = max(0, int(np.round(pred_val)))
                
                # Calculate a relative severity index (0-100) based on historical maximums
                severity = min(100, int((predicted_count / max_historical_count) * 100))
                
                results.append({
                    "district": district,
                    "category": category,
                    "date": future_dates[i].strftime("%Y-%m-%d"),
                    "predicted_count": predicted_count,
                    "severity": severity,
                    "coordinates": get_coords(district)
                })
                
    return {
        "metadata": {
            "model": "RandomForestRegressor",
            "forecast_days": 3,
            "predictions_generated": len(results)
        },
        "predictions": results
    }

@app.get("/")
def read_root():
    return {
        "status": "online", 
        "service": "LiquidTrack Forecast ML API",
        "endpoints": ["/predict"]
    }

if __name__ == "__main__":
    import uvicorn
    # Allows running directly via `python main.py`
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
