// var firebase = require("firebase");

// var config = {
//   apiKey: "abcdefghijklmnopqrstuvwxyz",
//   authDomain: "lintangwisesa.firebaseapp.com",
//   databaseURL: "https://lintangwisesa.firebaseio.com",
//   projectId: "lintangwisesa",
//   storageBucket: "lintangwisesa.appspot.com",
//   messagingSenderId: "1234567890",
//   appId: "0:1234567890:web:1234567890abcde",
// };

// var fire = firebase.initializeApp(config);
// module.exports = fire;

// fire.js

const admin = require("firebase-admin");

const serviceAccount = require("../capstonec04-c3cfc-firebase-adminsdk-uh2o4-9cd7371be2.json"); // Replace with your service account key JSON file path

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const firestore = admin.firestore();

module.exports = firestore;
