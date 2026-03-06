export type Severity = 'low' | 'medium' | 'high' | 'critical';

export interface DisruptionEvent {
  id: string;
  title: string;
  description: string;
  severity: Severity;
  timestamp: string;
  affectedComponents: string[];
  affectedSuppliers: string[];
  region: string;
  estimatedDelayDays: number;
}

export interface Supplier {
  id: string;
  name: string;
  region: string;
  healthScore: number; // 0-100
  tier: 1 | 2 | 3;
  componentsSupplied: string[];
  activeAlerts: number;
}

export const mockDisruptions: DisruptionEvent[] = [
  {
    id: 'D-101',
    title: 'Red Sea Port Congestion',
    description: 'Severe container buildup at major transit hubs delaying Asia-Europe routes.',
    severity: 'high',
    timestamp: '2026-03-06T10:15:00Z',
    affectedComponents: ['Battery Management Controllers', 'Thermal Sensors'],
    affectedSuppliers: ['SUP-003', 'SUP-012'],
    region: 'Middle East / Red Sea',
    estimatedDelayDays: 14,
  },
  {
    id: 'D-102',
    title: 'Lithium Mining Strike',
    description: 'Labor strike at primary extraction facility impacting Q3 raw material allocation.',
    severity: 'critical',
    timestamp: '2026-03-06T08:30:00Z',
    affectedComponents: ['Raw Lithium', 'Battery Cells'],
    affectedSuppliers: ['SUP-001'],
    region: 'South America (Chile)',
    estimatedDelayDays: 30,
  },
  {
    id: 'D-103',
    title: 'Taiwan Semi Facility Yield Drop',
    description: 'Minor QA degradation in 14nm node production line.',
    severity: 'medium',
    timestamp: '2026-03-05T22:45:00Z',
    affectedComponents: ['EV Main Control Unit (MCU)'],
    affectedSuppliers: ['SUP-008'],
    region: 'East Asia',
    estimatedDelayDays: 5,
  },
];

export const mockSuppliers: Supplier[] = [
  {
    id: 'SUP-001',
    name: 'Atacama Lithium Corp',
    region: 'Chile',
    healthScore: 45,
    tier: 2,
    componentsSupplied: ['Raw Lithium'],
    activeAlerts: 1,
  },
  {
    id: 'SUP-003',
    name: 'Shenzhen Electronics Ltd',
    region: 'China',
    healthScore: 72,
    tier: 1,
    componentsSupplied: ['Battery Management Controllers', 'Wiring Harnesses'],
    activeAlerts: 1,
  },
  {
    id: 'SUP-008',
    name: 'Taiwan Micro Components (TMC)',
    region: 'Taiwan',
    healthScore: 88,
    tier: 1,
    componentsSupplied: ['EV Main Control Unit (MCU)', 'Power Inverters'],
    activeAlerts: 1,
  },
  {
    id: 'SUP-012',
    name: 'EuroSensor GmbH',
    region: 'Germany',
    healthScore: 95,
    tier: 1,
    componentsSupplied: ['Thermal Sensors', 'Proximity Sensors'],
    activeAlerts: 0,
  },
];
