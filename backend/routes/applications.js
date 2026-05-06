import express from 'express';
import { readFile, writeFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dataPath = join(__dirname, '../data/applications.json');

const router = express.Router();

async function readApplications() {
  try {
    const data = await readFile(dataPath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function writeApplications(applications) {
  await writeFile(dataPath, JSON.stringify(applications, null, 2), 'utf-8');
}

// GET /api/applications - list all (admin) or user's applications
router.get('/', async (req, res) => {
  try {
    const applications = await readApplications();
    const { userId, role } = req.query;

    if (role === 'admin') {
      res.json(applications);
    } else if (userId) {
      res.json(applications.filter(app => app.userId === userId));
    } else {
      res.json([]);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/applications/pending - get pending applications (admin)
router.get('/pending', async (req, res) => {
  try {
    const applications = await readApplications();
    res.json(applications.filter(app => app.status === 'pending'));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/applications - create new application
router.post('/', async (req, res) => {
  try {
    const applications = await readApplications();
    const { systemId, userId, username, systemName, reason } = req.body;

    const newApplication = {
      id: Date.now().toString(),
      systemId,
      userId,
      username,
      systemName,
      reason,
      status: 'pending',
      applyTime: new Date().toISOString()
    };

    applications.push(newApplication);
    await writeApplications(applications);
    res.json(newApplication);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/applications/:id - admin processes application
router.put('/:id', async (req, res) => {
  try {
    const applications = await readApplications();
    const index = applications.findIndex(app => app.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ error: 'Application not found' });
    }

    const { status, processNote } = req.body;
    if (status) applications[index].status = status;
    if (processNote !== undefined) applications[index].processNote = processNote;
    if (status === 'approved' || status === 'rejected') {
      applications[index].processTime = new Date().toISOString();
    }

    await writeApplications(applications);
    res.json(applications[index]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;