import { Request, Response } from 'express';
import * as matchService from '../services/match,service';

export const getMatches = (req: Request, res: Response) => {
    res.json(matchService.getAllMatches());
};

export const getMatchDetail = (req: Request, res: Response) => {
    const match = matchService.getMatchById(req.params.id);
    if (!match) {
        res.status(404).json({ error: 'Match not found' });
        return;
    }
    res.json(match);
};
