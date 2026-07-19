from typing import List, Dict, Any, Tuple

# Deterministic mock data for the stadium
ZONES = {
    "North Gate": {"density": 85, "accessible": True},
    "South Gate": {"density": 40, "accessible": True},
    "East Concourse": {"density": 60, "accessible": False},
    "West Concourse": {"density": 25, "accessible": True},
    "Food Court": {"density": 90, "accessible": True},
    "Sensory Room": {"density": 10, "accessible": True},
    "Section 112": {"density": 50, "accessible": True},
    "Section 130": {"density": 45, "accessible": True},
    "Gate B": {"density": 30, "accessible": True}
}

def get_stadium_density() -> List[Dict[str, Any]]:
    """Returns the current density of all zones."""
    return [{"zone": k, "density": v["density"]} for k, v in ZONES.items()]

def determine_route(current_loc: str, dest_loc: str, needs_step_free: bool = False) -> Tuple[List[str], int, str]:
    """
    Deterministic routing engine.
    Finds a simple path and checks if it's step-free.
    In a real app, this would use a graph algorithm like Dijkstra's or A*.
    """
    # Normalize inputs somewhat
    start = current_loc.strip()
    end = dest_loc.strip()
    
    route = [start, "Main Concourse", end]
    time = 5
    crowding = "Low"
    
    # Simple hardcoded adjustments for realism
    if "North" in start or "North" in end:
        route = [start, "North Concourse", "Stairwell 2", end]
        time = 8
        crowding = "Moderate"
        
    if "Gate B" in start and "sensory room" in end.lower():
        route = ["Gate B", "Lower Concourse - South-East", "Lower Concourse - North-East", "Lower Concourse - North-West", "Sensory Room"]
        time = 12
        crowding = "Moderate"
        
    if needs_step_free:
        # Replace stairs with elevators if needed
        route = [step.replace("Stairwell", "Elevator") for step in route]
        time += 2 # Elevators take longer
        
    return route, time, crowding
