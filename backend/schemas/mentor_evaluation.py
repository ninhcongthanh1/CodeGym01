from typing import Annotated, Literal
from pydantic import BaseModel, Field, field_validator, model_validator

Score = Annotated[int, Field(strict=True, ge=1, le=5)]
CRITERIA = ("technical", "problem_solving", "learning", "discipline", "initiative", "teamwork")


class EvaluationSave(BaseModel):
    technical: Score | None = None
    problem_solving: Score | None = None
    learning: Score | None = None
    discipline: Score | None = None
    initiative: Score | None = None
    teamwork: Score | None = None
    strengths: str = Field(default="", max_length=2000)
    improvements: str = Field(default="", max_length=2000)
    conclusion: str = Field(default="", max_length=2000)
    status: Literal["draft", "submitted"] = "draft"
    expected_revision: int = Field(default=0, ge=0, strict=True)

    @field_validator("strengths", "improvements", "conclusion")
    @classmethod
    def strip_text(cls, value):
        return value.strip()

    @model_validator(mode="after")
    def validate_submission(self):
        if self.status == "submitted":
            if any(getattr(self, key) is None for key in CRITERIA):
                raise ValueError("Cần chấm đủ 6 tiêu chí trước khi gửi đánh giá")
            if not all((self.strengths, self.improvements, self.conclusion)):
                raise ValueError("Cần nhập điểm mạnh, điểm cần cải thiện và nhận xét tổng kết")
        return self


class AssignmentSave(BaseModel):
    mentor_id: int = Field(gt=0, strict=True)
