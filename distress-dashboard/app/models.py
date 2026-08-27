
from datetime import date
from typing import Any
from pydantic import BaseModel, Field


class Location(BaseModel):
    state: str
    district: str = ""
    latitude: float
    longitude: float


class Crop(BaseModel):
    name: str
    area_acres: float | None = Field(default=None, gt=0)


class Market(BaseModel):
    name: str = ""


class Loan(BaseModel):
    loan_id: str
    amount: float = Field(ge=0)
    outstanding_amount: float | None = Field(default=None, ge=0)
    due_date: date
    status: str = "active"


class DistressRequest(BaseModel):
    farmer_id: str
    location: Location
    crop: Crop
    market: Market = Market()
    loans: list[Loan] = []


class ComponentScore(BaseModel):
    score: float
    weight: float
    contribution: float
    explanation: str
    data_quality: str = "GOOD"
    data: dict[str, Any] = {}


class DistressResponse(BaseModel):
    farmer_id: str
    distress_score: float
    risk_level: str
    components: dict[str, ComponentScore]
    reasons: list[str]
    metadata: dict[str, Any]
