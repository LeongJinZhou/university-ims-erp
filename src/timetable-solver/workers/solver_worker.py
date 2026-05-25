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
    required_capacity = int(combined_enrolment * 1.1)

    venue_id = request.candidateVenues[0] if request.candidateVenues else "merged-room"

    return MergeResponse(
        canMerge=True,
        mergedSection={
            "combinedEnrolment": combined_enrolment,
            "combinedCourses": [request.courseA.id, request.courseB.id],
            "venueId": venue_id,
            "dayOfWeek": 0,
            "startTime": "09:00",
            "endTime": "11:00"
        },
        requiredVenueCapacity=int(required_capacity),
        warnings=[]
    )