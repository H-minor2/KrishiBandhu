from datetime import date

def get_loan(loans, annual_income: float = 60000.0):
    active = [l for l in loans if l.status.lower() == "active"]
    if not active:
        return {
            "score": 0.0,
            "explanation": "No active loan repayment is recorded.",
            "data_quality": "GOOD",
            "data": {"active_loans": 0},
        }

    today = date.today()
    nearest = min(active, key=lambda x: x.due_date)
    days = (nearest.due_date - today).days

    if days < 0:
        urgency = 100.0
    elif days <= 7:
        urgency = 100.0
    elif days <= 30:
        urgency = 80.0
    elif days <= 60:
        urgency = 50.0
    elif days <= 120:
        urgency = 20.0
    else:
        urgency = 10.0

    outstanding = (
        nearest.outstanding_amount
        if nearest.outstanding_amount is not None
        else nearest.amount
    )
    
    # Calculate Debt-to-Income (DTI) Ratio
    # This evaluates the true financial burden on the farmer
    dti_ratio = 0.0
    if annual_income > 0:
        dti_ratio = outstanding / annual_income

    # Score based on DTI severity
    # > 50% is considered extremely high risk in agriculture
    dti_score = 0.0
    if dti_ratio > 0.50:
        dti_score = 100.0
    elif dti_ratio > 0.35:
        dti_score = 75.0
    elif dti_ratio > 0.20:
        dti_score = 50.0
    elif dti_ratio > 0.10:
        dti_score = 25.0
    else:
        dti_score = 0.0

    # Combine urgency and DTI burden
    if dti_ratio > 1.0:
        # Extreme DTI overrides urgency
        score = max(80.0, dti_score)
    elif dti_ratio > 0.60:
        score = max(60.0, round(0.50 * urgency + 0.50 * dti_score, 2))
    else:
        score = round(0.50 * urgency + 0.50 * dti_score, 2)

    status = "overdue" if days < 0 else "due"
    explanation = (
        f"Nearest active loan repayment is {status} in {abs(days) if days < 0 else days} "
        f"day(s). Outstanding balance is ₹{outstanding:.0f} (DTI: {dti_ratio*100:.1f}% of ₹{annual_income:.0f} income)."
    )

    return {
        "score": score,
        "explanation": explanation,
        "data_quality": "GOOD",
        "data": {
            "loan_id": nearest.loan_id,
            "days_to_due": days,
            "amount": nearest.amount,
            "outstanding_amount": outstanding,
            "annual_income": annual_income,
            "dti_ratio": round(dti_ratio, 3),
        },
    }
