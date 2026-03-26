import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from groq import Groq

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

SYSTEM_PROMPT = """You are a specialized AI assistant for the 'Royal Fitness Awareness System'.
Your ONLY purpose is to provide advice, answers, and plans related to weight loss and diet.
If the user asks about anything else (e.g., programming, general knowledge, movies, other medical advice), you MUST politely refuse to answer and remind them that you can only help with weight loss, diet, and nutrition."""

class ChatRequest(BaseModel):
    prompt: str

@app.post("/api/chat")
async def chat_endpoint(req: ChatRequest):
    try:
        completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": req.prompt}
            ],
            model="llama-3.1-8b-instant",
        )
        reply = completion.choices[0].message.content
        return {"reply": reply}
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail="Error processing AI request")

if __name__ == "__main__":
    import uvicorn
    # The frontend is calling http://localhost:5001/api/chat
    uvicorn.run(app, host="0.0.0.0", port=5001)
