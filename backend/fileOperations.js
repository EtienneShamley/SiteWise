const express = require('express');
const admin = require('firebase-admin');

const router = express.Router();

// ✅ Don't call admin.firestore() immediately
// Wait until the route is hit, so Firebase is already initialized

// Save note
router.post('/save', async (req, res) => {
  const db = admin.firestore();
  try {
    const { userId, noteId, content } = req.body;
    await db.collection('users').doc(userId).collection('notes').doc(noteId).set({ content });
    res.status(200).json({ message: 'Note saved' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save note', details: err.message });
  }
});

// Do the same for other routes...
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

router.post('/share', (req, res) => {
  const { userId, noteId } = req.body;
  const shareLink = `https://sitewise.app/share/${userId}/${noteId}`;
  res.status(200).json({ link: shareLink });
});

// Create folder
router.post('/create-folder', async (req, res) => {
  const { userId, folderId, name, createdAt } = req.body;

  try {
    await db.collection('users').doc(userId).collection('folders').doc(folderId).set({ name, createdAt });
    res.status(200).json({ message: 'Folder created' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create folder', details: err.message });
  }
});


module.exports = router;
