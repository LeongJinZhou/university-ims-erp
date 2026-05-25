from ortools.sat.python import cp_model
from schemas.timetable import TimetableRequest
from models.solver_models import CourseData, RoomData, TimeSlotData

class TimetableSolverService:
    def __init__(self):
        self.model = cp_model.CpModel()
        self.solver = cp_model.CpSolver()

    def build_variables(self, offerings, rooms, time_slots):
        pass

    def add_hard_constraints(self):
        pass

    def add_soft_constraints(self, weights):
        pass

    def solve(self, request: TimetableRequest):
        pass