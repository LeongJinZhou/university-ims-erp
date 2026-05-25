def parse_time(time_str: str) -> tuple[int, int]:
    parts = time_str.split(":")
    return int(parts[0]), int(parts[1])

def time_to_minutes(time_str: str) -> int:
    hours, minutes = parse_time(time_str)
    return hours * 60 + minutes

def minutes_to_time(minutes: int) -> str:
    hours = minutes // 60
    mins = minutes % 60
    return f"{hours:02d}:{mins:02d}"