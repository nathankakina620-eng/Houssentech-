import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Initialisation unique de l'application Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Récupération de l'instance Firestore avec support du databaseId provisionné
export const db =
  firebaseConfig.firestoreDatabaseId &&
  firebaseConfig.firestoreDatabaseId !== '(default)'
    ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
    : getFirestore(app);

// Validation de connexion au démarrage selon le standard skill
async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, 'system', 'connection_test'));
    console.log('[Firebase Firestore] Connexion établie avec succès sur le projet:', firebaseConfig.projectId);
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('[Firebase Firestore] Mode hors-ligne détecté ou problème réseau:', error.message);
    } else {
      console.log('[Firebase Firestore] Initialisation prête.');
    }
  }
}
testFirestoreConnection();

export default app;
