import pandas as pd
import numpy as np
import os

def generate_synthetic_data():
    output_dir = "synthetic_data"
    os.makedirs(output_dir, exist_ok=True)

    # 1. Crops Data
    crops_data = {
        "crop_name": ["Rice", "Wheat", "Maize", "Cotton", "Soybean"],
        "variety": ["IR64", "HD2967", "Ganga-11", "BT-Cotton", "JS-335"],
        "origin_region": ["West Bengal", "Punjab", "Bihar", "Gujarat", "MP"],
        "description": [
            "High yielding indica rice variety.",
            "Popular wheat variety with good rust resistance.",
            "Hybrid maize suitable for poultry feed.",
            "Genetically modified cotton with pest resistance.",
            "Short duration soybean variety."
        ]
    }
    pd.DataFrame(crops_data).to_csv(f"{output_dir}/crops_data.csv", index=False)
    print(f"Generated {output_dir}/crops_data.csv")

    # 2. Genetic Traits Data
    genetic_data = {
        "crop_name": ["Rice", "Wheat", "Maize", "Cotton", "Rice"],
        "gene_code": ["SUB1A", "LR34", "CRT", "CRY1AC", "DRO1"],
        "category": ["Tolerance", "Resistance", "Nutritional", "Pest Control", "Tolerance"],
        "trait_name": ["Submergence Tolerance", "Leaf Rust Resistance", "Pro-vitamin A", "Bollworm Resistance", "Drought Tolerance"],
        "description": [
            "Gene that allows rice to survive underwater.",
            "Provides durable resistance to multiple fungal diseases.",
            "Increases beta-carotene levels in grain.",
            "Bt gene providing resistance to cotton bollworm.",
            "Deeper rooting gene for drought resistance."
        ]
    }
    pd.DataFrame(genetic_data).to_csv(f"{output_dir}/genetic_traits.csv", index=False)
    print(f"Generated {output_dir}/genetic_traits.csv")

    # 3. Climate Data
    climate_data = {
        "region": ["North Central", "Coastal East", "Semi-Arid West", "Hilly Northeast", "Southern Peninsula"],
        "temperature": [28.5, 30.2, 35.1, 22.0, 31.5],
        "humidity": [60.0, 85.0, 40.0, 90.0, 75.0],
        "rainfall": [150.0, 2500.0, 450.0, 3000.0, 900.0]
    }
    pd.DataFrame(climate_data).to_csv(f"{output_dir}/climate_data.csv", index=False)
    print(f"Generated {output_dir}/climate_data.csv")

    # 4. Soil Data
    soil_data = {
        "region": ["North Central", "Coastal East", "Semi-Arid West", "Hilly Northeast", "Southern Peninsula"],
        "soil_type": ["Alluvial", "Clayey", "Sandy", "Laterite", "Red"],
        "ph_level": [6.5, 5.5, 8.0, 4.5, 6.8],
        "nitrogen_content": [120.5, 80.0, 45.0, 150.0, 95.5],
        "phosphorus_content": [45.0, 30.0, 20.0, 50.0, 40.0]
    }
    pd.DataFrame(soil_data).to_csv(f"{output_dir}/soil_data.csv", index=False)
    print(f"Generated {output_dir}/soil_data.csv")

if __name__ == "__main__":
    generate_synthetic_data()
