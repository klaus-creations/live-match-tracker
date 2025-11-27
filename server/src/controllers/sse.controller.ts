import { Request, Response } from 'express';
import * as sseService from '../services/sse.service';

export const streamGlobalMatches = (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    sseService.addGlobalClient(res);

    req.on('close', () => {
        sseService.removeGlobalClient(res);
    });
};

export const streamMatchDetail = (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const matchId = req.params.id;
    sseService.addMatchClient(res, matchId);

    req.on('close', () => {
        sseService.removeMatchClient(res, matchId);
    });
};
