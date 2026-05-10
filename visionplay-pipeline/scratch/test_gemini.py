import os
from google import generativeai as genai    

API_KEY = "AIzaSyBXDX0ZHT0tipCLJ75L7ivd2YN-9kZGrsQ"
genai.configure(api_key=API_KEY)
model = genai.GenerativeModel('gemini-2.5-flash')

async def test_gemini():
    try:
        response = await model.generate_content_async("Say 'Gemini is active' if you can read this.")
        print(f"RESPONSE: {response.text}")
    except Exception as e:
        print(f"ERROR: {e}")

if __name__ == "__main__":
    import asyncio
    asyncio.run(test_gemini())
