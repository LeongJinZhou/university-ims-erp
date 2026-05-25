from typing import Dict, Any
import uuid

async def generate_draft_task(semester_id: str) -> Dict[str, Any]:
    task_id = str(uuid.uuid4())
    return {
        "task_id": task_id,
        "semester_id": semester_id,
        "status": "completed",
        "result": {"slots": [], "violations": []}
    }