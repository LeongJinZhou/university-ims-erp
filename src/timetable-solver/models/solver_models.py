from dataclasses import dataclass
from typing import List, Optional

@dataclass
class CourseData:
    id: str
    code: str
    name: str
    credit_hours: int
    course_type: str
    lecturer_id: str
    max_capacity: int
    enrolment: int

@dataclass
class RoomData:
    id: str
    code: str
    capacity: int
    building: str
    floor: int
    equipment: List[str]

@dataclass
class LecturerData:
    id: str
    name: str
    max_load: int
    available_days: List[int]
    preferred_start: str
    preferred_end: str

@dataclass
class TimeSlotData:
    day: int
    start: str
    end: str

@dataclass
class ConstraintConfig:
    max_credits_per_semester: int = 20
    soft_semester_max: int = 10
    minimize_consec_lectures: int = 2