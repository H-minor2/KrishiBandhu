from fastapi import APIRouter
from pydantic import BaseModel
from .water_deficit import calculate_water_deficit
from .advisory_rules import generate_advisory

router = APIRouter()

class AdvisoryRequest(BaseModel):
    crop: str
    growth_stage: str
    avg_rainfall_7day: float
    pesticide_applied: bool
    soil_type: str

@router.post("/advisory")
def get_advisory(request: AdvisoryRequest):
    deficit = calculate_water_deficit(
        crop=request.crop,
        growth_stage=request.growth_stage,
        avg_rainfall_7day=request.avg_rainfall_7day,
        soil_type=request.soil_type
    )

    advisory_text = generate_advisory(
        crop=request.crop,
        growth_stage=request.growth_stage,
        water_deficit=deficit,
        pesticide_applied=request.pesticide_applied
    )

    return {
        "crop": request.crop,
        "growth_stage": request.growth_stage,
        "water_deficit_mm": deficit,
        "advisory": advisory_text
    }