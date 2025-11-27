import { Response } from 'express';
import { Match } from '../types';

interface ClientStore {
    global: Response[];
    matchSpecific: { [key: string]: Response[] };
}

export let matches: Match[] = [];

export const clients: ClientStore = {
    global: [],
    matchSpecific: {}
};

