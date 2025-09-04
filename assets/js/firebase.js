
// === Firebase bootstrap (Auth + Firestore) ===
// 1) Rename this file to contain your real config or just edit below.
// 2) Fill config from Firebase Console: Project settings → SDK setup and configuration.
const KF_FIREBASE_CONFIG = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Detect if config is filled
const hasFirebaseConfig = KF_FIREBASE_CONFIG.apiKey && !KF_FIREBASE_CONFIG.apiKey.includes("YOUR_");

let fb = { enabled:false };
try {
  if (hasFirebaseConfig) {
    const app = firebase.initializeApp(KF_FIREBASE_CONFIG);
    const auth = firebase.auth();
    const db = firebase.firestore();
    fb = { enabled:true, app, auth, db };
    console.log("[KF] Firebase enabled");
  } else {
    console.log("[KF] Firebase disabled (no config). Falling back to LocalStorage.");
  }
} catch (e) {
  console.warn("[KF] Firebase init failed. Falling back to LocalStorage.", e);
  fb = { enabled:false };
}

// Helpers (Auth)
async function kfRegisterEmail(name, email, pass){
  if (!fb.enabled) { 
    localStorage.setItem('kf_user', JSON.stringify({name,email,pass}));
    return { local:true };
  }
  const cred = await fb.auth.createUserWithEmailAndPassword(email, pass);
  await cred.user.updateProfile({ displayName:name });
  return cred.user;
}

async function kfLoginEmail(email, pass){
  if (!fb.enabled){
    const u = JSON.parse(localStorage.getItem('kf_user')||"null");
    if (u && u.email===email && u.pass===pass) return u;
    throw new Error("Неверный email или пароль (локальный режим).");
  }
  const cred = await fb.auth.signInWithEmailAndPassword(email, pass);
  return cred.user;
}

function kfOnAuth(cb){
  if (!fb.enabled){
    const u = JSON.parse(localStorage.getItem('kf_user')||"null");
    cb(u);
    return ()=>{};
  }
  return fb.auth.onAuthStateChanged(cb);
}

function kfLogout(){
  if (!fb.enabled){
    localStorage.removeItem('kf_user');
    location.href='/index.html';
    return;
  }
  fb.auth.signOut().then(()=>location.href='/index.html');
}

// Helpers (Favorites)
async function kfGetFavIds(){
  if (!fb.enabled){
    try { return JSON.parse(localStorage.getItem('kf_fav')||"[]"); } catch(e){ return []; }
  }
  const u = fb.auth.currentUser;
  if (!u) return [];
  const doc = await fb.db.collection('users').doc(u.uid).get();
  return (doc.exists && doc.data().favorites) || [];
}

async function kfSetFavIds(ids){
  if (!fb.enabled){ localStorage.setItem('kf_fav', JSON.stringify(ids)); return; }
  const u = fb.auth.currentUser;
  if (!u) return;
  await fb.db.collection('users').doc(u.uid).set({ favorites: ids }, { merge:true });
}

async function kfToggleFav(id){
  const ids = new Set(await kfGetFavIds());
  if (ids.has(id)) ids.delete(id); else ids.add(id);
  await kfSetFavIds([...ids]);
  return ids.has(id);
}
