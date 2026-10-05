import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";

import {
  getDatabase,
  ref,
  push,
  onValue
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-database.js";


const firebaseConfig = {
  apiKey: "AIzaSyANiMQvB3H0xUyaNFLZxPmB0Th5FWRvnWg",
  authDomain: "project-room-c650f.firebaseapp.com",
  databaseURL: "https://project-room-c650f-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "project-room-c650f",
  storageBucket: "project-room-c650f.firebasestorage.app",
  messagingSenderId: "381579423187",
  appId: "1:381579423187:web:70f6f4dad5f881f4921326",
  measurementId: "G-NVH2YD0H4F"
};


// Initialize Firebase

const app = initializeApp(firebaseConfig);

const db = getDatabase(app);


// Create / get room

const urlParams = new URLSearchParams(window.location.search);

let roomId = urlParams.get("room");

if (!roomId) {

  roomId = Math.random()
    .toString(36)
    .substring(2, 9);

  const newUrl =
    window.location.pathname +
    "?room=" +
    roomId;

  window.history.replaceState({}, "", newUrl);
}


document.getElementById("roomId").textContent = roomId;


// Firebase message location

const messagesRef =
  ref(db, `rooms/${roomId}/messages`);


// UI

const nameInput =
  document.getElementById("name");

const messageInput =
  document.getElementById("messageInput");

const sendButton =
  document.getElementById("sendButton");

const messagesContainer =
  document.getElementById("messages");


// Send message

function sendMessage() {

  const name =
    nameInput.value.trim() || "Anonymous";

  const message =
    messageInput.value.trim();

  if (!message) return;


  push(messagesRef, {

    name: name,

    text: message,

    timestamp: Date.now()

  });


  messageInput.value = "";

  messageInput.focus();
}


sendButton.addEventListener(
  "click",
  sendMessage
);


messageInput.addEventListener(
  "keydown",
  (event) => {

    if (event.key === "Enter") {

      sendMessage();

    }

  }
);


// Receive messages in real time

onValue(messagesRef, (snapshot) => {

  messagesContainer.innerHTML = "";

  const data = snapshot.val();

  if (!data) {

    messagesContainer.innerHTML = `
      <div class="welcome">
        <h2>Welcome to Project Room 👋</h2>
        <p>Start brainstorming with your team.</p>
      </div>
    `;

    return;
  }


  Object.values(data)
    .sort((a, b) => a.timestamp - b.timestamp)
    .forEach(message => {

      const element =
        document.createElement("div");

      element.className = "message";

      const time =
        new Date(message.timestamp)
          .toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
          });


      element.innerHTML = `

        <div class="message-name">
          ${escapeHTML(message.name)}
        </div>

        <div class="message-text">
          ${escapeHTML(message.text)}
        </div>

        <div class="message-time">
          ${time}
        </div>

      `;

      messagesContainer.appendChild(element);

    });


  messagesContainer.scrollTop =
    messagesContainer.scrollHeight;

});


// Security against HTML injection

function escapeHTML(text) {

  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}


// Copy room link

document
  .getElementById("copyRoom")
  .addEventListener("click", async () => {

    await navigator.clipboard.writeText(
      window.location.href
    );

    alert("Room link copied!");

  });