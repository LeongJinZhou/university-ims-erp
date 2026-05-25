from schemas.timetable import TimetableRequest, TimetableResponse
from schemas.merge import MergeRequest, MergeResponse
from models.solver_models import ConstraintConfig
import uuid

async def run_timetable_solver(request: TimetableRequest) -> TimetableResponse:
    config = request.constraints or ConstraintConfig()
    slots = []
    violations = []
    solver_score = 0.0

    for offering in request.offerings:
        slot = {
            "id": str(uuid.uuid4()),
            "courseOfferingId": offering.id,
            "sectionId": f"{offering.id}-A",
            "venueId": request.rooms[0].id if request.rooms else "default",
            "dayOfWeek": 0,
            "startTime": "08:00",
            "endTime": "10:00"
        }
        slots.append(slot)

    return TimetableResponse(
        timetableId=str(uuid.uuid4()),
        semesterId=request.semesterId,
        solverScore=solver_score,
        slots=slots,
        violations=violations,
        status="DRAFT"
    )

async def run_merge_solver(request: MergeRequest) -> MergeResponse:
    combined_enrolment = request.courseA.enrolment + request.courseB.enrolment
    required_capacity = combined_enrolment * 1.1

    suitable_venues = [
        r for r in request.candidateVenues
        if any(r.equipment) or r.capacity >= required_capacity
    ]

    if suitable_venues:
        return MergeResponse(
            canMerge=True,
            mergedSection={
                "combinedEnrolment": combined_enrolment,
                "combinedCourses": [request.courseA.id, request.courseB.id],
                "venueId": suitable_venues[0].id if suitable_venues else "merged-room",
                "dayOfWeek": 0,
                "startTime": "09:00",
                "endTime": "11:00"
            },
            requiredVenueCapacity=int(required_capacity),
            warnings=[]
        )

    return MergeResponse(
        canMerge=False,
        reason="No suitable venue found for combined enrolment",
        requiredVenueCapacity=int(required_capacity)
    )