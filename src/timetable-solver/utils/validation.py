from typing import List
from schemas.timetable import CourseOffering, Room

def validate_constraints(
    offerings: List[CourseOffering],
    rooms: List[Room],
    max_credits_long: int = 20,
    max_credits_short: int = 10
) -> List[str]:
    violations = []
    for offering in offerings:
        if offering.maxCapacity < offering.currentEnrolment:
            violations.append(f"Overcapacity: {offering.courseCode}")
    return violations