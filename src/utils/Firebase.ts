import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBNrTesD1Wun_8DyaLA3sUCCFNKOn0w1zk",
  authDomain: "ecommerce-e6268.firebaseapp.com",
  projectId: "ecommerce-e6268",
  storageBucket: "ecommerce-e6268.appspot.com",
  messagingSenderId: "590040396759",
  appId: "1:590040396759:web:5804fb2985d6dd8af95192",
};

const app = initializeApp(firebaseConfig);
export const storage = getStorage(app, "gs://ecommerce-e6268.appspot.com");
