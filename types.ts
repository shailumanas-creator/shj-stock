
export enum ConditionType {
  FUNDAMENTAL = 'FUNDAMENTAL',
  TECHNICAL = 'TECHNICAL'
}

export interface Condition {
  id: string;
  title: string;
  description: string;
  type: ConditionType;
}

export interface Combo {
  id: string;
  name: string;
  description: string;
  fundamentals: string[];
  technicals: string[];
  screenerQuery: string;
  tradingViewFilters: string;
}

export interface GroundingSource {
  web?: {
    uri: string;
    title: string;
  };
}
