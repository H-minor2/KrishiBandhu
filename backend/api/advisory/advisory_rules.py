ADVISORY_TEMPLATES = {
    "severe_deficit": "Your {crop} urgently needs irrigation. Water deficit is high at {deficit}mm this week during the {stage} stage.",
    "moderate_deficit": "Your {crop} needs additional watering soon. Deficit is {deficit}mm during the {stage} stage.",
    "adequate": "Rainfall is sufficient for your {crop} at the {stage} stage. No irrigation needed this week.",
    "surplus": "Your {crop} received more rainfall than needed. Watch for waterlogging risk.",
    "severe_surplus": "Excess water detected for your {crop}. Check field drainage immediately to prevent root damage.",
    "pesticide_reminder": "Since pesticide was recently applied, avoid irrigation for the next 24-48 hours to prevent runoff.",
    "critical_stage_warning": "Your {crop} is in a water-sensitive stage ({stage}). Monitor soil moisture closely.",
}

def generate_advisory(crop, growth_stage, water_deficit, pesticide_applied):
    messages = []

    # Deficit/surplus logic
    if water_deficit > 20:
        messages.append(ADVISORY_TEMPLATES["severe_deficit"].format(
            crop=crop, deficit=water_deficit, stage=growth_stage))
    elif water_deficit > 5:
        messages.append(ADVISORY_TEMPLATES["moderate_deficit"].format(
            crop=crop, deficit=water_deficit, stage=growth_stage))
    elif water_deficit < -20:
        messages.append(ADVISORY_TEMPLATES["severe_surplus"].format(crop=crop))
    elif water_deficit < -5:
        messages.append(ADVISORY_TEMPLATES["surplus"].format(crop=crop))
    else:
        messages.append(ADVISORY_TEMPLATES["adequate"].format(crop=crop, stage=growth_stage))

    # Pesticide logic — independent, can stack with the above
    if pesticide_applied:
        messages.append(ADVISORY_TEMPLATES["pesticide_reminder"])

    # Critical stage flag — stacks too
    if growth_stage.lower() == "flowering":
        messages.append(ADVISORY_TEMPLATES["critical_stage_warning"].format(
            crop=crop, stage=growth_stage))

    return " ".join(messages)

if __name__ == "__main__":
    print(generate_advisory("rice", "flowering", water_deficit=42.8, pesticide_applied=True))
    print(generate_advisory("chickpea", "sowing", water_deficit=-8.8, pesticide_applied=False))
    print(generate_advisory("wheat", "vegetative", water_deficit=0, pesticide_applied=False))