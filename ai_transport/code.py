import pandas as pd
import numpy as np
from catboost import CatBoostRegressor, Pool
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
import joblib  # For saving/loading the model

# -----------------------------
# 1️⃣ Load Dataset
# -----------------------------
df = pd.read_csv("smart_parali_transport_data.csv")

# Features & target
X = df[['vehicle_type', 'distance_km', 'load_weight_tons', 'fuel_price']]
y = df['transport_price_in_rupees']

# -----------------------------
# 2️⃣ Train/Test Split
# -----------------------------
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# -----------------------------
# 3️⃣ CatBoost Pool (categorical handling)
# -----------------------------
cat_features = ['vehicle_type']
train_pool = Pool(data=X_train, label=y_train, cat_features=cat_features)
test_pool = Pool(data=X_test, label=y_test, cat_features=cat_features)

# -----------------------------
# 4️⃣ Hyperparameter Grid
# -----------------------------
param_grid = {
    'iterations': [500, 1000],
    'depth': [4, 6, 8],
    'learning_rate': [0.03, 0.05, 0.1],
    'l2_leaf_reg': [3, 5, 7]
}

# -----------------------------
# 5️⃣ Initialize CatBoostRegressor
# -----------------------------
cat_model = CatBoostRegressor(
    silent=True,
    random_state=42,
    eval_metric='RMSE'
)

# -----------------------------
# 6️⃣ Grid Search with 5-Fold CV
# -----------------------------
grid_search = GridSearchCV(
    estimator=cat_model,
    param_grid=param_grid,
    scoring='neg_root_mean_squared_error',  # RMSE
    cv=5,
    n_jobs=-1
)

grid_search.fit(X_train, y_train, cat_features=cat_features)

# Best parameters
best_params = grid_search.best_params_
print("Best Hyperparameters:", best_params)

# -----------------------------
# 7️⃣ Train Final Model
# -----------------------------
final_model = CatBoostRegressor(
    **best_params,
    silent=True,
    random_state=42
)
final_model.fit(train_pool, eval_set=test_pool, early_stopping_rounds=50)

# -----------------------------
# 8️⃣ Evaluate Model
# -----------------------------
y_pred = final_model.predict(X_test)
rmse = np.sqrt(mean_squared_error(y_test, y_pred))
mae = mean_absolute_error(y_test, y_pred)
r2 = r2_score(y_test, y_pred)

print(f"Test RMSE: {rmse:.2f}")
print(f"Test MAE: {mae:.2f}")
print(f"Test R² Score: {r2:.2f}")

# -----------------------------
# 9️⃣ Feature Importance
# -----------------------------
feature_importances = final_model.get_feature_importance(prettified=True)
print(feature_importances)

# -----------------------------
# 🔟 Save Model for Production
# -----------------------------
joblib.dump(final_model, "parali_transport_model.pkl")
print("Model saved as parali_transport_model.pkl")

# -----------------------------
# 11️⃣ Prediction Function
# -----------------------------
def predict_transport_price(vehicle_type, distance_km, load_weight_tons, fuel_price):
    """
    Predict transport price for a farmer's trip.
    """
    input_df = pd.DataFrame([{
        'vehicle_type': vehicle_type,
        'distance_km': distance_km,
        'load_weight_tons': load_weight_tons,
        'fuel_price': fuel_price
    }])
    price = final_model.predict(input_df)[0]
    return round(price, 2)

