import pytest
from engine import get_stadium_density, determine_route

def test_get_stadium_density():
    data = get_stadium_density()
    assert len(data) == 9
    assert data[0]["zone"] == "North Gate"
    assert "density" in data[0]

def test_determine_route_normal():
    route, time, crowding = determine_route("South Gate", "Section 112")
    assert "Main Concourse" in route
    assert time == 5
    assert crowding == "Low"

def test_determine_route_north():
    route, time, crowding = determine_route("North Gate", "Section 112")
    assert "North Concourse" in route
    assert time == 8
    assert crowding == "Moderate"

def test_determine_route_gate_b_sensory():
    route, time, crowding = determine_route("Gate B", "Sensory room")
    assert len(route) == 5
    assert "Lower Concourse - North-West" in route
    assert time == 12

def test_determine_route_step_free():
    route, time, crowding = determine_route("North Gate", "Section 112", needs_step_free=True)
    # North normal uses "Stairwell 2", step-free should use "Elevator 2"
    assert "Elevator 2" in route
    assert "Stairwell 2" not in route
    assert time == 10
