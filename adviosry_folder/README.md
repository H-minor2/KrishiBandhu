# Advisory Module

## Endpoint
POST /advisory

## Request Body
{
  "crop": "string",
  "growth_stage": "string",   // one of: sowing, vegetative, flowering, fruiting, maturity
  "avg_rainfall_7day": float,
  "pesticide_applied": boolean,
  "soil_type": "string"       // one of: sandy, loamy, clay
}

## Response
{
  "crop": "string",
  "growth_stage": "string",
  "water_deficit_mm": float,
  "advisory": "string"
}

## Supported crops
rice, wheat, maize, chickpea, pigeon_pea, cotton, sugarcane, tomato, potato

## Important
`growth_stage` and `soil_type` must match the exact values above (lowercase).
Anything else silently falls back to default values — no error is thrown.

## Files
- main.py — FastAPI app + /advisory endpoint
- crop_stages.py — crop → generic stage → real stage name
- water_needed_per_stage.py — crop water requirement (mm/day)
- soil_retention_factor.py — soil type multiplier
- water_deficit.py — deficit calculation
- advisory_rules.py — advisory text generation


## Note to the developer team
growth_stage must be sent as exactly one of these 5 lowercase strings: sowing, vegetative, flowering, fruiting, maturity. Any other value (different casing, a synonym, a typo) won't error — it'll silently return default/generic values instead of crop-specific advisory data. If you're using a dropdown on the frontend, hardcode these 5 exact values as the options so users can't free-type something else.