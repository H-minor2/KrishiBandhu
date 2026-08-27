CROP_STAGES = {
    "rice": {
        "sowing": "Nursery",
        "vegetative": "Tillering",
        "flowering": "Panicle Initiation / Flowering",
        "fruiting": "Grain Filling",
        "maturity": "Maturity"
    },
    "wheat": {
        "sowing": "Sowing",
        "vegetative": "Tillering / Jointing",
        "flowering": "Heading / Flowering",
        "fruiting": "Grain Filling",
        "maturity": "Maturity"
    },
    "maize": {
        "sowing": "Sowing",
        "vegetative": "Vegetative (V-stages)",
        "flowering": "Tasseling / Silking",
        "fruiting": "Grain Filling",
        "maturity": "Maturity"
    },
    "chickpea": {
        "sowing": "Sowing",
        "vegetative": "Vegetative",
        "flowering": "Flowering",
        "fruiting": "Pod Formation",
        "maturity": "Maturity"
    },
    "pigeon_pea": {
        "sowing": "Sowing",
        "vegetative": "Vegetative",
        "flowering": "Flowering",
        "fruiting": "Pod Development",
        "maturity": "Maturity"
    },
    "cotton": {
        "sowing": "Sowing / Seedling",
        "vegetative": "Squaring",
        "flowering": "Flowering",
        "fruiting": "Boll Development",
        "maturity": "Maturity"
    },
    "sugarcane": {
        "sowing": "Planting",
        "vegetative": "Tillering / Grand Growth",
        "flowering": "Grand Growth",
        "fruiting": "Grand Growth",
        "maturity": "Maturity"
    },
    "tomato": {
        "sowing": "Nursery",
        "vegetative": "Vegetative",
        "flowering": "Flowering",
        "fruiting": "Fruiting",
        "maturity": "Harvest"
    },
    "potato": {
        "sowing": "Planting",
        "vegetative": "Vegetative",
        "flowering": "Tuber Initiation",
        "fruiting": "Bulking",
        "maturity": "Maturity"
    }
}

def get_stage_label(crop: str, generic_stage: str) -> str:
    """Returns the crop-specific stage name for a given generic stage."""
    crop = crop.lower()
    generic_stage = generic_stage.lower()
    if crop not in CROP_STAGES:
        return generic_stage.capitalize()  # fallback if crop not in dict
    return CROP_STAGES[crop].get(generic_stage, generic_stage.capitalize())