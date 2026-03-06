# SupplySense: 10-Minute Pitch Script

## Introduction (1 min)
"Hi everyone, we are the team behind SupplySense. Global supply chains entered a new era of structural volatility. Today, if a port closes in the Red Sea, or a lithium mine strikes in Chile, the shockwaves are felt almost instantly. 

For Tier-2 EV parts manufacturers, this is an existential threat. They don't have infinite budgets or massive risk intelligence teams. When a delay happens, operations leads are forced to make manual, panicked decisions that cost millions in expedited freight or OEM SLA penalties. 

They don't need another generic reporting dashboard. They need a Co-Pilot. That's why we built SupplySense."

## The Product Vision (1.5 mins)
"SupplySense is an Autonomous Supply Chain Resilience Agent built specifically for the mid-market EV sector. It doesn't just show you where the problem is—it reasons through how to fix it. 

Our agent does three things:
1. It Perceives: Monitoring global sentiment and disruption feeds.
2. It Reasons: Using Google Gemini to simulate the complex trade-offs between cost, service levels, and resilience.
3. It Acts: Generating ready-to-execute mitigation strategies like drafting supplier emails or updating ERP buffer stocks.

Let's look at a live simulation."

## Live Demo: The Red Sea Disruption (4.5 mins)
*(Presenter switches to the Next.js Prototype running on localhost)*

"Welcome to the SupplySense dashboard. Our operations lead logs in and immediately sees a 'Critical' alert on the Intelligence Feed: Red Sea Port Congestion testing our supply of Battery Management Controllers.

Now, a standard dashboard stops here. But SupplySense is context-aware. It knows these controllers are needed for our Q3 contract with a major OEM, and we only have 14 days of buffer stock. 

We click 'Generate AI Mitigation Plan'. Behind the scenes, we are using the Gemini 2.5 API to reason through this crisis. 

*(Wait for loading spinner)*

Here are the results. Gemini has given us three distinct strategies. 
Strategy 1 suggests expediting air freight. It tells us the exact trade-off: High Cost ($42k premium), but Low SLA Risk. 
Strategy 2 suggests leveraging a local secondary supplier at a slight markup to maintain resilience. 

We choose Strategy 1. Now, look at our Action Inbox. SupplySense hasn't just given advice; it has actually drafted the emergency purchase order for the air-freight, and written an email to the warehouse. 

Because we believe in Responsible AI, nothing happens automatically. We have a strict Human-in-the-Loop boundary. I review the email, and click 'Approve'. The supply chain is secured."

## Business Impact & Go-To-Market (2 mins)
"The value here is immense. By moving from reactive scrambling to proactive AI mitigation, a $200M Tier-2 manufacturer can reduce their expedited freight spend by 40%, and completely avoid catastrophic OEM line-stoppage penalties. 

Our Go-To-Market strategy targets these mid-market automotive suppliers with a SaaS-plus-usage model, integrating directly with their existing SAP or Oracle ERPs without needing a mass data migration."

## Conclusion & Google Stack (1 min)
"Under the hood, this is heavily powered by the Google Ecosystem. We use Next.js on Cloud Run for the frontend, Google Maps for the visualization layer, Workspace APIs for action execution, and the incredible reasoning speed of Vertex AI and Gemini to power the intelligence layer.

SupplySense democratizes resilience. Thank you, and we're ready for your questions."
