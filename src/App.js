import "./App.css";
import React, { useRef, useState } from "react";

import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";

import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";

import logoGoogle from "./assets/icons/icon-google-48x48.png";

if (!firebase.apps.length) {
  firebase.initializeApp({
    apiKey: "",
    authDomain: "fire-chat-89c34.firebaseapp.com",
    projectId: "fire-chat-89c34",
    storageBucket: "fire-chat-89c34.appspot.com",
    messagingSenderId: "652068424642",
    appId: "1:652068424642:web:05a9b8159c86a419cfa45b",
  });

  console.log("firebase initialized");
} else {
  firebase.app();
}
const firestore = firebase.firestore();

const auth = firebase.auth();

function SignIn() {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  };
  return (
    <button className="button-signin" onClick={signInWithGoogle}>
      {" "}
      <img src={logoGoogle} alt="logo-google" /> Acesse com o Google
    </button>
  );
}

function SignOut() {
  return (
    <button
      className="button-signout"
      onClick={() => firebase.auth().signOut()}
    >
      Sair do sistema
    </button>
  );
}

function ChatRom() {
  let messages = [];

  const deleteAllMessage = async () => {
    await messages.forEach(element => {
      const docRef = firestore.collection("messages").doc(element.id)
      docRef.delete();
    });
  };


  const messagesCollection = firestore.collection("messages");
  const query = messagesCollection.orderBy("createdAt");

  const dummy = useRef();
  const [formValue, setFormValue] = useState("");

  

  

  const sendMessage = async (e) => {
    e.preventDefault();

    const { uid, photoURL } = auth.currentUser;

    if (formValue.length > 0 && formValue.trim()) {
      await messagesCollection.add({
        text: formValue,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        uid,
        photoURL,
      });
    }

    setFormValue("");

    dummy.current.scrollIntoView({ behavior: "smooth" });
    if(messages.length > 12) {
      deleteAllMessage();
    }
  };

  [messages] = useCollectionData(
    query,
    { idField: "id" },
    {
      snapshotListenOptions: { includeMetadataChanges: true },
    }
  );

  
  

  return (
    <>
      <main>
        {messages &&
          messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)}
        <div ref={dummy}></div>
      </main>

      <form onSubmit={sendMessage}>
        <input
          value={formValue}
          onChange={(e) => setFormValue(e.target.value)}
          type="text"
          placeholder="Digite sua messagem jovem"
        />
        <button type="submit">Enviar</button>
      </form>
    </>
  );
}

function ChatMessage(props) {
  const { text, uid, photoURL, createdAt } = props.message;
  const messageClass = uid === auth.currentUser.uid ? "sent" : "received";

  if (createdAt) {
    const createdAtTimeCurrent = createdAt.toDate();

    return (
      <>
        <div className={`message ${messageClass}`}>
          <img src={photoURL} alt="profile"/>
          <p>{text}</p>
        </div>

        <span className={`times time-${messageClass}`}>
          {createdAtTimeCurrent.toLocaleString() || ""}
        </span>
      </>
    );
  } else {
    return (
      <>
        <div className={`message ${messageClass}`}>
          <img src={photoURL} alt="profile" />
          <p>{text}</p>
        </div>
      </>
    );
  }
}

function App() {
  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header>
        <h1 className="title">React chat study 🔥</h1>
        {user ? <SignOut /> : ""}
      </header>
      <section>{user ? <ChatRom /> : <SignIn />}</section>
    </div>
  );
}

export default App;
