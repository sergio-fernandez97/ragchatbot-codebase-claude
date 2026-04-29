from typing import List, Dict, Optional
from pydantic import BaseModel

class Lesson(BaseModel):
    """Represents a lesson within a course"""
    lesson_number: int  # Sequential lesson number (1, 2, 3, etc.)
    title: str         # Lesson title
    lesson_link: Optional[str] = None  # URL link to the lesson

class Course(BaseModel):
    """Represents a complete course with its lessons"""
    title: str                 # Full course title (used as unique identifier)
    course_link: Optional[str] = None  # URL link to the course
    instructor: Optional[str] = None  # Course instructor name (optional metadata)
    lessons: List[Lesson] = [] # List of lessons in this course

class CourseChunk(BaseModel):
    """Represents a text chunk from a course for vector storage"""
    content: str                        # The actual text content
    course_title: str                   # Which course this chunk belongs to
    lesson_number: Optional[int] = None # Which lesson this chunk is from
    chunk_index: int                    # Position of this chunk in the document

class LessonDetail(BaseModel):
    """Lesson metadata for catalog response"""
    lesson_number: int
    title: str
    lesson_link: Optional[str] = None

class CatalogCourse(BaseModel):
    """Course metadata for catalog response"""
    title: str
    instructor: Optional[str] = None
    course_link: Optional[str] = None
    lesson_count: int = 0
    lessons: List[LessonDetail] = []

class CatalogResponse(BaseModel):
    """Response model for course catalog"""
    total_courses: int
    courses: List[CatalogCourse]

class SourceCitation(BaseModel):
    """Structured citation for query response sources"""
    course_title: str
    lesson_number: Optional[int] = None
    course_link: Optional[str] = None
    lesson_link: Optional[str] = None