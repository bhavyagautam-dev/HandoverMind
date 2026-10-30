
import os
import json
from groq import Groq


def generate_sbar_summary(notes):
    api_key = os.getenv("GROQ_API_KEY")

    if not api_key:
        raise ValueError("GROQ_API_KEY is missing from environment.")

    client = Groq(api_key=api_key)

    prompt = f"""
You are an assistant that organizes nursing handoff notes.

Use ONLY the information provided in the notes.
Do not invent symptoms, vital signs, diagnoses, medications, or treatments.
If information is missing, write "Not provided".
Treat the output as a draft requiring review by a qualified nurse.

Return valid JSON with exactly these keys:
- situation
- background
- assessment
- recommendation
- risk_level

Risk level must be one of: Low, Medium, High, Critical.
Do not diagnose or independently determine emergency treatment.
If the notes do not provide enough information to assess risk,
use Low as a placeholder and state in assessment that risk is
undetermined and requires nurse review.

Nursing notes:
{notes}
"""

    response = client.chat.completions.create(
       model="openai/gpt-oss-120b",
        messages=[
            {
                "role": "system",
                "content": (
                    "Organize nursing handoff information accurately. "
                    "Never fabricate clinical facts. Return JSON only."
                ),
            },
            {"role": "user", "content": prompt},
        ],
        temperature=0.1,
        response_format={"type": "json_object"},
    )

    result = json.loads(response.choices[0].message.content)

    required_keys = {
        "situation",
        "background",
        "assessment",
        "recommendation",
        "risk_level",
    }

    if not required_keys.issubset(result):
        raise ValueError("AI returned an incomplete SBAR response.")

    if result["risk_level"] not in {"Low", "Medium", "High", "Critical"}:
        raise ValueError("AI returned an invalid risk level.")

    result["sbar_summary"] = (
        f"Situation: {result['situation']}\n"
        f"Background: {result['background']}\n"
        f"Assessment: {result['assessment']}\n"
        f"Recommendation: {result['recommendation']}"
    )

    return result
