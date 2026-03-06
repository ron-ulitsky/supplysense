export interface Tradeoffs {
  costImpact: string;
  serviceLevelImpact: string;
  resilienceImpact: string;
}

export interface Strategy {
  id: string;
  name: string;
  description: string;
  tradeoffs: Tradeoffs;
  suggestedActions: string[];
}

export interface AIAnalysisResult {
  analysisSummary: string;
  strategies: Strategy[];
}

export const mockAIAnalysis: AIAnalysisResult = {
  analysisSummary: "The Red Sea port congestion will critically delay the 'Battery Management Controllers' required for the Q3 SLA with Major OEM Alpha. Standard buffer inventory (14 days) is insufficient for the estimated 21-day delay.",
  strategies: [
    {
      id: "strat-1",
      name: "Expedite Air Freight (Premium)",
      description: "Divert 30% of critical inventory from Shenzhen to Frankfurt via air cargo to bridge the buffer gap, allowing ocean freight to cover the remainder.",
      tradeoffs: {
        costImpact: "High - $42,000 premium air freight cost.",
        serviceLevelImpact: "Low - 100% SLA adherence maintained.",
        resilienceImpact: "Medium - Prevents immediate failure but drains Q3 logistics budget."
      },
      suggestedActions: ["Approve spot air-freight PO", "Notify warehouse of staggered delivery"]
    },
    {
      id: "strat-2",
      name: "Renegotiate SLA Delivery Window",
      description: "Proactively notify OEM Alpha of force majeure delay and negotiate a partial rolling delivery schedule to avoid 100% line stoppage penalty.",
      tradeoffs: {
        costImpact: "Low - Zero additional freight costs.",
        serviceLevelImpact: "High - Requires customer concession and hits vendor scorecard.",
        resilienceImpact: "Low - Relies entirely on client flexibility."
      },
      suggestedActions: ["Draft email to OEM Alpha Procurement Lead"]
    },
    {
      id: "strat-3",
      name: "Activate Secondary EU Supplier (Spot Buy)",
      description: "Purchase immediate shortfall (2,000 units) from local backup supplier at a 15% markup, accepting lower margin to maintain delivery.",
      tradeoffs: {
        costImpact: "Medium - $15,000 part premium.",
        serviceLevelImpact: "Low - No OEM disruption.",
        resilienceImpact: "High - Validates multi-sourcing strategy."
      },
      suggestedActions: ["Generate PO for EuroSensor GmbH", "Update ERP minimum stock levels"]
    }
  ]
};
