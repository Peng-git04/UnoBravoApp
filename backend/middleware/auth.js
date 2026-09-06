const jwt = require('jsonwebtoken');
const { loadDB } = require('../data/store');

const JWT_SECRET = process.env.JWT_SECRET || 'unobravo-dev-secret-cambiami-in-produzione';

const tokenBlacklist = new Set();

function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token mancante. Effettua il login.' });
  }

  const token = header.split(' ')[1];

  if (tokenBlacklist.has(token)) {
    return res.status(401).json({ error: 'Sessione terminata. Effettua di nuovo il login.' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const db = loadDB();
    const user = db.users.find((u) => u.id === payload.id);
    if (!user) {
      return res.status(401).json({ error: 'Utente non trovato.' });
    }
    req.user = user;
    req.token = token;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token non valido o scaduto.' });
  }
}

module.exports = { authMiddleware, tokenBlacklist, JWT_SECRET };
