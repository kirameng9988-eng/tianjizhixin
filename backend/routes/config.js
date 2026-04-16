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
    res.json({
      systemName: config.systemName,
      logo: config.logo
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/', async (req, res) => {
  try {
    const config = await readConfig();
    const { systemName, logo } = req.body;
    if (systemName !== undefined) config.systemName = systemName;
    if (logo !== undefined) config.logo = logo;
    await writeConfig(config);
    res.json({
      systemName: config.systemName,
      logo: config.logo
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
