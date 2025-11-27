import { Response } from 'express';
import { clients, matches } from '../data/store';
import { Match } from '../types';

const sendEvent = (res: Response, data: any) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
};

export const addGlobalClient = (res: Response): void => {
    clients.global.push(res);
    const liveMatches = matches.filter(m => m.status === 'live');
    sendEvent(res, liveMatches);
};

export const removeGlobalClient = (res: Response): void => {
    clients.global = clients.global.filter(client => client !== res);
};

export const addMatchClient = (res: Response, matchId: string): void => {
    if (!clients.matchSpecific[matchId]) {
        clients.matchSpecific[matchId] = [];
    }
    clients.matchSpecific[matchId].push(res);

    const match = matches.find(m => m.id === matchId);
    if (match) sendEvent(res, match);
};

export const removeMatchClient = (res: Response, matchId: string): void => {
    if (clients.matchSpecific[matchId]) {
        clients.matchSpecific[matchId] = clients.matchSpecific[matchId].filter(client => client !== res);
    }
};

export const broadcastGlobal = (): void => {
    const liveMatches = matches.filter(m => m.status === 'live');
    clients.global.forEach(client => sendEvent(client, liveMatches));
};

// Broadcast to "Match Detail" viewers
export const broadcastMatch = (matchId: string, matchData: Match): void => {
    if (clients.matchSpecific[matchId]) {
        clients.matchSpecific[matchId].forEach(client => sendEvent(client, matchData));
    }
};
