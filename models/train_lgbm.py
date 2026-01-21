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
        'learning_rate': 0.03,        # Slightly lower learning rate
        'num_leaves': 15,             # Reduced from 31 to prevent overfitting on small data
        'max_depth': 6,               # Limit depth
        'min_child_samples': 15,      # Allow learning from smaller groups but not too small
        'feature_fraction': 0.8,      # Randomly select 80% of features per tree
        'bagging_fraction': 0.8,      # Randomly select 80% of data
        'bagging_freq': 5,            # Perform bagging every 5 iterations
        'lambda_l1': 0.1,             # L1 regularization
        'lambda_l2': 0.1,             # L2 regularization
        'verbose': -1,
        'seed': 42
    }
    train_data = lgb.Dataset(X_train, label=y_train)
    val_data = lgb.Dataset(X_val, label=y_val, reference=train_data)
    bst = lgb.train(
        params, 
        train_data, 
        valid_sets=[val_data], 
        num_boost_round=2000,         # Increased rounds since LR is lower
        callbacks=[lgb.early_stopping(100)] # Increased patience
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