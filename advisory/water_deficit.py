from water_needed_per_stage import get_water_need
from soil_retention_factor import SOIL_RETENTION_FACTOR

def calculate_water_deficit(crop, growth_stage, avg_rainfall_7day, soil_type):
    """
    Returns water deficit in mm/week.
    Positive = shortfall (needs irrigation)
    Negative = surplus (possible waterlogging risk)
    """
    base_water_need = get_water_need(crop, growth_stage)       # mm/day
    soil_factor = SOIL_RETENTION_FACTOR.get(soil_type.lower(), 1.0)
    adjusted_daily_need = base_water_need * soil_factor         # mm/day
    weekly_need = adjusted_daily_need * 7                        # mm/week

    deficit = weekly_need - avg_rainfall_7day
    return round(deficit, 2)

if __name__ == "__main__":
    # Original tests
    print(calculate_water_deficit("rice", "flowering", avg_rainfall_7day=30, soil_type="sandy"))
    print(calculate_water_deficit("chickpea", "sowing", avg_rainfall_7day=20, soil_type="clay"))

    # Edge case 1: rainfall exactly meets weekly need → deficit should be 0
    print(calculate_water_deficit("wheat", "vegetative", avg_rainfall_7day=28, soil_type="loamy"))
    # wheat/vegetative = 4 mm/day, loamy factor = 1.0 → weekly_need = 28 → deficit = 0

    # Edge case 2: rainfall = 0 → deficit should equal full weekly_need
    print(calculate_water_deficit("maize", "flowering", avg_rainfall_7day=0, soil_type="loamy"))
    # maize/flowering = 7 mm/day, loamy = 1.0 → weekly_need = 49 → deficit = 49.0

    # Edge case 3: rainfall way more than need → large negative (surplus/waterlogging)
    print(calculate_water_deficit("chickpea", "maturity", avg_rainfall_7day=100, soil_type="clay"))
    # chickpea/maturity = 2 mm/day, clay = 0.8 → weekly_need = 11.2 → deficit = -88.8