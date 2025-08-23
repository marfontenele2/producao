// producao-nova/codigo_fonte/nucleo/configuracao/firebase.js

import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore, initializeFirestore, CACHE_SIZE_UNLIMITED } from 'firebase/firestore'
import { getFunctions } from 'firebase/functions'
import { getStorage } from 'firebase/storage'

/**
 * @typedef {object} FirebaseConfig
 * @property {string} apiKey
 * @property {string} authDomain
 * @property {string} projectId
 * @property {string} storageBucket
 * @property {string} messagingSenderId
 * @property {string} appId
 */

/**
 * Configuração do Firebase para o projeto.
 * @type {FirebaseConfig}
 */
const firebaseConfig = {
  apiKey: 'AIzaSyDT9f71JYpYDYwCvSYbAovBO5k5MwypBrE',
  authDomain: 'producao-ae0c2.firebaseapp.com',
  projectId: 'producao-ae0c2',
  storageBucket: 'producao-ae0c2.appspot.com',
  messagingSenderId: '752182230185',
  appId: '1:752182230185:web:7295f37dc2445cd0ab3db8',
}

// Inicializa a aplicação Firebase
const app = initializeApp(firebaseConfig)

// Inicializa os serviços do Firebase
const auth = getAuth(app)
const db = initializeFirestore(app, {
  cacheSizeBytes: CACHE_SIZE_UNLIMITED,
  experimentalForceLongPolling: true, // Evita erros de rede em alguns ambientes
})
const functions = getFunctions(app, 'southamerica-east1')
const storage = getStorage(app)

// Exporta as instâncias dos serviços para serem usadas em toda a aplicação
export { db, auth, functions, storage }
