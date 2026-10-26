from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import pandas as pd

# Load your saved model
model = joblib.load("parali_transport_model.pkl")

# FastAPI app
app = FastAPI(title="Parali Transport Price Predictor")

# Input schema
class Trip(BaseModel):
    vehicle_type: str
    distance_km: float
    load_weight_tons: float
    fuel_price: float

# Prediction endpoint
@app.post("/predict")
def predict(trip: Trip):
    input_df = pd.DataFrame([trip.dict()])
    price = model.predict(input_df)[0]
    return {"predicted_price": round(price, 2)}