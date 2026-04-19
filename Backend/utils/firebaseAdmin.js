const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');

const loadServiceAccount = () => {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
  }

  const servicePath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  if (!servicePath) {
    throw new Error('Missing FIREBASE_SERVICE_ACCOUNT_PATH or FIREBASE_SERVICE_ACCOUNT_JSON');
  }

  const resolved = path.isAbsolute(servicePath)
    ? servicePath
    : path.join(process.cwd(), servicePath);
  const raw = fs.readFileSync(resolved, 'utf8');
  return JSON.parse(raw);
};

const initFirebaseAdmin = () => {
  if (admin.apps.length) {
    return admin.app();
  }

  const serviceAccount = loadServiceAccount();
  return admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
};

module.exports = { admin, initFirebaseAdmin };
