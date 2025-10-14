import 'dotenv/config';
import express, { Request, Response } from 'express';
import cors from 'cors';
import routes from './routes';

const app = express();
app.use(express.json({ limit: '1mb' }));
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') || '*' }));

app.get('/health', (_req: Request, res: Response) => res.json({ ok: true }));
app.use('/api', routes);

const PORT = Number(process.env.PORT || 5055);
app.listen(PORT, () => {
    console.log(`FlowLens server listening on http://localhost:${PORT}`);
});
