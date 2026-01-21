import pandas as pd
import numpy as np
import os

def mix_datasets():
    print("Loading datasets...")
    old_path = 'data/raw/Crop_recommendation.csv'
    new_path = 'data/raw/CropDataset-Enhanced.csv'
    
    if not os.path.exists(old_path) or not os.path.exists(new_path):
        print("Error: One or both datasets not found.")
        return

    df_old = pd.read_csv(old_path)
    df_new = pd.read_csv(new_path)
    
    # helper to normalize crop names
    df_old['label'] = df_old['label'].str.strip()
    df_new['Crop'] = df_new['Crop'].str.strip() # maintain case for now, but usually lowercase is safer
    
    # 1. Analyze Old Data to get means/defaults
    crop_stats = df_old.groupby('label').agg({
        'temperature': 'mean',
        'humidity': 'mean',
        'rainfall': 'mean',
        'N': 'mean',
        'P': 'mean',
        'K': 'mean',
        'ph': 'mean'
    }).to_dict('index')
    
    global_means = df_old[['temperature', 'humidity', 'rainfall', 'N', 'P', 'K', 'ph']].mean()

    # 2. Process New Data
    # Map One-Hot/Categorical to Numerical
    # We need to find which columns are present.
    # Based on headers: 
    # Nitrogen - High, Nitrogen - Medium, Nitrogen - Low
    # Phosphorous - High, ...
    # Potassium - ...
    # pH - Acidic, pH - Neutral, pH - Alkaline
    
    def get_val_from_cat(row, type_prefix, high_val, med_val, low_val):
        # Check if High/Med/Low is set
        # The CSV might have NaNs or 1/0. 
        # Assuming One-Hot where one is 1 (or True)
        
        # We need to handle column name variations if unsure.
        # But assuming names from 'cols.txt'
        
        # Heuristic values based on old data ranges
        # N: Max 140. High=120, Med=80, Low=40
        # P: Max 145. High=100, Med=60, Low=20
        # K: Max 205. High=150, Med=75, Low=25
        # pH: Acid=5.5, Neut=7.0, Alk=8.5
        
        # Check for existence of cols
        h_col = f"{type_prefix} - High"
        m_col = f"{type_prefix} - Medium"
        l_col = f"{type_prefix} - Low"
        
        if type_prefix == 'pH':
            h_col = 'pH - Alkaline'
            m_col = 'pH - Neutral'
            l_col = 'pH - Acidic'
            high_val, med_val, low_val = 8.5, 7.0, 5.5
            
        val = med_val # Default
        
        if h_col in row.index and (row[h_col] == 1 or row[h_col] == 'True' or row[h_col] == True):
            val = high_val
        elif m_col in row.index and (row[m_col] == 1 or row[m_col] == 'True' or row[m_col] == True):
            val = med_val
        elif l_col in row.index and (row[l_col] == 1 or row[l_col] == 'True' or row[l_col] == True):
            val = low_val
            
        return val

    processed_rows = []
    
    print("Processing new dataset...")
    for idx, row in df_new.iterrows():
        crop = row.get('Crop')
        
        # Get N, P, K, pH from categories
        n_val = get_val_from_cat(row, 'Nitrogen', 120, 80, 40)
        p_val = get_val_from_cat(row, 'Phosphorous', 100, 60, 20)
        k_val = get_val_from_cat(row, 'Potassium', 150, 75, 25)
        ph_val = get_val_from_cat(row, 'pH', 8.5, 7.0, 5.5) # Args ignored inside for pH special case
        
        # Get Temp, Hum, Rain from Crop Stats (Imputation)
        if crop in crop_stats:
            temp = crop_stats[crop]['temperature']
            hum = crop_stats[crop]['humidity']
            rain = crop_stats[crop]['rainfall']
        else:
            # Fallback to global mean
            temp = global_means['temperature']
            hum = global_means['humidity']
            rain = global_means['rainfall']
        
        processed_rows.append({
            'N': n_val,
            'P': p_val,
            'K': k_val,
            'temperature': temp,
            'humidity': hum,
            'ph': ph_val,
            'rainfall': rain,
            'label': crop
        })
        
    df_new_processed = pd.DataFrame(processed_rows)
    
    # 3. Combine
    print(f"Combining {len(df_old)} old rows with {len(df_new_processed)} new rows...")
    df_combined = pd.concat([df_old, df_new_processed], ignore_index=True)
    
    # 4. Save
    out_path = 'data/raw/Crop_Mixed.csv'
    df_combined.to_csv(out_path, index=False)
    print(f"Saved combined dataset to {out_path} with {len(df_combined)} rows.")

if __name__ == "__main__":
    mix_datasets()
