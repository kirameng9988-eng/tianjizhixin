import express from 'express';
import { readFile, writeFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dataPath = join(__dirname, '../data/users.json');

const router = express.Router();

async function readUsers() {
  try {
    const data = await readFile(dataPath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function writeUsers(users) {
  await writeFile(dataPath, JSON.stringify(users, null, 2), 'utf-8');
}

router.get('/', async (req, res) => {
  try {
    const users = await readUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const users = await readUsers();
    const { username, password, roleId } = req.body;

    if (users.find(u => u.username === username)) {
      return res.status(400).json({ error: '用户名已存在' });
    }

    const newUser = {
      id: Date.now().toString(),
      username,
      password,
      roleId
    };
    users.push(newUser);
    await writeUsers(users);
    res.json({ id: newUser.id, username: newUser.username, roleId: newUser.roleId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const users = await readUsers();
    const index = users.findIndex(u => u.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: '用户不存在' });
    }

    const { username, roleId } = req.body;
    if (username) users[index].username = username;
    if (roleId) users[index].roleId = roleId;
    if (req.body.password) users[index].password = req.body.password;

    await writeUsers(users);
    res.json({ id: users[index].id, username: users[index].username, roleId: users[index].roleId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const users = await readUsers();
    const index = users.findIndex(u => u.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: '用户不存在' });
    }

    users.splice(index, 1);
    await writeUsers(users);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;