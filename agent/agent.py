"""
SupplySense ADK Agent Module

Implements the Google ADK Coordinator-Dispatcher pattern for supply chain
risk analysis. The root_agent receives a disruption event and uses tool
functions to assess impact, check inventory, and generate mitigation
strategies using Gemini reasoning.
"""

import json
from google.adk.agents import Agent


# ---------------------------------------------------------------------------
# Tool Functions (callable by the LLM agents)
# ---------------------------------------------------------------------------

def assess_disruption_impact(
    disruption_title: str,
    disruption_description: str,
    severity: str,
    affected_components: str,
    estimated_delay_days: int,
    region: str,
) -> dict:
    """Assesses the financial and operational impact of a supply chain disruption
    on a Tier-2 EV parts manufacturer.

    Args:
        disruption_title: Short title of the disruption event.
        disruption_description: Detailed description of the disruption.
        severity: One of 'low', 'medium', 'high', 'critical'.
        affected_components: Comma-separated list of affected EV components.
        estimated_delay_days: Estimated delay in days.
        region: Geographic region of the disruption.

    Returns:
        dict: Impact assessment with financial exposure and affected lines.
    """
    # Simulated impact lookup (in production, this queries ERP/inventory APIs)
    component_revenue_map = {
        "Battery Management Controllers": 4_200_000,
        "Thermal Sensors": 1_800_000,
        "Raw Lithium": 8_500_000,
        "Battery Cells": 6_200_000,
        "EV Main Control Unit (MCU)": 3_100_000,
    }

    components = [c.strip() for c in affected_components.split(",")]
    total_exposure = sum(component_revenue_map.get(c, 500_000) for c in components)

    severity_multiplier = {
        "low": 0.1,
        "medium": 0.25,
        "high": 0.5,
        "critical": 0.85,
    }
    adjusted_exposure = total_exposure * severity_multiplier.get(severity, 0.25)

    return {
        "status": "success",
        "impact_assessment": {
            "disruption_title": disruption_title,
            "severity": severity,
            "region": region,
            "affected_components": components,
            "estimated_delay_days": estimated_delay_days,
            "total_revenue_at_risk_usd": round(adjusted_exposure),
            "production_lines_affected": len(components),
            "oem_sla_breach_risk": "HIGH" if estimated_delay_days > 7 else "MODERATE" if estimated_delay_days > 3 else "LOW",
        },
    }


def check_inventory_and_buffers(component_name: str) -> dict:
    """Checks current inventory levels and safety stock buffers for a specific
    EV component from the manufacturer's ERP system.

    Args:
        component_name: The name of the component to check inventory for.

    Returns:
        dict: Current stock levels, safety stock, and days of coverage.
    """
    # Simulated ERP inventory data
    inventory_db = {
        "Battery Management Controllers": {
            "on_hand_units": 1_200,
            "safety_stock_units": 800,
            "daily_consumption": 85,
            "days_of_coverage": 14,
            "reorder_point_days": 21,
            "primary_supplier": "Shenzhen Electronics Ltd",
            "backup_supplier": "Kyoto Micro Systems",
        },
        "Thermal Sensors": {
            "on_hand_units": 3_400,
            "safety_stock_units": 2_000,
            "daily_consumption": 120,
            "days_of_coverage": 28,
            "reorder_point_days": 14,
            "primary_supplier": "EuroSensor GmbH",
            "backup_supplier": "None",
        },
        "Raw Lithium": {
            "on_hand_units": 450,
            "safety_stock_units": 200,
            "daily_consumption": 30,
            "days_of_coverage": 15,
            "reorder_point_days": 45,
            "primary_supplier": "Atacama Lithium Corp",
            "backup_supplier": "Western Australia Mining Co",
        },
        "EV Main Control Unit (MCU)": {
            "on_hand_units": 600,
            "safety_stock_units": 400,
            "daily_consumption": 40,
            "days_of_coverage": 15,
            "reorder_point_days": 30,
            "primary_supplier": "Taiwan Micro Components (TMC)",
            "backup_supplier": "Samsung Foundry Services",
        },
    }

    data = inventory_db.get(component_name)
    if data:
        return {"status": "success", "component": component_name, "inventory": data}
    else:
        return {
            "status": "success",
            "component": component_name,
            "inventory": {
                "on_hand_units": 500,
                "safety_stock_units": 300,
                "daily_consumption": 50,
                "days_of_coverage": 10,
                "reorder_point_days": 20,
                "primary_supplier": "Unknown",
                "backup_supplier": "None",
            },
        }


def draft_mitigation_actions(
    strategy_name: str,
    strategy_description: str,
    action_type: str,
    recipient: str,
    draft_content: str,
    confidence_score: int,
) -> dict:
    """Drafts a concrete mitigation action for the Human-in-the-Loop Action
    Inbox. These drafts require explicit user approval before execution.

    Args:
        strategy_name: Short name for this mitigation strategy.
        strategy_description: Detailed description of what this strategy involves.
        action_type: Type of action - one of 'email', 'erp_adjustment', 'escalation'.
        recipient: Who this action is directed at (email address, system name, or person).
        draft_content: The full draft text of the action (email body, ERP command, etc).
        confidence_score: AI confidence in this recommendation (0-100).

    Returns:
        dict: The drafted action ready for the HITL inbox.
    """
    return {
        "status": "success",
        "drafted_action": {
            "strategy_name": strategy_name,
            "strategy_description": strategy_description,
            "action_type": action_type,
            "recipient": recipient,
            "draft_content": draft_content,
            "confidence_score": confidence_score,
            "requires_approval": True,
            "approval_status": "pending",
        },
    }


# ---------------------------------------------------------------------------
# ADK Agent Definition (Coordinator with Tools)
# ---------------------------------------------------------------------------

root_agent = Agent(
    name="supplysense_coordinator",
    model="gemini-2.5-flash",
    description=(
        "SupplySense Coordinator Agent: Receives supply chain disruption events "
        "for a Tier-2 EV parts manufacturer and performs end-to-end risk analysis. "
        "Uses tools to assess financial impact, check inventory buffers, and draft "
        "mitigation actions for human approval."
    ),
    instruction="""You are the SupplySense Coordinator, an AI Co-Pilot for Tier-2 EV parts manufacturers.

When you receive a disruption event, follow this sequential workflow:

STEP 1 - ASSESS IMPACT:
Call the `assess_disruption_impact` tool with the disruption details to understand
the financial and operational exposure.

STEP 2 - CHECK INVENTORY:
For each affected component, call `check_inventory_and_buffers` to understand
current stock levels and whether safety stock can absorb the delay.

STEP 3 - GENERATE MITIGATIONS:
Based on the impact assessment and inventory data, generate exactly 3 distinct
mitigation strategies. For each strategy, call `draft_mitigation_actions` to
create a concrete action draft.

The 3 strategies should represent different trade-off profiles:
1. Cost-optimized (minimize spending, accept some SLA risk)
2. SLA-optimized (protect delivery commitments, accept higher cost)
3. Resilience-optimized (long-term supply chain hardening)

STEP 4 - SUMMARIZE:
After drafting all actions, provide a final executive summary that includes:
- The overall risk level
- Total revenue at risk
- Your top recommendation among the 3 strategies
- Which actions are queued for human approval in the Action Inbox

Always respond with structured, actionable intelligence. Be specific about
dollar amounts, timelines, and supplier names.
""",
    tools=[
        assess_disruption_impact,
        check_inventory_and_buffers,
        draft_mitigation_actions,
    ],
)
