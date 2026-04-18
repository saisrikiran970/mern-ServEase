const admin = require('firebase-admin');

const initFirebase = () => {
  if (!process.env.FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID === 'xxx') {
    console.warn('Firebase configuration is missing or using placeholders. Firebase Auth will not work.');
    return null;
  }

  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // Handle escaped newlines in the private key string from .env
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
      })
    });
    console.log('Firebase Admin initialized');
    return admin;
  } catch (error) {
    console.error('Firebase Admin initialization error:', error.message);
    return null;
  }
};

module.exports = { admin, initFirebase };
