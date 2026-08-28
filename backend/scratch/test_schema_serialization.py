from google.genai import types
from pydantic import BaseModel
from typing import List

class TestItem(BaseModel):
    name: str
    values: List[int]

# Test setting response_schema in GenerateContentConfig
try:
    config = types.GenerateContentConfig(
        response_mime_type="application/json",
        response_schema=TestItem
    )
    print("Successfully created GenerateContentConfig with Pydantic class!")
    print("Config schema:", config.response_schema)
except Exception as e:
    print("Failed to create GenerateContentConfig:", e)
