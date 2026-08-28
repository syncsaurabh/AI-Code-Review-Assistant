import sys
from google import genai
from google.genai import types

print("Python version:", sys.version)
print("genai module:", genai)
print("types module:", types)

try:
    client = genai.Client()
    print("Client initialized successfully without API key (reads from env/default)")
except Exception as e:
    print("Client initialization failed (expected if key is missing):", e)
