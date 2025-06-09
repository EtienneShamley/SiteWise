// server.js
const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');
const fileOperations = require('./backend/fileOperations');

const app = express();
app.use(cors());
app.use(express.json());

// Firebase Admin init
const serviceAccount = require('./firebase-service-account.json'); // <-- you'll add this next
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://your-project-id.firebaseio.com' // Replace with your actual Firebase project URL
});

// Routes
app.use('/api/files', fileOperations);

// Server start
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`SiteWise backend listening on port ${PORT}`);
});
