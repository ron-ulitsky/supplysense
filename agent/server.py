"""
FastAPI server that exposes the SupplySense ADK agent as a REST API.

The Next.js frontend sends disruption events to POST /analyze,
which runs the ADK agent pipeline and returns structured results.
GET /scan uses a separate ADK agent to generate new disruption events,
enriched with live Polymarket prediction market data.
"""

import os
import json
import uuid
from datetime import datetime, timezone

import requests as http_requests
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional

from google.adk.agents import Agent
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai import types
from agent.agent import root_agent
import os
from dotenv import load_dotenv

# Load environment variables securely from the Next.js .env.local file
load_dotenv(dotenv_path=".env.local")

# ---------------------------------------------------------------------------
# Pydantic Models
# ---------------------------------------------------------------------------

class Disruption(BaseModel):
    title: str
    description: str
    severity: str
    region: str
    affected_components: list[str]
    estimated_delay_days: int

class AnalyzeRequest(BaseModel):
    """Incoming analysis request from the Next.js frontend."""
    disruption: Disruption
    supplier_details: Optional[dict] = None
    company_profile: Optional[str] = None


# ---------------------------------------------------------------------------
# Mock fallback data (for when API key is not set)
# ---------------------------------------------------------------------------

MOCK_RESPONSE = {
    "agent_response": (
        "## Executive Risk Summary\n\n"
        "**Risk Level: HIGH** | Revenue at Risk: $6,000,000\n\n"
        "The Red Sea Port Congestion is causing severe delays to Asia-Europe "
        "shipping routes, directly impacting Battery Management Controllers and "
        "Thermal Sensors. Current inventory provides 14 days of coverage for "
        "controllers, which falls short of the estimated 14-day delay when "
        "accounting for safety stock consumption.\n\n"
        "### Mitigation Strategies Drafted for Approval:\n\n"
        "1. **Cost-Optimized: Partial Air Freight** -- Air-ship 30% of the order "
        "to maintain minimum production levels while waiting for sea freight. "
        "Est. cost: $85,000. (Confidence: 92%)\n\n"
        "2. **SLA-Optimized: Emergency Supplier Activation** -- Activate backup "
        "supplier Kyoto Micro Systems for a 2-week bridge order of Battery "
        "Management Controllers. Est. cost: $210,000. (Confidence: 88%)\n\n"
        "3. **Resilience-Optimized: Dual-Source Agreement** -- Negotiate a "
        "standing dual-source agreement with both Shenzhen Electronics and Kyoto "
        "Micro to prevent future single-point-of-failure exposure. "
        "Est. cost: $45,000/yr. (Confidence: 95%)\n\n"
        "**Top Recommendation:** Strategy 2 (Emergency Supplier Activation) to "
        "protect OEM SLA commitments. All 3 actions are queued in your Action Inbox "
        "for approval."
    ),
    "tool_calls_made": [
        "assess_disruption_impact",
        "check_inventory_and_buffers (Battery Management Controllers)",
        "check_inventory_and_buffers (Thermal Sensors)",
        "draft_mitigation_actions (Cost-Optimized)",
        "draft_mitigation_actions (SLA-Optimized)",
        "draft_mitigation_actions (Resilience-Optimized)",
    ],
}

MOCK_SCAN = {
    "id": str(uuid.uuid4()),
    "title": "Taiwan Strait Military Exercises Disrupt Chip Shipments",
    "description": "Unannounced military exercises in the Taiwan Strait have caused major shipping delays for semiconductor components. Multiple cargo vessels are rerouted, adding 8-12 days to delivery timelines for MCU and controller chips critical to EV manufacturing.",
    "severity": "high",
    "region": "East Asia",
    "affectedComponents": ["EV Main Control Unit (MCU)", "Battery Management Controllers"],
    "estimatedDelayDays": 10,
    "timestamp": datetime.now(timezone.utc).isoformat(),
    "polymarketProbability": 42,
}


# ---------------------------------------------------------------------------
# Application Setup
# ---------------------------------------------------------------------------

app = FastAPI(
    title="SupplySense ADK Agent API",
    description="Google ADK-powered supply chain risk analysis agent",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# ADK Agent Runner Setup
# ---------------------------------------------------------------------------

APP_NAME = "supplysense"
USER_ID = "ops_lead"

session_service = InMemorySessionService()

runner = Runner(
    agent=root_agent,
    app_name=APP_NAME,
    session_service=session_service,
)

# Scanner agent for generating new disruption events
scan_agent = Agent(
    name="supplysense_scanner",
    model="gemini-2.5-flash",
    description="Scans for new global supply chain disruption events affecting Tier-2 EV manufacturers using live Polymarket data.",
    instruction="""You are the global events monitor for SupplySense.

You will receive live Polymarket prediction market data. Your task is to select ONE event that would most
realistically cause a supply chain disruption for a Tier-2 EV Parts Manufacturer, and generate a specific
disruption simulation based on it.

CRITICAL: You MUST use the EXACT Live Polymarket Probability percentage from your chosen event for the "polymarketProbability" field.

You MUST respond with ONLY valid JSON matching this exact schema (no markdown, no explanation):
{
  "id": "WILL_BE_REPLACED",
  "title": "A 5-10 word descriptive title based on the real Polymarket event",
  "description": "A detailed 2-3 sentence description blending the real global event with its simulated direct supply chain impact.",
  "severity": "high",
  "region": "The geographic region affected",
  "affectedComponents": ["Component 1", "Component 2"],
  "estimatedDelayDays": 10,
  "timestamp": "ISO timestamp",
  "polymarketProbability": 42
}

Use one of these severity values: "low", "medium", "high", "critical".
For components, use realistic EV supply chain parts like: Battery Management Controllers, Thermal Sensors, Raw Lithium, Battery Cells, EV Main Control Unit (MCU).
""",
    tools=[],
)

scan_runner = Runner(
    agent=scan_agent,
    app_name=APP_NAME,
    session_service=session_service,
)


async def run_agent_pipeline(agent_runner: Runner, user_message: str) -> dict:
    """Runs an ADK agent with a user message and collects the response."""

    session = await session_service.create_session(
        app_name=APP_NAME,
        user_id=USER_ID,
    )

    content = types.Content(
        role="user",
        parts=[types.Part.from_text(text=user_message)],
    )

    final_response_parts = []
    tool_calls = []

    async for event in agent_runner.run_async(
        user_id=USER_ID,
        session_id=session.id,
        new_message=content,
    ):
        if event.content and event.content.parts:
            for part in event.content.parts:
                if part.text and not part.function_call:
                    final_response_parts.append(part.text)
                if part.function_call:
                    tool_calls.append(part.function_call.name)

    return {
        "agent_response": "\n".join(final_response_parts) if final_response_parts else "Agent did not produce a text response.",
        "tool_calls_made": tool_calls,
    }


def fetch_polymarket_events() -> str:
    """Fetches live prediction market data from the Polymarket Gamma API."""
    try:
        url = "https://gamma-api.polymarket.com/events"
        res = http_requests.get(url, params={"limit": 20, "active": "true", "closed": "false"}, timeout=10)
        events = res.json()

        market_summaries = []
        for e in events:
            if "markets" in e and len(e["markets"]) > 0:
                market = e["markets"][0]
                question = market.get("question", "")
                outcomes = json.loads(market.get("outcomes", "[]"))
                prices = json.loads(market.get("outcomePrices", "[]"))

                prob = 0
                if len(prices) > 0:
                    try:
                        prob_index = outcomes.index("Yes") if "Yes" in outcomes else 0
                        prob = int(float(prices[prob_index]) * 100)
                    except (ValueError, IndexError):
                        pass

                market_summaries.append(f"Event: '{question}', Live Polymarket Probability: {prob}%")

        return "\n".join(market_summaries)
    except Exception as err:
        print(f"Polymarket fetch failed: {err}")
        return "ERROR: Could not fetch Polymarket data"


def strip_markdown_fences(text: str) -> str:
    """Removes markdown code fences from LLM output."""
    text = text.strip()
    if text.startswith("```json"):
        text = text[7:]
    elif text.startswith("```"):
        text = text[3:]
    if text.endswith("```"):
        text = text[:-3]
    return text.strip()


# ---------------------------------------------------------------------------
# API Endpoints
# ---------------------------------------------------------------------------

@app.get("/health")
async def health_check():
    has_key = bool(os.environ.get("GOOGLE_API_KEY") or os.environ.get("GEMINI_API_KEY"))
    return {
        "status": "healthy",
        "agent": "supplysense_coordinator",
        "model": "gemini-2.5-flash",
        "api_key_configured": has_key,
    }


@app.post("/analyze")
async def analyze_disruption(request: AnalyzeRequest):
    """Receives a disruption event and runs the ADK agent pipeline."""

    api_key = os.environ.get("GOOGLE_API_KEY") or os.environ.get("GEMINI_API_KEY")

    if not api_key:
        return MOCK_RESPONSE

    d = request.disruption
    prompt = f"""A new supply chain disruption has been detected. Analyze it and generate mitigation strategies.

DISRUPTION EVENT:
- Title: {d.title}
- Description: {d.description}
- Severity: {d.severity}
- Region: {d.region}
- Affected Components: {', '.join(d.affected_components)}
- Estimated Delay: {d.estimated_delay_days} days

Company Profile: {request.company_profile or 'Not specified'}

Please follow your standard workflow: assess impact, check inventory for each affected component, then draft 3 mitigation strategies with different trade-off profiles."""

    try:
        result = await run_agent_pipeline(runner, prompt)
        return result
    except Exception as e:
        print(f"Agent execution error: {e}. Falling back to mock response.")
        return MOCK_RESPONSE


@app.get("/scan")
async def perform_global_scan():
    """Uses the ADK scanner agent + live Polymarket data to generate a new disruption event."""

    api_key = os.environ.get("GOOGLE_API_KEY") or os.environ.get("GEMINI_API_KEY")

    if not api_key:
        return MOCK_SCAN

    # Fetch live Polymarket prediction market data
    polymarket_events_text = fetch_polymarket_events()

    try:
        result = await run_agent_pipeline(
            scan_runner,
            f"""Scan the globe and generate a new supply chain disruption event.

Here are LIVE active markets currently streaming from Polymarket:
---
{polymarket_events_text}
---

Select the most supply-chain-relevant event and generate a disruption simulation.
Use timestamp: {datetime.now(timezone.utc).isoformat()}"""
        )

        text = strip_markdown_fences(result["agent_response"])
        disruption_data = json.loads(text)
        disruption_data["id"] = str(uuid.uuid4())
        return disruption_data
    except Exception as e:
        print(f"Scan agent error: {e}. Falling back to mock scan.")
        return MOCK_SCAN


# ---------------------------------------------------------------------------
# Entry Point
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
