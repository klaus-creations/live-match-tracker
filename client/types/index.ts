
export type MatchStatus = 'scheduled' | 'live' | 'finished';

export interface Log {
  time: string;
  type: 'goal' | 'card_yellow' | 'card_red' | 'corner' | 'foul' | 'start' | 'end';
  description: string;
  team?: 'A' | 'B';
  player?: string;
}

export interface Match {
  id: string;
  teamA: string;
  teamB: string;
  scoreA: number;
  scoreB: number;
  status: MatchStatus;
  startTime?: number;
  logs: Log[];
}
