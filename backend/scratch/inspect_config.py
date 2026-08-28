from google.genai import types
import json

config_class = types.GenerateContentConfig
print("Pydantic fields of GenerateContentConfig:")
for name, field in config_class.model_fields.items():
    print(f"- {name}: annotation={field.annotation}, default={field.default}")
