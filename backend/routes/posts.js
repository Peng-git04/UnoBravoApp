const express = require('express');
const { nanoid } = require('nanoid');
const { loadDB, saveDB } = require('../data/store');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

function serializePost(post, currentUserId) {
  return {
    id: post.id,
    authorId: post.authorId,
    authorName: post.authorName,
    content: post.content,
    createdAt: post.createdAt,
    likesCount: post.likes.length,
    likedByMe: post.likes.includes(currentUserId),
    isMine: post.authorId === currentUserId,
  };
}

// GET /api/posts — bacheca condivisa, dal più recente
router.get('/', authMiddleware, (req, res) => {
  const db = loadDB();
  const posts = [...db.posts]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map((p) => serializePost(p, req.user.id));
  res.json({ posts });
});

// POST /api/posts — pubblica un pensiero/messaggio sulla bacheca
router.post('/', authMiddleware, (req, res) => {
  const { content } = req.body;
  if (!content || !content.trim()) {
    return res.status(400).json({ error: 'Il contenuto del post non può essere vuoto.' });
  }
  if (content.length > 500) {
    return res.status(400).json({ error: 'Il post può contenere al massimo 500 caratteri.' });
  }

  const db = loadDB();
  const post = {
    id: nanoid(),
    authorId: req.user.id,
    authorName: req.user.nome,
    content: content.trim(),
    likes: [],
    createdAt: new Date().toISOString(),
  };
  db.posts.push(post);
  saveDB(db);

  res.status(201).json({ post: serializePost(post, req.user.id) });
});

// POST /api/posts/:id/like — metti/togli un cuore a un post altrui
router.post('/:id/like', authMiddleware, (req, res) => {
  const db = loadDB();
  const post = db.posts.find((p) => p.id === req.params.id);
  if (!post) {
    return res.status(404).json({ error: 'Post non trovato.' });
  }

  const already = post.likes.includes(req.user.id);
  if (already) {
    post.likes = post.likes.filter((id) => id !== req.user.id);
  } else {
    post.likes.push(req.user.id);
    // Notifica l'autore del post (se non sta mettendo like a se stesso)
    if (post.authorId !== req.user.id) {
      db.notifications.push({
        id: nanoid(),
        userId: post.authorId,
        message: `${req.user.nome} ha apprezzato il tuo pensiero sulla bacheca.`,
        read: false,
        createdAt: new Date().toISOString(),
      });
    }
  }

  saveDB(db);
  res.json({ post: serializePost(post, req.user.id) });
});

// DELETE /api/posts/:id — un utente può eliminare solo i propri post
router.delete('/:id', authMiddleware, (req, res) => {
  const db = loadDB();
  const post = db.posts.find((p) => p.id === req.params.id);
  if (!post) {
    return res.status(404).json({ error: 'Post non trovato.' });
  }
  if (post.authorId !== req.user.id) {
    return res.status(403).json({ error: 'Puoi eliminare solo i tuoi post.' });
  }

  db.posts = db.posts.filter((p) => p.id !== req.params.id);
  saveDB(db);
  res.json({ message: 'Post eliminato.' });
});

module.exports = router;