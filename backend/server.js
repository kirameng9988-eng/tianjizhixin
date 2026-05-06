import express from 'express';
import cors from 'cors';
import systemsRouter from './routes/systems.js';
import configRouter from './routes/config.js';
import usersRouter from './routes/users.js';
import rolesRouter from './routes/roles.js';
import applicationsRouter from './routes/applications.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/systems', systemsRouter);
app.use('/api/config', configRouter);
app.use('/api/users', usersRouter);
app.use('/api/roles', rolesRouter);
app.use('/api/applications', applicationsRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});