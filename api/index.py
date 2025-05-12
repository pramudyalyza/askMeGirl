import os
import io
import re
import google.generativeai as genai

from typing import List
from pypdf import PdfReader
from pydantic import BaseModel
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, File, UploadFile, Form, HTTPException

load_dotenv()
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY environment variable not set")

genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-2.0-flash')

app = FastAPI()

# Enable CORS to allow your frontend to communicate with the backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Adjust if your frontend runs on a different port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Store the extracted text globally (simple in-memory storage for this example)
pdf_content = ""


@app.post("/api/scrape")
async def scrape_pdf(file: UploadFile = File(...)):
    global pdf_content
    if not file.content_type == "application/pdf":
        raise HTTPException(status_code=400, detail="Invalid file type. Only PDF files are allowed.")
    try:
        contents = await file.read()
        pdf_reader = PdfReader(io.BytesIO(contents))
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text()
        pdf_content = text
        return {"message": "PDF processed successfully!"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing PDF: {e}")


# Define a Pydantic model for the expected request body
class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]


def remove_markdown(text: str) -> str:
    """Removes Markdown-style formatting from the input text.

    Args:
        text: The text to process.

    Returns:
        The text with Markdown formatting removed.
    """
    # Remove bold (**) and italics (*)
    text = re.sub(r'\*\*(.*?)\*\*', r'\1', text)
    text = re.sub(r'\*(.*?)\*', r'\1', text)
    # Remove headings (e.g., #, ##, ###)
    text = re.sub(r'#+\s*(.*)', r'\1', text)
    # Remove Markdown links
    text = re.sub(r'\[(.*?)\]\((.*?)\)', r'\1', text)
    # Remove code blocks (```...``` and `...`)
    text = re.sub(r'```(.*?)```', r'\1', text, flags=re.DOTALL)
    text = re.sub(r'`(.*?)`', r'\1', text)
    # Remove blockquotes
    text = re.sub(r'>\s*(.*)', r'\1', text)
    # Remove ordered and unordered lists
    text = re.sub(r'\d+\.\s*(.*)', r'\1', text)
    text = re.sub(r'[+*]\s*(.*)', r'\1', text)
    # Remove extra newlines and spaces
    text = re.sub(r'\s+', ' ', text)
    text = text.strip()
    # Remove outer quotes, but keep inner quotes
    if text.startswith('"') and text.endswith('"'):
        text = text[1:-1]
    # Strip any additional unwanted quotes or characters
    text = text.strip('"')  # To ensure any extra quotation marks are removed.
    return text
    
@app.post("/api/chat")
async def chat_with_llm(chat_request: ChatRequest):
    global pdf_content
    if not pdf_content:
        raise HTTPException(status_code=400, detail="No PDF content has been processed yet.")

    try:
        messages = chat_request.messages
        is_first_question = len(messages) == 1 and messages[0].role == "user"

        if is_first_question:
            prompt = f"""You are the user's fabulous, smart bestie who always explains things in a fun and easy-to-understand way. You just read the whole PDF for them because you're iconic like that 💁‍♀️ Now you're gonna break it down — no boring details, just the juicy tea.
        
            Here's the PDF:'{pdf_content}' 
            
            And here's the question:
            '{messages[0].content}'"""
        else:
            chat_history = ""
            for message in messages:
                prefix = "You" if message.role == "user" else "Me"
                chat_history += f"{prefix}: {message.content}\n"

            prompt = f"""You are the user's fabulous, smart bestie who always explains things in a fun and easy-to-understand way. You just read the whole PDF for them because you're iconic like that 💁‍♀️ Now you're gonna break it down — no boring details, just the juicy tea.
        
            Here's the PDF:'{pdf_content}' 

            Now continue the conversation:
            {chat_history}
            
            Answer as if you're replying to the last user message."""

        response = model.generate_content(prompt)
        plain_text_response = remove_markdown(response.text)
        return {"response": plain_text_response}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating response: {e}")



if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)