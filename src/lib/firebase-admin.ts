import * as admin from 'firebase-admin';

const   FIREBASE_PROJECT_ID="testprephaven"
const FIREBASE_CLIENT_EMAIL="firebase-adminsdk-fbsvc@testprephaven.iam.gserviceaccount.com"
const FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEugIBADANBgkqhkiG9w0BAQEFAASCBKQwggSgAgEAAoIBAQC5NaSFpHj+Bh2L\nfmZZy8wgNMTotWgx0qq836VdSo6CfKjhct61K7zDwslm5rJDh0t2PnX4WZ2TbuVZ\nijjqi7p+9EGnf+W9N9cR5HT2JziTeEHNRV9qVidK6rzY2RuPJVWzoXIyfLvUbPsL\n0bBuxmCcMqxbkC1iDxejzYaMCJUAbHSM4/NxuX3lHG2ontyaIPcM2wqP8dm1oT2u\nBHlazu3SsiAuCt6Ziz4fHyQAIWffefCBpSfzlYjf2yxyeWr2u+mDxtglUJ3wDHTX\n4osZlVeg2rwOPArz7I26GoNEw0tuiZxXvkyzLQ4NPsvnm9BQNUK4iG4HxFjAhJ6C\nFtHXYO4PAgMBAAECggEAV21vjtiPdtY7LySJOx09a/yM8Q7lMxOvnj3yaSHvOMCQ\n1e+sGpidYEl8WhNPlhnxMM2WUZg4DqccI9LgQDOaYyB5N5DjyZjo8NzHq4TjK5Xq\ndfQn8OHfZXl+kNyXqlBk7skox5Vi8wlIzpD6+KezZjhzbTuXeMEIFz5HI6ZPc+Vw\nkhV1q0Oex1da38V9Pe6+yAZFGSA8Wei55vha1DQRDP+0u1gtnzUikv4E/ZOvbvH1\nwtkrYD3gj2hCXB84PALA5vlZYrBmlg6J7Cdp1Yv5EjQHskBndXHhJ5NgdIYwtqcA\nHRRM8vCZegdltrmUjg6K8/N6k6yWGxaDJmReTUtA4QKBgQDmDet6KTPKpABVaUk/\nLVFh1MUDUNhBoNfaUzFSGf3lf/coXbcJ+vyniZ4oppndrDoVfLC7Cum+zMMXZh8Q\nWxHS2g0V6TDeBUUef5enfVrXRLzr61MUs27PkdWW34HZ8m0FsmCLEGZvs1jbnY3o\nekXGCIKba5Zh77af+DrvxbRkLwKBgQDOGPj2yvAw5wj8ZZQblRoeSdCZlB1eHy3w\nerodY45QJ2VnB5FtB4+HfDTSqBMOd4o1f/0AKMvS1eGSjm9+X/oROGSgZNShhfit\nXyMoHpQB0zr2bToiSeWmvlcraRxPtA+5BhsjXazI3wtSuUShTn0/CvyFdwkprkOG\nyIV1DGs8IQJ/MzjmNUz3OydI67uFk4uDk0TMmPBnNjWZ2gKr+JvQ7EiRv2seVhqM\nJsF9dY+isrimNiKNNxg280SkK5GRWRLt5QSn5TkGqGiD+0Ztfd1rXILxjZXX6cQJ\n6C2QYQdi4iQYIiyVUmFUbYqBPmTWM+0FnBJJAlHyKdw1zWh3tutOPwKBgBIuB8AV\nVKyrpJJHD5KDS4OCdWEmvJRx4aaF3Ob8wi/12a8F7uEUOqfz3+D5LH0pNErV2GZs\nMtaNQVGhONqH8tIUDGRNoKgC3lXEv6ApWlry3A+iwO8HX7eesKfGpNWvB3gFvt0W\nxUgOzLvmVdR4zPmDqZTIVEmV8qTwCT2y876hAoGAJzCMGHISyofnBqQWwOpakSMQ\nAmH1WsJo/bxu65AyZHwOcOYqzGUY16rvfTHQbbxt0a0Old2rAcj6moM/oNm6naw1\nkgYxrPplVjt2yGY4BzEQoWebMk9P+wAG3O24Rw7a8LrsLjtVOQQaj0xd2vfqHqJO\nRE2l/Bb2Z7os8gGyPDc=\n-----END PRIVATE KEY-----\n"

// Initialize Firebase Admin SDK
function initializeFirebaseAdmin() {
  console.log('Attempting to initialize Firebase Admin SDK...');
  
  // Skip initialization during build time in production
  if (process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE === 'build') {
    console.log('Skipping Firebase Admin initialization during build');
    return { auth: null, firestore: null };
  }

  // Check if already initialized
  if (admin.apps.length > 0) {
    console.log('Firebase Admin SDK already initialized');
    return {
      auth: admin.auth(),
      firestore: admin.firestore()
    };
  }

  try {
    // Get credentials from environment variables
    const projectId = FIREBASE_PROJECT_ID;
    const clientEmail = FIREBASE_CLIENT_EMAIL;
    const privateKey = FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    // Log environment variable status (without revealing sensitive data)
    console.log('Firebase Admin SDK environment variables status:');
    console.log(`- FIREBASE_PROJECT_ID: ${projectId ? 'Set' : 'Missing'}`);
    console.log(`- FIREBASE_CLIENT_EMAIL: ${clientEmail ? 'Set' : 'Missing'}`);
    console.log(`- FIREBASE_PRIVATE_KEY: ${privateKey ? 'Set' : 'Missing'}`);

    // Check if credentials are available
    if (!projectId || !clientEmail || !privateKey) {
      console.error('Missing Firebase Admin SDK credentials in environment variables');
      return { auth: null, firestore: null };
    }

    // Initialize the app
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey
      })
    });

    console.log('Firebase Admin SDK initialized successfully');
    return {
      auth: admin.auth(),
      firestore: admin.firestore()
    };
  } catch (error) {
    console.error('Error initializing Firebase Admin SDK:', error);
    return { auth: null, firestore: null };
  }
}

// Export the initialized services
const { auth, firestore } = initializeFirebaseAdmin();
export { auth, firestore };  
