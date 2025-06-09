const express = require('express');
const admin = require('firebase-admin');

const router = express.Router();
const db = admin.firestore();

// Save note
router.post('/save', async (req, res) => {
  try {
    const { userId, noteId, content } = req.body;
    await db.collection('users').doc(userId).collection('notes').doc(noteId).set({ content });
    res.status(200).json({ message: 'Note saved' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save note', details: err.message });
  }
});

// Delete note
router.delete('/delete/:userId/:noteId', async (req, res) => {
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
  const { userId, noteId, newTitle } = req.body;
  try {
    await db.collection('users').doc(userId).collection('notes').doc(noteId).update({ title: newTitle });
    res.status(200).json({ message: 'Note renamed' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to rename note', details: err.message });
  }
});

// Share note (dummy - will evolve)
router.post('/share', (req, res) => {
  const { userId, noteId } = req.body;
  const shareLink = `https://sitewise.app/share/${userId}/${noteId}`;
  res.status(200).json({ link: shareLink });
});

module.exports = router;
