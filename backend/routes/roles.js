import express from 'express';
import { readFile, writeFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dataPath = join(__dirname, '../data/roles.json');

const router = express.Router();

async function readRoles() {
  try {
    const data = await readFile(dataPath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function writeRoles(roles) {
  await writeFile(dataPath, JSON.stringify(roles, null, 2), 'utf-8');
}

router.get('/', async (req, res) => {
  try {
    const roles = await readRoles();
    res.json(roles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const roles = await readRoles();
    const { name, systemIds } = req.body;

    const newRole = {
      id: Date.now().toString(),
      name,
      systemIds: systemIds || []
    };
    roles.push(newRole);
    await writeRoles(roles);
    res.json(newRole);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const roles = await readRoles();
    const index = roles.findIndex(r => r.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: '角色不存在' });
    }

    const { name, systemIds } = req.body;
    if (name) roles[index].name = name;
    if (systemIds) roles[index].systemIds = systemIds;

    await writeRoles(roles);
    res.json(roles[index]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const roles = await readRoles();
    const index = roles.findIndex(r => r.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: '角色不存在' });
    }

    roles.splice(index, 1);
    await writeRoles(roles);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;