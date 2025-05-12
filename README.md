# Ask Me Girl! 

**Ask Me Girl!** is your fabulous, sassy AI bestie who reads boring PDFs *so you don’t have to*. Just upload a file, ask a question, and she’ll hit you back with the tea — no fluff, just vibes. 💁‍♀️✨

Whether it's class notes, work docs, or anything TL;DR, she's here to break it down like you're on FaceTime.

---

### How It Works

1. **Upload the PDF:** Drop your doc, and let your girl read it for you.
2. **Ask the Tea:** Type in any question about the PDF.
3. **Get the Vibe:** Get a fabulous, easy to understand response.

---

### Tech Stack

- **Frontend:** [Next.js](https://nextjs.org)
- **Backend:** FastAPI
- **LLM:** Gemini 2.0 Flash
---

### 🛠 Getting Started

1. Clone this repo:
   ```bash
   git clone https://github.com/pramudyalyza/ask-me-girl.git
   ```
2. Navigate to the project folder:
   ```bash
   cd ask-me-girl
   ```
4. Create your .env file just like .env.example and paste your Gemini API Key
    ```bash
   GEMINI_API_KEY=your_api_key_here
   ```
5. Start the FastAPI backend:
   ```bash
   cd api
   uvicorn index:app --reload
   ```
6. In a new terminal, run the frontend:
   ```bash
   npm run dev
   ```
7. Open http://localhost:3000 in your browser and boom, you're good to go!
