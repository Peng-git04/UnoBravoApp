const express = require('express');
const { loadDB, saveDB } = require('../data/store');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// GET /api/notifications — le notifiche dell'utente loggato, più recenti prima
router.get('/', authMiddleware, (req, res) => {
  const db = loadDB();
  const notifications = db.notifications
    .filter((n) => n.userId === req.user.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json({ notifications });
});

// PUT /api/notifications/:id/read — segna una notifica come letta
router.put('/:id/read', authMiddleware, (req, res) => {
  const db = loadDB();
  const notif = db.notifications.find((n) => n.id === req.params.id && n.userId === req.user.id);
  if (!notif) {
    return res.status(404).json({ error: 'Notifica non trovata.' });
  }
  notif.read = true;
  saveDB(db);
  res.json({ notification: notif });
});

// PUT /api/notifications/read-all — segna tutte come lette
router.put('/read-all', authMiddleware, (req, res) => {
  const db = loadDB();
  db.notifications.forEach((n) => {
    if (n.userId === req.user.id) n.read = true;
  });
  saveDB(db);
  res.json({ message: 'Tutte le notifiche sono state segnate come lette.' });
});

module.exports = router;