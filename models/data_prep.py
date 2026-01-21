import pandas as pd
import os
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
import joblib

def prepare_data():
    raw_path = 'data/raw/Crop_Mixed.csv'
    processed_dir = 'data/processed'
    os.makedirs(processed_dir, exist_ok=True)
    
    # Load data
    df = pd.read_csv(raw_path)
    
    # Filter rare classes (need at least 3 for split)
    v_counts = df['label'].value_counts()
    print("Value counts before filter:")
    print(v_counts.tail(10))
    keep_labels = v_counts[v_counts >= 10].index
    df = df[df['label'].isin(keep_labels)]
    print(f"Rows after filter: {len(df)}")

    
    # Rename columns to match train_lgbm.py expectations if needed, 
    # but I will update train_lgbm.py to match the CSV N,P,K
    
    # Encode labels
    le = LabelEncoder()
    df['crop_label'] = le.fit_transform(df['label'])
    
    # Save label encoder
    joblib.dump(le, os.path.join(processed_dir, 'label_encoder.pkl'))
    
    # Split data: 70% train, 15% val, 15% test
    train_df, rem_df = train_test_split(df, test_size=0.3, random_state=42, stratify=df['crop_label'])
    val_df, test_df = train_test_split(rem_df, test_size=0.5, random_state=42, stratify=rem_df['crop_label'])
    
    # Save processed datasets
    train_df.to_csv(os.path.join(processed_dir, 'train_features.csv'), index=False)
    val_df.to_csv(os.path.join(processed_dir, 'val_features.csv'), index=False)
    test_df.to_csv(os.path.join(processed_dir, 'test_features.csv'), index=False)
    
    print(f"Data prepared and saved to {processed_dir}")
    print(f"Train size: {len(train_df)}, Val size: {len(val_df)}, Test size: {len(test_df)}")

if __name__ == "__main__":
    prepare_data()
