const express = require('express');
const admin = require('firebase-admin');

const router = express.Router();

// Save note (chat submission)
router.post('/save', async (req, res) => {
  const db = admin.firestore();
  try {
    const { userId, noteId, content } = req.body;

    const noteRef = db.collection('users').doc(userId).collection('notes').doc(noteId);
    await noteRef.update({
      content: admin.firestore.FieldValue.arrayUnion(content)
    });

    res.status(200).json({ message: 'Note saved' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save note', details: err.message });
  }
});

// Delete note
router.delete('/delete/:userId/:noteId', async (req, res) => {
  const db = admin.firestore();
  const { userId, noteId } = req.params;
  try {
    await db.collection('users').doc(userId).collection('notes').doc(noteId).delete();
    res.status(200).json({ message: 'Note deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete note', details: err.message });
  }
});

// Rename note
router.post('/rename', async (req, res) => {
  const db = admin.firestore();
  const { userId, noteId, newTitle } = req.body;
  try {
    await db.collection('users').doc(userId).collection('notes').doc(noteId).update({ title: newTitle });
    res.status(200).json({ message: 'Note renamed' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to rename note', details: err.message });
  }
});

// Share note (generate link)
router.post('/share', (req, res) => {
  const { userId, noteId } = req.body;
  const shareLink = `https://sitewise.app/share/${userId}/${noteId}`;
  res.status(200).json({ link: shareLink });
});

// Create folder
router.post('/create-folder', async (req, res) => {
  const db = admin.firestore();
  const { userId, folderId, name, createdAt } = req.body;

  try {
    await db.collection('users').doc(userId).collection('folders').doc(folderId).set({ name, createdAt });
    res.status(200).json({ message: 'Folder created' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create folder', details: err.message });
  }
});

// Create note (outside folder)
router.post('/create-note', async (req, res) => {
  const db = admin.firestore();
  const { userId, noteId, title } = req.body;

  if (!userId || !noteId || !title) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    await db.collection('users').doc(userId).collection('notes').doc(noteId).set({
      title,
      content: [], // Empty array for messages
      createdAt: new Date().toISOString()
    });
    res.status(200).json({ message: 'Note created', noteId });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create note', details: err.message });
  }
});

// Load a single note
router.get('/load/:userId/:noteId', async (req, res) => {
  const db = admin.firestore();
  const { userId, noteId } = req.params;

  try {
    const doc = await db.collection('users').doc(userId).collection('notes').doc(noteId).get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Note not found' });
    }
    res.status(200).json(doc.data());
  } catch (err) {
    res.status(500).json({ error: 'Failed to load note', details: err.message });
  }
});

module.exports = router;
