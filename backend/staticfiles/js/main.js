let chatSocket = null;
let chatWindowUrl = window.location.href; //l url courant
let chatRoomUuid = "Undefined";
let current_user = JSON.parse(document.getElementById("user_id").textContent);


invitation_to_play
const invitationgameElement = document.querySelector("#invitation_to_play"); //le gros caarreau de room
const chatRoomElement = document.querySelector("#chat_room"); //le gros caarreau de room
const chatLogElement = document.querySelector("#chat_log"); // le champs ou s'aafichent les messages envoyees
const chatInputElement = document.querySelector("#chat_message_input"); //champs ou on ecrit le messaage
const chatSubmitElement = document.querySelector("#chat_message_submit"); // bouton pour envoyer le messag
const chatUsersList = document.querySelector("#users");

document.addEventListener('DOMContentLoaded', function() {
  const chatUsersList = document.getElementById('users');

  chatUsersList.addEventListener("click", (event) => {
      const usernameElement = event.target;
      if (usernameElement.classList.contains("list-group-item")) {
          const username = usernameElement.textContent;
          chatRoomUuid = getRoomName(current_user, username);
          joinChatRoom();
      }
  });
});
function getRoomName(user1, user2) {
  return [user1, user2].sort().join("_");
}

function scrollToBottom() {
  chatLogElement.scrollTop = chatLogElement.scrollHeight;
}


function sendMessage() {
  

  chatSocket.send(
    JSON.stringify({
      'type': 'chat_message',
      message: chatInputElement.value,
      author: current_user,
    })
  );

  chatInputElement.value = "";
}

function onChatMessage(data) {

  console.log("onChatMessage", data);

  if (data.type == "chat_message") {
    let tmpInfo = document.querySelector(".tmp-info");
    chatLogElement.innerHTML += `
            <div class="flex w-full mt-2 space-x-3 max-w-md ml-auto justify-end">
                <div>
                    <div class="bg-blue-300 p-3 rounded-l-lg rounded-br-lg">
                        <p class="text-sm">${data.message}</p>
                    </div>

                    <span class="text-xs text-gray-500 leading-none">${data.created_at} ago</span>
                </div>

                <div class="flex-shrink-0 h-10 w-10 rounded-full bg-gray-300 text-center pt-2">${data.author}</div>
            </div>
        `;
  } else if (data.type == "notif_game") {
    chatLogElement.innerHTML += '<p class="mt-2"> notification pour jouer!';
  }

  scrollToBottom();
}

function closeWebSocket() {
  if (chatSocket && chatSocket.readyState === WebSocket.OPEN) {
    chatSocket.close();
  }
}

function getCookie(name) {
  var cookieValue = null;

  if (document.cookie && document.cookie != "") {
    var cookies = document.cookie.split(";");

    for (var i = 0; i < cookies.length; i++) {
      var cookie = cookies[i].trim();

      if (cookie.substring(0, name.length + 1) === name + "=") {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));

        break;
      }
    }
  }

  return cookieValue;
}

function parseJSON(data) {
  return JSON.parse(data);
}
function iterateJSON(data) {
  data = parseJSON(data);
  
  //var now = new Date();
  //console.log("now",now.toISOString());

  chatLogElement.innerHTML = "";
  data.forEach((item) => {
    //const { message, author } = item.fields;
    console.log("Author:", item.fields.display_name);
    console.log("Message:", item.fields.message);
    console.log("------------------------------------");
    chatLogElement.innerHTML += `
      <div class="flex w-full mt-2 space-x-3 max-w-md ml-auto justify-end">
        <div>
          <div class="bg-blue-300 p-3 rounded-l-lg rounded-br-lg">
            <p class="text-sm">${item.fields.message}</p>
          </div>

          <span class="text-xs text-gray-500 leading-none">
            ${timesince(item.fields.timestamp)}
          </span>
        </div>

        <div class="flex-shrink-0 h-10 w-10 rounded-full bg-gray-300 text-center pt-2">
          ${item.fields.author}
        </div>
      </div>
    `;
  });
  //console.log(data);
}

function timesince(date) {
  var now = new Date();
  
  var date2 = new Date(date);
  var difference = now - date2;
  var seconds = Math.floor(difference / 1000);
  
  if (seconds < 60) {
      return seconds + ' secondes ago';
  } else if (seconds < 3600) {
      return Math.floor(seconds / 60) + ' minutes ago';
  } else if (seconds < 86400) {
      return Math.floor(seconds / 3600) + ' heures ago';
  } else {
      return Math.floor(seconds / 86400) + ' jours ago';
  }
}

async function getMessages(room) {
  const response = await fetch("/api/chat/get-messages/" + room + "/");
  const data = await response.json();
  console.log(data);
  iterateJSON(data);
}

async function joinChatRoom() {
  //closeWebSocket();
  if (chatSocket && chatSocket.readyState === WebSocket.OPEN) {
    chatSocket.close();
  }
  console.log("joinChatRoom");

  console.log("Room uuid:", chatRoomUuid);

  const data = new FormData();
  data.append("url", chatWindowUrl);

  chatSocket = new WebSocket(
    `ws://${window.location.host}/ws/${chatRoomUuid}/`
  );

  chatSocket.onmessage = function (e) {
    console.log("onMessage");

    onChatMessage(JSON.parse(e.data));
  };

  chatSocket.onopen = function (e) {
    console.log("onOpen - chat socket was opened");

    scrollToBottom();
  };

  chatSocket.onclose = function (e) {
    console.log("onClose - chat socket was closed");
  };

  console.log("hello hello hello");
  getMessages(chatRoomUuid);
}

chatInputElement.onkeyup = function (e) {
  if (e.keyCode == 13) {
    sendMessage();
  }
};

chatSubmitElement.onclick = function (e) {
  e.preventDefault();

  sendMessage();

  return false;
};

invitationgameElement.onclick = function (e) {
  e.preventDefault();

  chatSocket.send(JSON.stringify({
    'type': 'notification_game',
    message: 'une partie ping pong vous attends',
    author: current_user,
    
}))

  return false;
};
