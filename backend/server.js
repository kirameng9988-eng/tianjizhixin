import express from 'express';
import cors from 'cors';
import systemsRouter from './routes/systems.js';
import configRouter from './routes/config.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/systems', systemsRouter);
app.use('/api/config', configRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
