const express = require('express');
const { loadDB, saveDB } = require('../data/store');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

function publicUser(u) {
  const { password, ...rest } = u;
  return rest;
}

// GET /api/profile
router.get('/', authMiddleware, (req, res) => {
  res.json({ user: publicUser(req.user) });
});

// PUT /api/profile
router.put('/', authMiddleware, (req, res) => {
  const { nome, bio, areaInteresse } = req.body;
  const db = loadDB();
  const user = db.users.find((u) => u.id === req.user.id);

  if (nome !== undefined) user.nome = nome;
  if (bio !== undefined) user.bio = bio;
  if (areaInteresse !== undefined) user.areaInteresse = areaInteresse;

  saveDB(db);
  res.json({ user: publicUser(user) });
});

module.exports = router;