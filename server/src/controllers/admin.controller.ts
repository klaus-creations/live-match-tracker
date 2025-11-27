import { Request, Response } from 'express';
import * as matchService from '../services/match,service';

export const createMatch = (req: Request, res: Response) => {
    const { teamA, teamB } = req.body;
    if (!teamA || !teamB) {
        res.status(400).json({ error: 'Teams required' });
        return;
    }

    const match = matchService.createMatch(teamA, teamB);
    res.status(201).json(match);
};

export const startMatch = (req: Request, res: Response) => {
    const match = matchService.startMatch(req.params.id);
    if (!match) {
        res.status(404).json({ error: 'Match not found' });
        return;
    }
    res.json({ message: 'Match started', match });
};


export const endMatch = (req: Request, res: Response) => {
    const match = matchService.endMatch(req.params.id);
    if (!match) {
        res.status(404).json({ error: 'Match not found' });
        return;
    }
    res.json({ message: 'Match ended', match });
};

export const triggerEvent = (req: Request, res: Response) => {
    const { type, team, player } = req.body;
    // type: 'goal' | 'card_yellow' | 'card_red' | 'corner' | 'foul'

    const match = matchService.handleMatchEvent(req.params.id, type, team, player);
    if (!match) {
        res.status(400).json({ error: 'Match not found or not live' });
        return;
    }
    res.json(match);
};
