from pydantic import BaseModel
from typing import List, Optional

class CourseForMerge(BaseModel):
    id: str
    code: str
    name: str
    enrolment: int
    programmeId: str

class MergeRequest(BaseModel):
    courseA: CourseForMerge
    courseB: CourseForMerge
    semesterId: str
    candidateVenues: List[str] = []

class MergedSection(BaseModel):
    combinedEnrolment: int
    combinedCourses: List[str]
    venueId: str
    dayOfWeek: int
    startTime: str
    endTime: str

class MergeResponse(BaseModel):
    canMerge: bool
    mergedSection: Optional[MergedSection] = None
    reason: Optional[str] = None
    requiredVenueCapacity: int
    warnings: List[str] = []