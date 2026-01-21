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
    
    model_name = os.getenv("AI_MODEL")
    if not model_name:
        model_name = "google/gemini-1.5-flash:free"
    model = f"openai:{model_name}"

chat_agent = Agent(
    model,
    deps_type=ChatDeps,
    system_prompt=(
        "You are 'Kisan Sahayak' (Farmer Assistant), an AI expert for the Genetic Crop DBMS project. "
        "Your goal is to help users understand crop recommendations, genetic traits, and environmental data. "
        "Respond in a helpful, friendly manner. "
        "You MUST support Indian languages like Hindi, Marathi, Telugu, Tamil, Bengali, etc., based on the user's input language. "
        "IMPORTANT: You will sometimes receive 'CONTEXT INFORMATION' (like the current page or prediction results). "
        "If the user says 'explain this' or 'summarize', refer to that context. "
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

from .rag_service import rag_service

@chat_agent.tool
def search_research_docs(ctx: RunContext[ChatDeps], query: str) -> str:
    """Search historical research logs, uploaded CSV summaries, and scientific notes."""
    results = rag_service.search_research_logs(query)
    if not results:
        return f"No specific research logs found for '{query}'."
    
    formatted = "\n".join([f"[{r['type']}] {r['content']} (Date: {r['timestamp']})" for r in results])
    return f"Research Finding Snippets:\n{formatted}"

@chat_agent.tool
def get_genetic_summary(ctx: RunContext[ChatDeps]) -> str:
    """Get a summary of genetic traits available."""
    db = ctx.deps.db_session
    traits = db.query(GeneticTrait.trait_name).distinct().all()
    return "Available traits: " + ", ".join([t[0] for t in traits])

async def get_chatbot_response(message: str, context: Optional[dict] = None) -> str:
    db = SessionLocal()
    try:
        deps = ChatDeps(db_session=db)
        
        # Build prompt with context if available
        prompt = message
        if context:
            ctx_str = "\n".join([f"{k}: {v}" for k, v in context.items()])
            prompt = (
                f"CONTEXT INFORMATION:\n{ctx_str}\n\n"
                f"USER MESSAGE: {message}\n\n"
                "Please use the context information above if it is relevant to the user message. "
                "For example, if the user asks 'summarize this', use the context to explain what they are seeing."
            )

        result = await chat_agent.run(prompt, deps=deps)
        return result.data
    except Exception as e:
        error_msg = str(e)
        if "429" in error_msg or "RESOURCE_EXHAUSTED" in error_msg:
            return "Kisan Sahayak is currently busy (Quota Exhausted). Please try again in 60 seconds, or switch to `gemini-1.5-flash` in your .env file."
        return f"I'm sorry, I'm having trouble connecting. Error: {error_msg}"
    finally:
        db.close()
