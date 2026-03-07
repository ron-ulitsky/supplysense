import os
import json
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from google import genai
from google.genai import types
from dotenv import load_dotenv

# Load environment variables from Next.js .env.local file
load_dotenv(dotenv_path="../.env.local")

# Initialize FastAPI app
app = FastAPI(title="SupplySense ADK Backend")

# Initialize Gemini Client
API_KEY = os.environ.get("GEMINI_API_KEY")
client = genai.Client(api_key=API_KEY) if API_KEY else None

# Define Pydantic models for incoming requests
class Disruption(BaseModel):
    title: str
    description: str
    severity: str
    region: str
    affected_components: List[str]
    estimated_delay_days: int

class AnalyzeRequest(BaseModel):
    disruption: Disruption
    supplier_details: List[Dict[str, Any]]
    company_profile: Dict[str, Any]

# Define Gemini Tools (Function Declarations)
query_erp_inventory_tool = {
    "name": "query_erp_inventory",
    "description": "Query the mock ERP system to find the current buffer stock (in days) for a given component and region.",
    "parameters": {
        "type": "OBJECT",
        "properties": {
            "componentName": {
                "type": "STRING",
                "description": 'The name of the component, e.g., "Battery Management Controllers".'
            },
            "region": {
                "type": "STRING",
                "description": "The geographic region to query inventory for."
            }
        },
        "required": ["componentName", "region"]
    }
}

calculate_freight_quote_tool = {
    "name": "calculate_freight_quote",
    "description": "Calculate the estimated cost and lead time for shipping a specific component.",
    "parameters": {
        "type": "OBJECT",
        "properties": {
            "freightType": {
                "type": "STRING",
                "description": 'The type of freight (e.g., "Air", "Ocean", "Rail").'
            },
            "origin": {
                "type": "STRING",
                "description": "The origin port or region."
            },
            "destination": {
                "type": "STRING",
                "description": "The destination port or region."
            }
        },
        "required": ["freightType", "origin", "destination"]
    }
}

# Mock tool execution functions
def execute_query_erp_inventory(args: dict) -> dict:
    print(f"[TOOL CALLED] query_erp_inventory: {args}")
    return {
        "buffer_days": 14,
        "units_on_hand": 1250,
        "cost_per_unit_holding": 2.50
    }

def execute_calculate_freight_quote(args: dict) -> dict:
    print(f"[TOOL CALLED] calculate_freight_quote: {args}")
    freight_type = args.get("freightType", "").lower()
    if freight_type == "air":
        return {
            "estimated_cost_usd": 42000,
            "lead_time_days": 3,
            "confidence_score": 0.95
        }
    return {
        "estimated_cost_usd": 15000,
        "lead_time_days": 21,
        "confidence_score": 0.88
    }

tool_executors = {
    "query_erp_inventory": execute_query_erp_inventory,
    "calculate_freight_quote": execute_calculate_freight_quote
}

@app.post("/analyze")
async def analyze_disruption(request: AnalyzeRequest):
    if not client:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY is not set.")

    prompt = f"""
      You are the reasoning engine for SupplySense, an Autonomous Supply Chain Resilience Agent for a Tier-2 EV Parts Manufacturer.
      
      Company Profile:
      {json.dumps(request.company_profile, indent=2)}
      
      Simulated Memory & Reflection Logs:
      - Historic Log (May 2025): Air freight out of Shenzhen during Q3 peak experienced 5-day customs delay. High risk.
      - Profile Directive: If Company is "Cash-Rich," prioritize SLA at all costs. If "Cash-Poor," optimize for margin preservation. 
      
      Current Disruption Event:
      {request.disruption.model_dump_json(indent=2)}
      
      Impacted Supplier Details:
      {json.dumps(request.supplier_details, indent=2)}
      
      Task:
      Analyze this disruption and generate exactly 3 distinct mitigation strategies. 
      For each strategy, you must evaluate the trade-offs between Cost, Service Level (SLA adherence to OEMs), and Resilience.
      CRITICAL: You must provide a clear, one-sentence "explanation" that traces exactly *why* you made this recommendation based on the company profile, historical logs, and mathematics of the disruption.
      If you need ERP buffer days or real freight quotes, use the provided tools to query real data before making your recommendation.
      
      Output your FINAL response ONLY as valid JSON matching this schema:
      {{
        "analysisSummary": "A 2-3 sentence executive summary of the risk.",
        "strategies": [
          {{
            "id": "strategy_1",
            "name": "Short descriptive name",
            "description": "Detailed explanation of the action to take",
            "explanation": "Provides decision transparency (e.g. why this is better than alternative X given the company profile).",
            "tradeoffs": {{
              "costImpact": "High/Medium/Low - with brief explanation",
              "serviceLevelImpact": "High/Medium/Low - with brief explanation",
              "resilienceImpact": "High/Medium/Low - with brief explanation"
            }},
            "suggestedActions": ["Action 1", "Action 2"]
          }}
        ]
      }}
    """
    
    # Configure tool schema
    tool_config = types.GenerateContentConfig(
        temperature=0.2,
        tools=[{"function_declarations": [query_erp_inventory_tool, calculate_freight_quote_tool]}]
    )

    try:
        chat = client.chats.create(model="gemini-2.5-flash", config=tool_config)
        
        # 1. Send the initial prompt
        response = chat.send_message(prompt)
        
        tool_calls_made = []

        # 2. Handle function calls loop
        max_loops = 3
        while response.function_calls and max_loops > 0:
            max_loops -= 1
            function_responses = []
            
            for call in response.function_calls:
                name = call.name
                args = {k: v for k, v in call.args.items()}
                
                tool_calls_made.append({"name": name, "args": args})
                
                executor = tool_executors.get(name)
                if executor:
                    try:
                        result = executor(args)
                        function_responses.append(
                            types.Part.from_function_response(
                                name=name,
                                response=result
                            )
                        )
                    except Exception as e:
                        function_responses.append(
                            types.Part.from_function_response(
                                name=name,
                                response={"error": str(e)}
                            )
                        )
            
            # Send results back to the model
            if function_responses:
                response = chat.send_message(function_responses)
            else:
                break
                
        # 3. Process final JSON response
        if response.text:
            text = response.text.strip()
            if text.startswith("```json"):
                text = text[7:]
            elif text.startswith("```"):
                text = text[3:]
            if text.endswith("```"):
                text = text[:-3]
                
            ai_data = json.loads(text.strip())
            
            # Format data to return to Next.js proxy
            return {
                "agent_response": ai_data.get("analysisSummary", ""),
                "tool_calls_made": tool_calls_made,
                "strategies": ai_data.get("strategies", [])
            }
            
        raise HTTPException(status_code=500, detail="Model returned an empty text response.")

    except Exception as e:
        print(f"Error during ADK generation: {e}")
        raise HTTPException(status_code=500, detail=f"AI Request Failed: {str(e)}")

@app.get("/scan")
async def perform_global_scan():
    if not client:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY is not set.")

    prompt = """
      You are the global events monitor for SupplySense, an Autonomous Supply Chain Resilience Agent.
      
      Your task is to scan the globe and generate ONE realistic, specific, and highly concerning supply chain disruption 
      that would affect a Tier-2 EV Parts Manufacturer. 
      Use current understanding of geopolitics, weather patterns, or common industrial failures.
      
      Generate a unique ID (e.g., "D-105", "D-106"), a vivid title, and details.
      Output your response ONLY as valid JSON matching this exact schema:
      {
        "id": "D-10X",
        "title": "A 5-10 word descriptive title",
        "description": "A detailed 2-3 sentence description of the global event and its direct supply chain impact.",
        "severity": "High" (or "Medium" or "Critical"),
        "region": "The geographic region affected",
        "affectedComponents": ["Component 1", "Component 2"],
        "estimatedDelayDays": integer,
        "timestamp": "Current ISO timestamp (e.g., 2026-03-06T12:00:00Z)"
      }
    """
    
    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
        )
        
        if response.text:
            text = response.text.strip()
            if text.startswith("```json"):
                text = text[7:]
            elif text.startswith("```"):
                text = text[3:]
            if text.endswith("```"):
                text = text[:-3]
                
            disruption_data = json.loads(text.strip())
            return disruption_data
            
        raise HTTPException(status_code=500, detail="Model returned an empty text response.")
    except Exception as e:
        print(f"Error during global scan: {e}")
        raise HTTPException(status_code=500, detail=f"Scan Failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
