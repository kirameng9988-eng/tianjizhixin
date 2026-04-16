import express from 'express';
import { readFile, writeFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const configPath = join(__dirname, '../data/config.json');

const router = express.Router();

async function readConfig() {
  const data = await readFile(configPath, 'utf-8');
  return JSON.parse(data);
}

async function writeConfig(config) {
  await writeFile(configPath, JSON.stringify(config, null, 2), 'utf-8');
}

router.get('/', async (req, res) => {
  try {
    const config = await readConfig();
    res.json(config.systems);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const config = await readConfig();
    const newSystem = {
      id: Date.now().toString(),
      ...req.body
    };
    config.systems.push(newSystem);
    await writeConfig(config);
    res.json(newSystem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const config = await readConfig();
    const index = config.systems.findIndex(s => s.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'System not found' });
    }
    config.systems[index] = { ...config.systems[index], ...req.body, id: req.params.id };
    await writeConfig(config);
    res.json(config.systems[index]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const config = await readConfig();
    const index = config.systems.findIndex(s => s.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'System not found' });
    }
    config.systems.splice(index, 1);
    await writeConfig(config);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
