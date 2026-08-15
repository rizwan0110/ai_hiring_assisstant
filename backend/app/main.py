from fastapi import FastAPI
from pydantic import BaseModel

from services.hunar import get_agents, start_screening_call,get_call
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ScreeningRequest(BaseModel):
    callee_name: str
    mobile_number: str
    job_title: str
    required_skills: str
    company_name: str



@app.get("/")
def root():
    return {"message": "AI Hiring Assistant API is running"}


@app.get("/agents")
def agents():
    return get_agents()


@app.post("/screening-call")
def screening_call(request: ScreeningRequest):
    return start_screening_call(
        callee_name=request.callee_name,
        mobile_number=request.mobile_number,
        job_title=request.job_title,
        required_skills=request.required_skills,
        company_name=request.company_name
    )


@app.get("/calls/{call_id}")
def call_details(call_id: str):
    return get_call(call_id)