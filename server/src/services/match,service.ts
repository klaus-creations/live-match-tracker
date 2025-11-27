import { matches } from '../data/store';
import * as sseService from './sse.service';
import { Match, Log } from '../types';

// Helper to get current match time (e.g., "42'")
const getMatchTime = (match: Match): string => {
    if (match.status === 'scheduled') return '00\'';
    if (match.status === 'finished') return 'FT';

    if (!match.startTime) return '00\'';

    const now = Date.now();
    const diff = Math.floor((now - match.startTime) / 60000); // Minutes

    if (diff > 90) return '90+';
    return `${diff}'`;
};

// Check for auto-ending games (optional, but safer to let Admin end it)
const checkAutoEnd = (match: Match) => {
    // If you strictly want it to end at 90m (usually matches go 95-100m with breaks)
    // We will leave this manual for Admin, but the UI will show '90+'
};

export const createMatch = (teamA: string, teamB: string): Match => {
    const newMatch: Match = {
        id: Date.now().toString(),
        teamA,
        teamB,
        scoreA: 0,
        scoreB: 0,
        status: 'scheduled',
        logs: []
    };
    matches.push(newMatch);
    // Broadcast list update so it appears on Home page immediately
    sseService.broadcastGlobal();
    return newMatch;
};

export const startMatch = (id: string): Match | undefined => {
    const match = matches.find(m => m.id === id);
    if (!match) return undefined;

    match.status = 'live';
    match.startTime = Date.now();
    match.logs.push({
        time: '0\'',
        type: 'start',
        description: 'Match Started'
    });

    sseService.broadcastGlobal();
    sseService.broadcastMatch(match.id, match);
    return match;
};

export const endMatch = (id: string): Match | undefined => {
    const match = matches.find(m => m.id === id);
    if (!match) return undefined;

    match.status = 'finished';
    match.endTime = Date.now();
    match.logs.push({
        time: 'FT',
        type: 'end',
        description: 'Match Ended'
    });

    sseService.broadcastGlobal();
    sseService.broadcastMatch(match.id, match);
    return match;
};

// Handle detailed events
export const handleMatchEvent = (
    id: string,
    type: Log['type'],
    team: 'A' | 'B' | undefined,
    player: string | undefined
): Match | undefined => {
    const match = matches.find(m => m.id === id);
    if (!match || match.status !== 'live') return undefined;

    const time = getMatchTime(match);
    let description = '';

    if (type === 'goal') {
        if (team === 'A') match.scoreA++;
        if (team === 'B') match.scoreB++;
        description = `Goal! Scored by ${player}`;
    } else if (type === 'card_yellow') {
        description = `Yellow Card: ${player}`;
    } else if (type === 'card_red') {
        description = `Red Card: ${player}`;
    } else if (type === 'corner') {
        description = `Corner Kick for ${team === 'A' ? match.teamA : match.teamB}`;
    } else if (type === 'foul') {
        description = `Foul committed by ${team === 'A' ? match.teamA : match.teamB}`;
    }

    match.logs.push({ time, type, team, player, description });

    sseService.broadcastGlobal();
    sseService.broadcastMatch(match.id, match);
    return match;
};

export const getAllMatches = (): Match[] => matches; // Return all, let frontend sort
export const getMatchById = (id: string): Match | undefined => matches.find(m => m.id === id);
export const getAllLiveMatches = (): Match[] => matches.filter(m => m.status === 'live');
