import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions";

const firebaseConfig = {
  apiKey: "AIzaSyDT9f71JYpYDYwCvSYbAovBO5k5MwypBrE",
  authDomain: "producao-ae0c2.firebaseapp.com",
  projectId: "producao-ae0c2",
  storageBucket: "producao-ae0c2.appspot.com",
  messagingSenderId: "752182230185",
  appId: "1:752182230185:web:7295f37dc2445cd0ab3db8",
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const functions = getFunctions(app, "southamerica-east1");

// Para desenvolvimento local com emuladores (se necessário no futuro)
// import { connectFunctionsEmulator } from "firebase/functions";
// connectFunctionsEmulator(functions, "localhost", 5001);

export { db, auth, storage, functions };
