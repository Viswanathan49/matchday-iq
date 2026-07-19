import os
try:
    import google.generativeai as genai
    GENAI_AVAILABLE = True
except (ImportError, TypeError):
    GENAI_AVAILABLE = False

from typing import Dict, Any

# Load env variables (if any)
from dotenv import load_dotenv
load_dotenv()

# Configure Gemini
API_KEY = os.getenv("GEMINI_API_KEY")
if API_KEY and GENAI_AVAILABLE:
    genai.configure(api_key=API_KEY)

# Define prompts and intents locally for fallback
FALLBACK_RESPONSES = {
    "en": {
        "greeting": "Hello! I am your AI Stadium Assistant. How can I help you?",
        "food": "There are food stalls located near Section 112 and 204.",
        "bathroom": "The nearest restrooms are to your left.",
        "default": "I'm sorry, I couldn't understand that. Can you rephrase?"
    },
    "es": {
        "greeting": "¡Hola! Soy tu asistente de estadio con IA. ¿En qué puedo ayudarte?",
        "food": "Hay puestos de comida cerca de la Sección 112 y 204.",
        "bathroom": "Los baños más cercanos están a tu izquierda.",
        "default": "Lo siento, no pude entender eso. ¿Puedes reformularlo?"
    },
    "fr": {
        "greeting": "Bonjour! Je suis votre assistant de stade IA. Comment puis-je vous aider?",
        "food": "Il y a des stands de nourriture près des sections 112 et 204.",
        "bathroom": "Les toilettes les plus proches sont à votre gauche.",
        "default": "Désolé, je n'ai pas compris. Pouvez-vous reformuler?"
    },
    "pt": {
        "greeting": "Olá! Sou seu assistente de estádio com IA. Como posso ajudar?",
        "food": "Há barracas de comida perto das seções 112 e 204.",
        "bathroom": "Os banheiros mais próximos estão à sua esquerda.",
        "default": "Desculpe, não entendi. Você pode reformular?"
    },
    "ar": {
        "greeting": "مرحباً! أنا مساعد الملعب الذكي الخاص بك. كيف يمكنني مساعدتك؟",
        "food": "توجد أكشاك طعام بالقرب من القسم 112 و 204.",
        "bathroom": "أقرب دورات مياه على يسارك.",
        "default": "عذراً، لم أفهم ذلك. هل يمكنك إعادة صياغته؟"
    }
}

def get_fallback_response(query: str, language: str, location: str = "") -> Dict[str, str]:
    query_lower = query.lower()
    lang = language if language in FALLBACK_RESPONSES else "en"
    
    intent = "default"
    if any(word in query_lower for word in ["food", "eat", "comida", "manger", "comer", "طعام"]):
        intent = "food"
    elif any(word in query_lower for word in ["bathroom", "restroom", "baño", "toilettes", "banheiro", "حمام"]):
        intent = "bathroom"
        if "gate b" in location.lower():
            return {"reply": "The nearest restrooms from Gate B are at the South Gate.", "intent": intent}
    elif any(word in query_lower for word in ["hello", "hi", "hola", "bonjour", "olá", "مرحبا"]):
        intent = "greeting"
        
    return {
        "reply": FALLBACK_RESPONSES[lang][intent],
        "intent": intent
    }

async def ask_gemini(query: str, language: str, location: str = "") -> Dict[str, str]:
    if not API_KEY or not GENAI_AVAILABLE:
        # Fallback to deterministic logic if no API key or package error
        return get_fallback_response(query, language, location)
        
    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        prompt = f"""
        You are an AI assistant for the FIFA World Cup 2026. 
        You must answer questions briefly, politely, and accurately based ONLY on these facts:
        - Food stalls: Section 112, Section 204, Food Court.
        - Restrooms: North Concourse, East Concourse.
        - First Aid: Gate B, South Gate.
        
        If the user asks something outside these facts, apologize and say you only know about navigation and facilities.
        Respond entirely in the following language code: {language}.
        
        DYNAMIC UI ACTIONS:
        If the user asks for directions or a route to a specific destination, you MUST append this EXACT token at the very end of your response: [ROUTE:<destination>]
        For example: "The sensory room is open. [ROUTE:Sensory Room]"
        
        If the user reports an incident, spill, medical emergency, or maintenance issue, you MUST append this EXACT token at the end of your response: [INCIDENT:<type>:<location>]
        <type> can be: spill, medical, security, maintenance.
        For example: "I have notified staff about the spill. [INCIDENT:spill:Gate B]"
        
        User Location Context (if any): {location}
        User question: "{query}"
        """
        response = model.generate_content(prompt)
        reply = response.text.strip()
        
        # Simple intent extraction for analytics (mocked here for simplicity)
        intent = "query" 
        
        return {
            "reply": reply,
            "intent": intent
        }
    except Exception as e:
        print(f"Gemini API error: {e}")
        return get_fallback_response(query, language, location)
