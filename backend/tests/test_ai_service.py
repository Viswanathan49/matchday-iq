import pytest
import os
from unittest.mock import patch
from ai_service import get_fallback_response, ask_gemini

def test_get_fallback_response():
    # Test food intent in spanish
    res = get_fallback_response("donde esta la comida", "es")
    assert res["intent"] == "food"
    assert "comida" in res["reply"].lower()

    # Test bathroom in french
    res = get_fallback_response("ou sont les toilettes", "fr")
    assert res["intent"] == "bathroom"
    assert "toilettes" in res["reply"].lower()

    # Test greeting in portuguese
    res = get_fallback_response("olá", "pt")
    assert res["intent"] == "greeting"
    assert "olá" in res["reply"].lower()

def test_fallback_greeting():
    res = get_fallback_response("hello", "en")
    assert "How can I help" in res["reply"]
    assert res["intent"] == "greeting"

def test_fallback_location_context():
    res = get_fallback_response("where is the restroom", "en", location="Gate B")
    assert "South Gate" in res["reply"]
    assert res["intent"] == "bathroom"
    
    # Test default
    res = get_fallback_response("asdfasdf", "en")
    assert res["intent"] == "default"

@pytest.mark.asyncio
@patch('ai_service.API_KEY', None) # Force fallback
async def test_ask_gemini_fallback():
    res = await ask_gemini("food", "en")
    assert res["intent"] == "food"

@pytest.mark.asyncio
@patch('ai_service.API_KEY', 'fake_key')
@patch('google.generativeai.GenerativeModel.generate_content')
async def test_ask_gemini_success(mock_generate):
    mock_generate.return_value.text = "Here is the food."
    res = await ask_gemini("where is food?", "en")
    assert res["reply"] == "Here is the food."
    assert res["intent"] == "query"

@pytest.mark.asyncio
@patch('ai_service.API_KEY', 'fake_key')
@patch('google.generativeai.GenerativeModel.generate_content', side_effect=Exception("API Error"))
async def test_ask_gemini_exception(mock_generate):
    res = await ask_gemini("food", "en")
    # Should fallback on exception
    assert res["intent"] == "food"
