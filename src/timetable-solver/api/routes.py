from fastapi import APIRouter, BackgroundTasks
from schemas.timetable import TimetableRequest, TimetableResponse
from schemas.merge import MergeRequest, MergeResponse
from workers.solver_worker import run_timetable_solver, run_merge_solver

router = APIRouter()

@router.post("/solve", response_model=TimetableResponse)
async def solve_timetable(request: TimetableRequest, background_tasks: BackgroundTasks):
    result = await run_timetable_solver(request)
    return result

@router.post("/merge", response_model=MergeResponse)
async def solve_merge(request: MergeRequest):
    result = await run_merge_solver(request)
    return result

@router.post("/generate-draft/{semester_id}")
async def generate_timetable_draft(semester_id: str, background_tasks: BackgroundTasks):
    from workers.tasks import generate_draft_task
    task = background_tasks.add_task(generate_draft_task, semester_id)
    return {"task_id": task}