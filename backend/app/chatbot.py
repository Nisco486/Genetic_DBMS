from pydantic_ai import Agent, RunContext
from pydantic import BaseModel, ConfigDict
from typing import List, Optional
import os
from sqlalchemy.orm import Session
from .database import SessionLocal, CropInfo, GeneticTrait, ClimateData

# Result structure for Chat
class ChatResponse(BaseModel):
    response: str
    suggested_questions: List[str]

# Define dependencies
class ChatDeps(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)
    db_session: Session

# Configure Chat Agent
api_key = os.getenv("API_KEY")
if api_key and api_key.startswith("AIza"):
    os.environ["GEMINI_API_KEY"] = api_key
    os.environ["GOOGLE_API_KEY"] = api_key
    model_name = os.getenv("AI_MODEL", "gemini-1.5-flash")
    if ":" in model_name: 
        model_name = model_name.split(":")[-1]
    model = f"google-gla:{model_name}"
else:
    if api_key:
        os.environ["OPENAI_API_KEY"] = api_key
        os.environ["OPENAI_BASE_URL"] = "https://openrouter.ai/api/v1"
    model = f"openai:{os.getenv('AI_MODEL', 'google/gemini-1.5-flash:free')}"

chat_agent = Agent(
    model,
    deps_type=ChatDeps,
    system_prompt=(
        "You are 'Kisan Sahayak' (Farmer Assistant), an AI expert for the Genetic Crop DBMS project. "
        "Your goal is to help users understand crop recommendations, genetic traits, and environmental data. "
        "Respond in a helpful, friendly manner. "
        "You MUST support Indian languages like Hindi, Marathi, Telugu, Tamil, Bengali, etc., based on the user's input language. "
        "Use the provided tools to fetch real data from the database when answering questions about current stats or crop details. "
        "Keep responses concise and informative."
    )
)

@chat_agent.tool
def search_crop_info(ctx: RunContext[ChatDeps], query: str) -> str:
    """Search for information about a specific crop in our database."""
    db = ctx.deps.db_session
    crops = db.query(CropInfo).filter(CropInfo.crop_name.ilike(f"%{query}%")).all()
    if not crops:
        return f"No info found for '{query}'."
    return "\n".join([f"- {c.crop_name}: {c.description}" for c in crops])

@chat_agent.tool
def get_genetic_summary(ctx: RunContext[ChatDeps]) -> str:
    """Get a summary of genetic traits available."""
    db = ctx.deps.db_session
    traits = db.query(GeneticTrait.trait_name).distinct().all()
    return "Available traits: " + ", ".join([t[0] for t in traits])

async def get_chatbot_response(message: str, history: List[dict] = None) -> str:
    db = SessionLocal()
    try:
        deps = ChatDeps(db_session=db)
        # In a real app, we'd pass history too
        result = await chat_agent.run(message, deps=deps)
        return result.data
    except Exception as e:
        return f"I'm sorry, I'm having trouble connecting. Error: {str(e)}"
    finally:
        db.close()
