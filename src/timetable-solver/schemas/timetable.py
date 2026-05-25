from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class CourseOffering(BaseModel):
    id: str
    courseId: str
    courseCode: str
    courseName: str
    creditHours: int
    courseType: str
    lecturerId: str
    maxCapacity: int
    currentEnrolment: int
    prerequisites: List[str] = []

class Room(BaseModel):
    id: str
    code: str
    name: str
    capacity: int
    building: str
    floor: int
    equipment: List[str] = []

class Lecturer(BaseModel):
    id: str
    name: str
    maxTeachingLoad: int
    availability: List[dict]

class StudentGroup(BaseModel):
    id: str
    programmeId: str
    studentCount: int
    enrolments: List[str]

class TimeSlot(BaseModel):
    dayOfWeek: int
    startTime: str
    endTime: str

class ConstraintWeights(BaseModel):
    minimizeDays: float = 10.0
    minimizeGaps: float = 5.0
    studentPreferences: float = 3.0
    roomUtilization: float = 8.0

class TimetableRequest(BaseModel):
    semesterId: str
    offerings: List[CourseOffering]
    rooms: List[Room]
    lecturers: List[Lecturer]
    studentGroups: List[StudentGroup]
    existingBookings: List[dict] = []
    constraints: Optional[ConstraintWeights] = None
    timeSlots: List[TimeSlot]

class TimetableSlot(BaseModel):
    id: str
    courseOfferingId: str
    sectionId: str
    venueId: str
    dayOfWeek: int
    startTime: str
    endTime: str

class TimetableResponse(BaseModel):
    timetableId: str
    semesterId: str
    solverScore: float
    slots: List[TimetableSlot]
    violations: List[str] = []
    status: str