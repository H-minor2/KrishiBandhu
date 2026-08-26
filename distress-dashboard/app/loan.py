
from datetime import date

def get_loan(loans):
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
    ratio = 0.0
    if nearest.amount > 0:
        ratio = min(1.0, max(0.0, outstanding / nearest.amount))

    score = round(0.80 * urgency + 0.20 * ratio * 100.0, 2)

    status = "overdue" if days < 0 else "due"
    explanation = (
        f"Nearest active loan repayment is {status} in {abs(days) if days < 0 else days} "
        f"day(s). Outstanding balance is ₹{outstanding:.0f}."
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
            "outstanding_ratio": round(ratio, 3),
        },
    }
