# SupplySense: Autonomous Supply Chain Resilience Agent
**Team:** [Your Team Name]
**Domain:** Tier-2 Automotive Parts (EV Components)

## Slide 1: Title Slide
- **Title:** SupplySense - The Autonomous Supply Chain Co-Pilot
- **Subtitle:** Securing the Tier-2 EV Supply Chain against global volatility.
- **Visual:** SupplySense Logo (Premium Dark Mode Aesthetic)

## Slide 2: The Problem (Structural Volatility)
- **Point 1:** Global disruptions are the new normal (Red Sea closures, semiconductor bottlenecks, lithium shortages).
- **Point 2:** Tier-2 EV manufacturers are uniquely vulnerable. They lack enterprise-scale control towers but face brutal OEM SLA penalties for late deliveries.
- **Point 3:** Current tools are reactive dashboards. Operations teams are forced into manual, high-stakes decisions under extreme uncertainty.
- **Visual:** Stat showing average revenue loss per day of line stoppage for an EV manufacturer.

## Slide 3: The Solution (Meet SupplySense)
- **Concept:** An AI-powered Co-Pilot that shifts operations from reactive reporting to autonomous mitigation.
- **Key Features:**
  - **Perceives:** Real-time ingestion of global disruption signals.
  - **Reasons:** Simulates trade-offs between freight costs, OEM SLA penalties, and network resilience.
  - **Acts:** Drafts human-in-the-loop mitigation workflows (Emails, ERP adjustments).
- **Visual:** Screenshot of the SupplySense Dashboard overview.

## Slide 4: Hyper-Personalized Context
- **Concept:** Generic alerts are useless. SupplySense understands the *specific* business context.
- **Example:** A delay in "Battery Management Controllers" isn't just an alert; SupplySense knows this component is single-sourced from Shenzhen and is critical for the Q3 OEM contract.
- **Visual:** Screenshot of the Disruption Feed detailing specific EV components.

## Slide 5: Agent Architecture (Google Stack Integration)
- **Frontend Layer:** Next.js application hosted on Google Cloud Run. Maps powered by Google Maps Platform.
- **Intelligence Layer (Google Gen AI):** Gemini 2.5 Flash for rapid, multi-variable reasoning and scenario simulation.
- **Data/Action Layer:** Google Cloud SQL (Mock ERP), Google Workspace APIs (for autonomous Gmail execution).
- **Visual:** Simple technical architecture diagram showing Perception -> Reasoning (Gemini) -> Action.

## Slide 6: Demo Scenario: The Red Sea Crisis
- **Setup:** A major port congestion event in the Red Sea delays critical thermal sensors by 21 days.
- **The AI Response:** Show the reasoning engine Trade-off Simulator.
  - *Option 1:* Expedite Air Freight (High Cost, Low SLA Risk).
  - *Option 2:* Renegotiate OEM Delivery (Low Cost, High SLA Risk).
  - *Option 3:* Spot-Buy Local Backup (Medium Cost, High Resilience).
- **Visual:** Screenshot of the AI Risk Intelligence Panel.

## Slide 7: Go-To-Market & Business Impact
- **Target Audience:** $100M-$500M Tier-2 Automotive Suppliers.
- **Revenue Model:** SaaS Subscription + Usage tiers based on API integrations (ERP/Logistics).
- **Expected Impact:** 
  - 40% reduction in expedited freight costs.
  - 95% protection of OEM SLAs, avoiding massive contractual penalties.
- **Visual:** ROI / Value Proposition icons.

## Slide 8: Responsible AI & Safeguards
- **Explainability:** Gemini provides clear "Cost vs SLA vs Resilience" reasoning metrics for every suggestion.
- **Safety Boundary:** Strict "Human-in-the-Loop" architecture. The Agent drafts the email or ERP PO, but a human *must* click "Approve" before execution.
- **Visual:** Screenshot of the Action Inbox requiring explicit user approval.

## Slide 9: Conclusion & Q&A
- **Summary:** SupplySense democratizes enterprise-grade supply chain resilience for the mid-market.
- **Ask:** Looking for pilot partners in the EV manufacturing sector.
