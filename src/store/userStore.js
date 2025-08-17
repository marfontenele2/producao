// 📄 ARQUIVO: src/store/userStore.js (Versão Definitiva)
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { auth, db } from "@/firebase";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

let authListenerUnsubscribe = null;

export const useUserStore = defineStore("user", () => {
  const user = ref(null);
  const isInitialized = ref(false);

  const isLoggedIn = computed(() => !!user.value);
  const isAdmin = computed(() => user.value?.role === "Administrador");
  const isGerente = computed(() => user.value?.role === "Gerente");
  const isEnfermeiro = computed(() => user.value?.role === "Enfermeiro");
  const isCoordenador = computed(() => user.value?.role === "Coordenador");

  async function fetchUserProfile(uid) {
    if (!uid) {
      user.value = null;
      return null;
    }
    const userDocRef = doc(db, "users", uid);
    const userDocSnap = await getDoc(userDocRef);
    if (userDocSnap.exists()) {
      user.value = { uid, ...userDocSnap.data() };
      return user.value;
    } else {
      // Se o usuário existe no Auth mas não no Firestore, desloga para evitar inconsistências.
      await signOut(auth);
      return null;
    }
  }

  // Lógica de login corrigida para ser uma operação atômica.
  // Ela agora espera o perfil ser buscado ANTES de ser concluída.
  async function login(email, password) {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    // Garante que o user.value esteja completo antes da navegação ocorrer.
    await fetchUserProfile(userCredential.user.uid);
  }

  async function logout() {
    return signOut(auth);
  }

  // Ponto de entrada único para verificar o estado de autenticação na inicialização.
  function init() {
    return new Promise((resolve) => {
      if (authListenerUnsubscribe) authListenerUnsubscribe();

      authListenerUnsubscribe = onAuthStateChanged(
        auth,
        async (firebaseUser) => {
          // Busca o perfil do usuário (se houver) e só então finaliza a inicialização.
          await fetchUserProfile(firebaseUser?.uid);
          if (!isInitialized.value) {
            isInitialized.value = true;
            resolve(firebaseUser);
          }
        }
      );
    });
  }

  return {
    user,
    isInitialized,
    isLoggedIn,
    isAdmin,
    isGerente,
    isEnfermeiro,
    isCoordenador, // Adicionado
    login,
    logout,
    init,
  };
});
