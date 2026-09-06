const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { nanoid } = require('nanoid');
const { loadDB, saveDB } = require('../data/store');
const { authMiddleware, tokenBlacklist, JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

function publicUser(u) {
  const { password, ...rest } = u;
  return rest;
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { nome, email, password } = req.body;

  if (!nome || !email || !password) {
    return res.status(400).json({ error: 'Nome, email e password sono obbligatori.' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'La password deve avere almeno 6 caratteri.' });
  }

  const db = loadDB();
  const exists = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (exists) {
    return res.status(409).json({ error: 'Esiste già un account con questa email.' });
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = {
    id: nanoid(),
    nome,
    email,
    password: hashed,
    bio: '',
    areaInteresse: '',
    createdAt: new Date().toISOString(),
  };
  db.users.push(user);

  db.notifications.push({
    id: nanoid(),
    userId: user.id,
    message: `Benvenuto/a su UnoBravo, ${nome}! Il tuo spazio personale è pronto.`,
    read: false,
    createdAt: new Date().toISOString(),
  });

  saveDB(db);

  const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '2h' });
  res.status(201).json({ token, user: publicUser(user) });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email e password sono obbligatorie.' });
  }

  const db = loadDB();
  const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    return res.status(401).json({ error: 'Credenziali non valide.' });
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return res.status(401).json({ error: 'Credenziali non valide.' });
  }

  const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '2h' });
  res.json({ token, user: publicUser(user) });
});


router.post('/logout', authMiddleware, (req, res) => {
  tokenBlacklist.add(req.token);
  res.json({ message: 'Logout effettuato con successo.' });
});


router.get('/me', authMiddleware, (req, res) => {
  res.json({ user: publicUser(req.user) });
});

module.exports = router;