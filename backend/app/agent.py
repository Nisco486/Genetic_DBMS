from pydantic_ai import Agent, RunContext
from pydantic import BaseModel, ConfigDict
from typing import List
import os
import sys

# Add project root to path if running directly
if __name__ == "__main__":
    current_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.abspath(os.path.join(current_dir, "../../"))
    if project_root not in sys.path:
        sys.path.insert(0, project_root)

from sqlalchemy.orm import Session
from dotenv import load_dotenv

# Load .env file
load_dotenv()

try:
    from .database import SessionLocal, CropInfo, GeneticTrait, ClimateData, PredictionRecord, User, PerformanceIndicator, ResearchAnalysis, SoilCondition
except ImportError:
    from backend.app.database import SessionLocal, CropInfo, GeneticTrait, ClimateData, PredictionRecord, User, PerformanceIndicator, ResearchAnalysis, SoilCondition

# Define the result structure we want the agent to return
class ProjectReport(BaseModel):
    title: str
    summary_markdown: str
    key_insights: List[str]
    recommendations: List[str]

# Define dependencies (Database session)
class AgentDeps(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)
    db_session: Session

# Configure Model: Using OpenRouter
# Note: 'API_KEY' should be your OpenRouter API key
# 'AI_MODEL' can be set in .env (e.g., 'google/gemini-2.0-flash-lite-preview-02-05:free')

# Map API_KEY to appropriate environment variables
api_key = os.getenv("API_KEY")
if api_key and api_key.startswith("AIza"):
    # Google AI (Gemini) API Key
    os.environ["GEMINI_API_KEY"] = api_key
    os.environ["GOOGLE_API_KEY"] = api_key
    model_name = os.getenv("AI_MODEL", "google-gla:gemini-1.5-flash") # Default to 1.5 flash for stability
    model = model_name
else:
    # Default to OpenRouter/OpenAI compatibility
    if api_key:
        os.environ["OPENAI_API_KEY"] = api_key
        os.environ["OPENAI_BASE_URL"] = "https://openrouter.ai/api/v1"
    model_name = os.getenv("AI_MODEL", "google/gemini-1.5-flash:free")
    model = f"openai:{model_name}"

report_agent = Agent(
    model,
    deps_type=AgentDeps,
    output_type=ProjectReport,
    system_prompt=(
        "You are an expert Agricultural Data Analyst for the 'Genetic Crop DBMS' project. "
        "The project aims to catalog genetic traits and integrate phenotypic performance data (yield, disease resistance, water efficiency). "
        "Your goal is to manage and analyze relationships between crop genetic traits, environmental/soil/climate data, and performance indicators. "
        "Provide stakeholders with data-driven insights into which genetic markers correlate with desirable outcomes, "
        "enabling informed crop selection and breeding decisions. "
        "Format your summary in professional Markdown, highlighting correlations and breeding recommendations."
    )
)

@report_agent.tool
def get_system_stats(ctx: RunContext[AgentDeps]) -> dict:
    """Fetch total counts of all records in the system."""
    db = ctx.deps.db_session
    return {
        "crops_count": db.query(CropInfo).count(),
        "traits_count": db.query(GeneticTrait).count(),
        "climate_records": db.query(ClimateData).count(),
        "total_predictions": db.query(PredictionRecord).count(),
        "registered_users": db.query(User).count(),
    }

@report_agent.tool
def get_recent_predictions(ctx: RunContext[AgentDeps], limit: int = 5) -> str:
    """Fetch the most recent crop predictions made by the system, including estimated yield if available."""
    db = ctx.deps.db_session
    preds = db.query(PredictionRecord).order_by(PredictionRecord.created_at.desc()).limit(limit).all()
    
    if not preds:
        return "No recent predictions found."
        
    lines = []
    for p in preds:
        # info string
        info = f"- Crop: {p.recommended_crop}, Confidence: {p.confidence}%, Temp: {p.temperature}C"
        
        # Try to find yield info
        # Note: This checks for direct name match. In production, consider normalization.
        crop_ref = db.query(CropInfo).filter(CropInfo.crop_name == p.recommended_crop).first()
        if crop_ref:
            perf = db.query(PerformanceIndicator).filter(PerformanceIndicator.crop_id == crop_ref.crop_id).first()
            if perf and perf.yield_value:
                info += f", Est. Yield: {perf.yield_value} tons/acre"
        
        lines.append(info)
    return "\n".join(lines)

@report_agent.tool
def get_crop_diversity(ctx: RunContext[AgentDeps]) -> str:
    """List available crops and their varieties."""
    db = ctx.deps.db_session
    crops = db.query(CropInfo).all()
    if not crops:
        return "No crops registered."
    
    return ", ".join([f"{c.crop_name} ({c.variety})" for c in crops])

@report_agent.tool
def get_genetic_insights(ctx: RunContext[AgentDeps]) -> List[str]:
    """Fetch identified correlations between genetic traits and performance outcomes."""
    db = ctx.deps.db_session
    # Join ResearchAnalysis with GeneticTrait and CropInfo
    analyses = db.query(ResearchAnalysis, GeneticTrait, CropInfo).join(
        GeneticTrait, ResearchAnalysis.trait_id == GeneticTrait.trait_id
    ).join(
        CropInfo, ResearchAnalysis.crop_id == CropInfo.crop_id
    ).order_by(ResearchAnalysis.correlation_score.desc()).limit(10).all()
    
    if not analyses:
        return ["No genetic research analysis records found."]
    
    insights = []
    for res, trait, crop in analyses:
        insight = (
            f"- Crop: {crop.crop_name}, Marker: {trait.gene_code}, "
            f"Trait: {trait.trait_name}, Correlation: {res.correlation_score}, "
            f"Note: {res.remarks or 'N/A'}"
        )
        insights.append(insight)
    return insights

@report_agent.tool
def get_environmental_summary(ctx: RunContext[AgentDeps]) -> dict:
    """Get average soil and climate conditions from the database."""
    db = ctx.deps.db_session
    
    # Calculate averages from memory for demo/simplicity or use SQL functions
    avg_soil_ph = db.query(SoilCondition).with_entities(SoilCondition.ph_level).all()
    avg_temp = db.query(ClimateData).with_entities(ClimateData.temperature).all()
    
    return {
        "avg_ph": sum([x[0] for x in avg_soil_ph]) / len(avg_soil_ph) if avg_soil_ph else "N/A",
        "avg_temp": sum([x[0] for x in avg_temp]) / len(avg_temp) if avg_temp else "N/A",
        "total_regions": db.query(SoilCondition.region).distinct().count()
    }

# Helper function to run the agent
async def generate_ai_report() -> ProjectReport:
    # Check for API Key
    if not os.getenv("API_KEY"):
        # Fallback mock response if no key (to prevent crash in demo)
        return ProjectReport(
            title="System Report (Mock - No API Key)",
            summary_markdown="**Note:** `API_KEY` is missing. Please add your OpenRouter API key to your `.env` file.\n\n"
                             "This system currently holds mock data. In a real scenario, this section would contain "
                             "a detailed analysis of your genetic traits and crop performance.",
            key_insights=["API Key Missing", "Database Connection Active", "Agent Ready"],
            recommendations=["Configure OpenRouter API Key", "Set AI_MODEL in .env", "Add more data"]
        )

    db = SessionLocal()
    try:
        deps = AgentDeps(db_session=db)
        # Run the agent with error handling
        try:
            result = await report_agent.run(
                "Generate a strategic research report. Analyze trait-performance correlations for breeding decisions, "
                "incorporate environmental data, and summarize system health.",
                deps=deps
            )
            return result.data
        except Exception as e:
            # Fallback for API errors (invalid key, rate limit, etc.)
            return ProjectReport(
                title="AI Report Generation Failed",
                summary_markdown=f"**Error:** The AI model encountered an issue during generation.\n\n"
                                 f"**Details:** `{str(e)}`\n\n"
                                 "Please ensure your `API_KEY` is valid and the backend was restarted.",
                key_insights=["LLM Connection Error", "Database Connection Active"],
                recommendations=["Verify API Key (OpenRouter)", "Check Internet Connection", "Restart Backend Server"]
            )
    finally:
        db.close()

if __name__ == "__main__":
    import asyncio
    import nest_asyncio
    from dotenv import load_dotenv
    
    # Load env variables (API keys)
    load_dotenv()
    nest_asyncio.apply()
    
    async def test():
        print("Starting AI Agent Test...")
        try:
            report = await generate_ai_report()
            print("\n" + "="*50)
            print(f"REPORT: {report.title}")
            print("="*50)
            print(f"\nSUMMARY:\n{report.summary_markdown}")
            print(f"\nINSIGHTS: {', '.join(report.key_insights)}")
            print(f"\nRECOMMENDATIONS: {', '.join(report.recommendations)}")
            print("="*50)
        except Exception as e:
            print(f"❌ Error during agent execution: {e}")

    asyncio.run(test())
