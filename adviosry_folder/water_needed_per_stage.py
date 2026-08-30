WATER_NEED_MM_PER_DAY = {
    "rice": {
        "sowing": 5,
        "vegetative": 6,
        "flowering": 8,
        "fruiting": 7,
        "maturity": 4
    },
    "wheat": {
        "sowing": 3,
        "vegetative": 4,
        "flowering": 6,
        "fruiting": 5,
        "maturity": 2
    },
    "maize": {
        "sowing": 4,
        "vegetative": 5,
        "flowering": 7,
        "fruiting": 6,
        "maturity": 3
    },
    "chickpea": {
        "sowing": 2,
        "vegetative": 3,
        "flowering": 4,
        "fruiting": 3,
        "maturity": 2
    },
    "pigeon_pea": {
        "sowing": 3,
        "vegetative": 4,
        "flowering": 5,
        "fruiting": 4,
        "maturity": 2
    },
    "cotton": {
        "sowing": 3,
        "vegetative": 5,
        "flowering": 7,
        "fruiting": 6,
        "maturity": 3
    },
    "sugarcane": {
        "sowing": 4,
        "vegetative": 6,
        "flowering": 7,
        "fruiting": 7,
        "maturity": 5
    },
    "tomato": {
        "sowing": 3,
        "vegetative": 4,
        "flowering": 5,
        "fruiting": 6,
        "maturity": 4
    },
    "potato": {
        "sowing": 3,
        "vegetative": 4,
        "flowering": 5,
        "fruiting": 5,
        "maturity": 3
    }
}

def get_water_need(crop: str, generic_stage: str) -> float:
    """Returns water requirement (mm/day) for a given crop and generic stage."""
    crop = crop.lower()
    generic_stage = generic_stage.lower()
    if crop not in WATER_NEED_MM_PER_DAY:
        return 5.0  # fallback default
    return WATER_NEED_MM_PER_DAY[crop].get(generic_stage, 5.0)