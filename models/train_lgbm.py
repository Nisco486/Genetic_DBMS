"""
Train a LightGBM classifier on the prepared dataset and save model to 4_models/lgbm_crop_model.pkl
"""
import pandas as pd
import os
import sys
import joblib
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
import lightgbm as lgb

# Import LGBWrapper from shared backend module
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))
from app.models import LGBWrapper

TRAIN_IN = "data/processed/train_features.csv"
MODEL_OUT = "models/lgbm_crop_model.pkl"

def train():
    df = pd.read_csv(TRAIN_IN)
    feature_cols = ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']
    X = df[feature_cols]
    y = df['crop_label']  # Use encoded labels from data_prep
    X_train, X_val, y_train, y_val = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    params = {
        'objective': 'multiclass',
        'num_class': len(y.unique()),
        'metric': 'multi_logloss',
        'learning_rate': 0.05,
        'num_leaves': 31,
        'verbose': -1,
        'seed': 42
    }
    train_data = lgb.Dataset(X_train, label=y_train)
    val_data = lgb.Dataset(X_val, label=y_val, reference=train_data)
    bst = lgb.train(
        params, 
        train_data, 
        valid_sets=[val_data], 
        num_boost_round=1000,
        callbacks=[lgb.early_stopping(50)]
    )
    # wrap sklearn-style interface for predict_proba
    classes = sorted(list(y.unique()))
    wrapper = LGBWrapper(bst, classes)
    joblib.dump(wrapper, MODEL_OUT)
    # eval
    preds = wrapper.predict(X_val)
    acc = accuracy_score(y_val, preds)
    print("Validation accuracy:", acc)
    print(classification_report(y_val, preds))
    print("Model saved to", MODEL_OUT)

if __name__ == "__main__":
    if not os.path.exists(TRAIN_IN):
        raise FileNotFoundError(f"{TRAIN_IN} not found. Run ETL first.")
    os.makedirs(os.path.dirname(MODEL_OUT), exist_ok=True)
    train()