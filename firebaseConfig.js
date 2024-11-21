// firebase.js

import firebase from 'firebase/app';
import 'firebase/database';

const firebaseConfig = {
    apiKey: "AIzaSyANBU9f3-_bA3eBhDVLi8Sx1Jy0XlScIio",
    authDomain: "restaurante-5f3a7.firebaseapp.com",
    databaseURL: "https://restaurante-5f3a7-default-rtdb.firebaseio.com",
    projectId: "restaurante-5f3a7",
    storageBucket: "restaurante-5f3a7.appspot.com",
    messagingSenderId: "1035152857640",
    appId: "1:1035152857640:android:3424513fe3083a265f331d"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

export default firebase;
