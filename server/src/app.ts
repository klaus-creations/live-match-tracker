import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

import adminRoutes from './routes/admin.route';
import matchRoutes from './routes/match.route';
import sseRoutes from './routes/sse.route';

export const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use('/api/admin', adminRoutes);
app.use('/api', matchRoutes);
app.use('/events', sseRoutes);

