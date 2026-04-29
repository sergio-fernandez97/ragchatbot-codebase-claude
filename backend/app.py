import warnings
warnings.filterwarnings("ignore", message="resource_tracker: There appear to be.*")

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os

from config import config
from rag_system import RAGSystem

# Initialize FastAPI app
app = FastAPI(title="Course Materials RAG System", root_path="")

# Add trusted host middleware for proxy
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["*"]
)

# Enable CORS with proper settings for proxy
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Initialize RAG system
rag_system = RAGSystem(config)

# Pydantic models for request/response
class QueryRequest(BaseModel):
    """Request model for course queries"""
    query: str
    session_id: Optional[str] = None

class StructuredSource(BaseModel):
    """A single structured source reference from a query result"""
    course_title: str
    lesson_number: Optional[int] = None
    lesson_title: Optional[str] = None
    link: Optional[str] = None

class QueryResponse(BaseModel):
    """Response model for course queries"""
    answer: str
    sources: List[str]
    structured_sources: Optional[List[StructuredSource]] = None
    session_id: str

class CourseStats(BaseModel):
    """Response model for course statistics"""
    total_courses: int
    course_titles: List[str]

class CatalogLesson(BaseModel):
    """A single lesson entry in the catalog"""
    lesson_number: int
    title: str
    lesson_link: Optional[str] = None

class CatalogCourse(BaseModel):
    """A single course entry in the catalog"""
    title: str
    instructor: Optional[str] = None
    course_link: Optional[str] = None
    lesson_count: int
    lessons: List[CatalogLesson]

class CatalogResponse(BaseModel):
    """Response model for the course catalog"""
    courses: List[CatalogCourse]

# API Endpoints

@app.post("/api/query", response_model=QueryResponse)
async def query_documents(request: QueryRequest):
    """Process a query and return response with sources"""
    try:
        # Create session if not provided
        session_id = request.session_id
        if not session_id:
            session_id = rag_system.session_manager.create_session()
        
        # Process query using RAG system
        answer, sources, structured_sources_data = rag_system.query(request.query, session_id)

        structured_sources = [StructuredSource(**s) for s in structured_sources_data] if structured_sources_data else None

        return QueryResponse(
            answer=answer,
            sources=sources,
            structured_sources=structured_sources,
            session_id=session_id
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/courses", response_model=CourseStats)
async def get_course_stats():
    """Get course analytics and statistics"""
    try:
        analytics = rag_system.get_course_analytics()
        return CourseStats(
            total_courses=analytics["total_courses"],
            course_titles=analytics["course_titles"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/catalog", response_model=CatalogResponse)
async def get_course_catalog():
    """Get full course catalog with lesson details and links"""
    try:
        courses_data = rag_system.get_course_catalog()
        courses = []
        for course in courses_data:
            lessons = [
                CatalogLesson(
                    lesson_number=lesson["lesson_number"],
                    title=lesson.get("lesson_title") or lesson.get("title", ""),
                    lesson_link=lesson.get("lesson_link")
                )
                for lesson in course.get("lessons", [])
            ]
            courses.append(CatalogCourse(
                title=course.get("title", ""),
                instructor=course.get("instructor"),
                course_link=course.get("course_link"),
                lesson_count=course.get("lesson_count", len(lessons)),
                lessons=lessons
            ))
        return CatalogResponse(courses=courses)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.on_event("startup")
async def startup_event():
    """Load initial documents on startup"""
    docs_path = "../docs"
    if os.path.exists(docs_path):
        print("Loading initial documents...")
        try:
            courses, chunks = rag_system.add_course_folder(docs_path, clear_existing=False)
            print(f"Loaded {courses} courses with {chunks} chunks")
        except Exception as e:
            print(f"Error loading documents: {e}")

# Custom static file handler with no-cache headers for development
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os
from pathlib import Path


class DevStaticFiles(StaticFiles):
    async def get_response(self, path: str, scope):
        response = await super().get_response(path, scope)
        if isinstance(response, FileResponse):
            # Add no-cache headers for development
            response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
            response.headers["Pragma"] = "no-cache"
            response.headers["Expires"] = "0"
        return response
    
    
# Serve static files for the frontend
app.mount("/", StaticFiles(directory="../frontend", html=True), name="static")