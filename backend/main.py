from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import io
import re
from typing import Optional, List

# NLP libraries
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from nltk.util import ngrams

# Semantic Deep Learning (Pre-trained on millions of datasets)
try:
    from sentence_transformers import SentenceTransformer
    # all-MiniLM-L6-v2 is an extremely fast and powerful semantic model
    semantic_model = SentenceTransformer('all-MiniLM-L6-v2')
    HAS_SEMANTIC_MODEL = True
except ImportError:
    HAS_SEMANTIC_MODEL = False

# Document parsing
from PyPDF2 import PdfReader
import docx

try:
    nltk.data.find('tokenizers/punkt')
    nltk.data.find('corpora/stopwords')
    nltk.data.find('taggers/averaged_perceptron_tagger_eng')
except LookupError:
    nltk.download('punkt')
    nltk.download('stopwords')
    nltk.download('punkt_tab')
    nltk.download('averaged_perceptron_tagger_eng')

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def extract_text_from_pdf(file_bytes: bytes) -> str:
    reader = PdfReader(io.BytesIO(file_bytes))
    return "\n".join([page.extract_text() for page in reader.pages if page.extract_text()])

def extract_text_from_docx(file_bytes: bytes) -> str:
    doc = docx.Document(io.BytesIO(file_bytes))
    return "\n".join([paragraph.text for paragraph in doc.paragraphs])

def preprocess_text(text: str, extract_nouns_only: bool = False) -> str:
    text = re.sub(r'[^a-zA-Z\s]', '', text)
    tokens = word_tokenize(text)
    stop_words = set(stopwords.words('english'))
    filtered_tokens = [w for w in tokens if w.lower() not in stop_words]
    
    if extract_nouns_only:
        # Only keep Nouns (NN, NNS, NNP, NNPS) representing skills/tools
        pos_tags = nltk.pos_tag(filtered_tokens)
        filtered_tokens = [word for word, tag in pos_tags if tag.startswith('NN')]
        
    return " ".join([w.lower() for w in filtered_tokens])

# ATS Curve to scale raw mathematical similarity into expected human accuracy
def ats_scale(raw_score: float) -> float:
    # If a CV has 65% exact keyword overlap with a JD, it's virtually a perfect match (99%+)
    # We apply a logarithmic/multiplier curve
    scaled = raw_score * 1.5
    return min(1.0, scaled)

def get_keyword_coverage(jd_text: str, cv_text: str) -> float:
    jd_tokens = set(word_tokenize(jd_text))
    cv_tokens = set(word_tokenize(cv_text))
    if not jd_tokens: return 0.0
    intersection = jd_tokens.intersection(cv_tokens)
    raw = len(intersection) / len(jd_tokens)
    return ats_scale(raw)

def get_ngram_coverage(jd_text: str, cv_text: str, n: int = 2) -> float:
    jd_tokens = word_tokenize(jd_text)
    cv_tokens = word_tokenize(cv_text)
    if len(jd_tokens) < n or len(cv_tokens) < n: return 0.0
    jd_ngrams = set(ngrams(jd_tokens, n))
    cv_ngrams = set(ngrams(cv_tokens, n))
    if not jd_ngrams: return 0.0
    intersection = jd_ngrams.intersection(cv_ngrams)
    raw = len(intersection) / len(jd_ngrams)
    return ats_scale(raw)

def get_deep_semantic_similarity(jd_raw: str, cv_raw: str) -> float:
    if not HAS_SEMANTIC_MODEL:
        if not jd_raw or not cv_raw: return 0.0
        try:
            vectors = TfidfVectorizer().fit_transform([jd_raw, cv_raw])
            sim = float(cosine_similarity(vectors[0:1], vectors[1:2])[0][0])
            return ats_scale(sim)
        except ValueError: return 0.0
    
    embeddings = semantic_model.encode([jd_raw, cv_raw])
    sim = cosine_similarity([embeddings[0]], [embeddings[1]])[0][0]
    return max(0.0, ats_scale(float(sim)))

async def resolve_text(text_val: Optional[str], file_val: Optional[UploadFile]) -> str:
    final_text = text_val or ""
    if file_val and file_val.filename:
        file_bytes = await file_val.read()
        if file_val.filename.endswith(".pdf"):
            final_text += " " + extract_text_from_pdf(file_bytes)
        elif file_val.filename.endswith(".docx"):
            final_text += " " + extract_text_from_docx(file_bytes)
        else:
            final_text += " " + file_bytes.decode('utf-8', errors='ignore')
    return final_text.strip()

def compute_metrics(jd_raw: str, cv_raw: str, clean_jd: str, clean_cv: str):
    keyword_score = get_keyword_coverage(clean_jd, clean_cv) * 100
    ngram_score = get_ngram_coverage(clean_jd, clean_cv, n=2) * 100
    semantic_score = get_deep_semantic_similarity(jd_raw, cv_raw) * 100
    
    # Weight the deep semantic score heavily as it understands meaning
    avg = (keyword_score * 0.3) + (ngram_score * 0.2) + (semantic_score * 0.5)

    return {
        "bow_score": round(keyword_score, 2), 
        "tfidf_score": round(semantic_score, 2), # UI still expects tfidf_score, mapped to semantic
        "ngram_score": round(ngram_score, 2), 
        "average_score": round(avg, 2)
    }

@app.post("/compare")
async def compare_cv_jd(
    job_description: Optional[str] = Form(None),
    job_file: Optional[UploadFile] = File(None),
    cv_text: Optional[str] = Form(None),
    cv_file: Optional[UploadFile] = File(None)
):
    final_jd_text = await resolve_text(job_description, job_file)
    final_cv_text = await resolve_text(cv_text, cv_file)
    
    if not final_jd_text or not final_cv_text:
        return {"error": "Both Job Description and CV are required (text or file)."}

    # Use Part-of-Speech tagging to extract only Nouns (skills) from JD!
    clean_jd = preprocess_text(final_jd_text, extract_nouns_only=True)
    clean_cv = preprocess_text(final_cv_text, extract_nouns_only=False)

    metrics = compute_metrics(final_jd_text, final_cv_text, clean_jd, clean_cv)
    return metrics

@app.post("/compare_bulk")
async def compare_bulk(
    job_description: Optional[str] = Form(None),
    job_file: Optional[UploadFile] = File(None),
    cv_files: List[UploadFile] = File(default=[]),
    cv_texts: List[str] = Form(default=[])
):
    final_jd_text = await resolve_text(job_description, job_file)
    if not final_jd_text:
        return {"error": "Job Description is required."}
    
    clean_jd = preprocess_text(final_jd_text, extract_nouns_only=True)
    results = []

    for cv_file in cv_files:
        if not cv_file.filename: continue
        cv_text_val = await resolve_text(None, cv_file)
        if not cv_text_val: continue
        clean_cv = preprocess_text(cv_text_val, extract_nouns_only=False)
        
        metrics = compute_metrics(final_jd_text, cv_text_val, clean_jd, clean_cv)
        metrics["filename"] = cv_file.filename
        results.append(metrics)
        
    for i, cv_text_val in enumerate(cv_texts):
        if not cv_text_val.strip(): continue
        clean_cv = preprocess_text(cv_text_val, extract_nouns_only=False)
        
        metrics = compute_metrics(final_jd_text, cv_text_val, clean_jd, clean_cv)
        metrics["filename"] = f"Pasted CV #{i+1}"
        results.append(metrics)

    results.sort(key=lambda x: x["average_score"], reverse=True)
    return {"results": results}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
