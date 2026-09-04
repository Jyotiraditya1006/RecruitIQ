# RecruitIQ 🚀

RecruitIQ is a full-stack, AI-powered Applicant Tracking System (ATS) and Resume Matcher designed to help recruiters and hiring managers instantly screen and rank candidates. It uses mathematical overlapping and Deep Learning to extract meaning from text, stripping away boilerplate job description fluff to find true technical matches.

## Features

- **Applicant Mode:** Single CV testing. Allows a user to verify how well their resume aligns with a specific Job Description.
- **Recruiter Mode (Bulk):** Upload or paste multiple candidate CVs at once and get an instantly ranked leaderboard.
- **Advanced NLP Pipeline:**
  - **Keyword Coverage (BoW):** Extracts pure technical nouns and skills from the JD using NLTK POS Tagging, entirely ignoring non-technical boilerplate.
  - **Semantic Context (N-Grams):** Matches two-word phrases to ensure candidates actually have the *context* of a skill (e.g. "Machine Learning" vs just "Learning").
  - **Deep Semantic AI Fallback:** Utilizes TF-IDF vectorization and pre-trained Deep Learning Transformers (`sentence-transformers`) for deep contextual understanding.
- **ATS Accuracy Scaling:** Raw math rarely yields 100% due to phrasing differences. The algorithm applies a logarithmic human-scaling curve, ensuring that candidates who meet core requirements score in the 95-100% range.
- **Dual Themes:** Clean, static minimalist Light Mode (default) and a deep Navy Dashboard Dark Mode.

## Tech Stack

- **Frontend:** Next.js / React Native (Expo Web), TypeScript, Axios
- **Backend:** Python, FastAPI, NLTK, Scikit-learn, Sentence-Transformers, PyPDF2, python-docx
- **Data Engineering:** Custom synthetic data generation script capable of rapidly generating millions of realistic training records for ML models.

## Local Setup

### 1. Start the Backend API (FastAPI)
```bash
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

### 2. Start the Frontend (Expo/React)
```bash
cd frontend
npm install
npm run web
```
*The web app will run locally on port 8081.*

---
*Developed by Jyotiraditya Patil.*
