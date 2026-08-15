import os
import requests
from dotenv import load_dotenv

load_dotenv()

HUNAR_API_KEY = os.getenv("HUNAR_API_KEY")

BASE_URL = "https://api.voice.hunar.ai/external/v1"


def get_agents():
    headers = {
        "X-API-Key": HUNAR_API_KEY,
        "Content-Type": "application/json"
    }

    response = requests.get(
        f"{BASE_URL}/agents/",
        headers=headers
    )

    if response.status_code == 200:
        return response.json()

    return {
        "error": True,
        "status_code": response.status_code,
        "message": response.text
    }
    
    
import uuid


TECH_RECRUITMENT_AGENT_ID = "51f0b840-b442-4097-aabe-c32185a3b47c"


def start_screening_call(
    callee_name: str,
    mobile_number: str,
    job_title: str,
    required_skills: str,
    company_name: str
):
    headers = {
        "X-API-Key": HUNAR_API_KEY,
        "Content-Type": "application/json"
    }

    payload = {
        "agent_id": TECH_RECRUITMENT_AGENT_ID,
        "callee_name": callee_name,
        "mobile_number": mobile_number,
        "custom_data": {
            "job_title": job_title,
            "required_skills": required_skills,
            "company_name": company_name
        },
        "request_id": f"screening-{uuid.uuid4()}"
    }

    response = requests.post(
        f"{BASE_URL}/calls/",
        headers=headers,
        json=payload
    )

    if response.status_code == 200:
        return response.json()

    return {
        "error": True,
        "status_code": response.status_code,
        "message": response.text
    }
    
    
def get_call(call_id: str):
    headers = {
        "X-API-Key": HUNAR_API_KEY,
        "Content-Type": "application/json"
    }

    response = requests.get(
            f"{BASE_URL}/calls/{call_id}/",
            headers=headers
        )

    if response.status_code == 200:
            return response.json()

    return {
            "error": True,
            "status_code": response.status_code,
            "message": response.text
        }