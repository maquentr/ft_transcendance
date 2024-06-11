import { createButton, createInput, createLabel, formatDate, quitGame } from "./utilsGame.js";
import { startTournamentGame } from "./turnamentGame.js";

const userElement = document.getElementById("user_id");
const current_user = JSON.parse(userElement.textContent);

function getRoomName(user1, user2) {
    return [user1, user2].sort().join("_");
}

function sendTournamentNotification(player1, player2) {
    const chatRoom1 = getRoomName(current_user, player1);
    const chatRoom2 = getRoomName(current_user, player2);

    const notificationMessage = {
        'type': 'notification_game',
        message: 'Vous êtes attendu en tournoi',
        author: current_user,
    };

    // Envoyer la notification dans le chat de player1
    const chatSocket1 = new WebSocket(`ws://${window.location.hostname}:8000/ws/${chatRoom1}/`);
    chatSocket1.onopen = function() {
        chatSocket1.send(JSON.stringify(notificationMessage));
        chatSocket1.close();
    };

    // Envoyer la notification dans le chat de player2
    const chatSocket2 = new WebSocket(`ws://${window.location.hostname}:8000/ws/${chatRoom2}/`);
    chatSocket2.onopen = function() {
        chatSocket2.send(JSON.stringify(notificationMessage));
        chatSocket2.close();
    };
}

// Fonction pour obtenir le token CSRF
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

const csrftoken = getCookie('csrftoken');

// Fonction pour vérifier l'utilisateur
async function verifyUser(username, password) {
    const response = await fetch('/verify-user/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrftoken
        },
        body: JSON.stringify({ username, password }),
    });

    const result = await response.json();
    console.log('verifyUser result:', result);
    return result;
}

function checkUserAcceptInvit(alias) {
    console.log('Empty');
}

function createButtonBis() {
    const button = document.createElement('button');
    button.innerText = 'Start Game';
    button.id = 'startGame';
    document.body.appendChild(button);
    return button;
}

async function startMultipleGames(alias) {
    const date = formatDate();
    let winner = [];
    const games = [
        { player1: alias[0], player2: alias[1] },
        { player1: alias[2], player2: alias[3] },
    ];

    let currentGameIndex = 0;

    let nextMatch = document.createElement('p');
    nextMatch.style.display = 'block';
    document.body.appendChild(nextMatch);
    nextMatch.innerText = `Match 1 : ${games[0].player1} vs ${games[0].player2} \nClick on button when ready`;
    let jsonString = '';

    const button = createButtonBis();
    button.addEventListener('click', async function () {
        if (currentGameIndex < games.length) {
            const game = games[currentGameIndex];

            button.style.display = 'none';
            nextMatch.style.display = 'none';

            // Envoyer la notification de tournoi player1 player2
            sendTournamentNotification(game.player1, game.player2);

            const result = await startTournamentGame(game.player1, game.player2);
            console.log(`Game result: ${result}`);
            winner.push(result);
            let str;
            if (result === game.player1) {
                str = `${game.player1}:W|${game.player2}:L`;
            } else {
                str = `${game.player1}:L|${game.player2}:W`;
            }
            jsonString += str + ';';
            currentGameIndex++;

            if (currentGameIndex < games.length) {
                // Send notification to next match players
                sendTournamentNotification(games[currentGameIndex].player1, games[currentGameIndex].player2);
                nextMatch.innerText = `Match ${currentGameIndex + 1} : ${games[currentGameIndex].player1} vs ${games[currentGameIndex].player2}`;
                button.innerText = `Start match ${currentGameIndex + 1}`;
                button.style.display = 'block';
                nextMatch.style.display = 'block';
            } else {
                nextMatch.innerText = `Final Match : ${winner[0]} vs ${winner[1]}`;
                button.innerText = 'Start FINALE';
                button.style.display = 'block';
                nextMatch.style.display = 'block';
            }
        } else if (currentGameIndex === games.length) {
            button.remove();
            nextMatch.style.display = 'none';

            // Envoyer la notification de tournoi
            sendTournamentNotification(winner[0], winner[1]);

            let finalRes = await startTournamentGame(winner[0], winner[1]);
            console.log(`Final game result: ${finalRes}`);
            nextMatch.innerText = `Congratulations ${finalRes}, you win the Tournament`;
            let str;
            if (finalRes === winner[0]) {
                str = `${winner[0]}:W|${winner[1]}:L`;
            } else {
                str = `${winner[0]}:L|${winner[1]}:W`;
            }
            jsonString += str;
            nextMatch.style.display = 'block';
            quitGame('callback-tournament', jsonString);
        }
    });
}

function start() {
    let container = document.getElementById('invTurn');
    let lab = createLabel('invUser', 'Enter display Name and Password of the user to invite');
    let inpUsername = createInput('invUsername', 'text');
    let inpPassword = createInput('invPassword', 'password');
    let btn = createButton('submit', 'Invite');
    let alias = [];

    lab.style.color = '#ffffff';

    // Ajouter l'utilisateur actuel au tournoi
    alias.push(CURRENT_USER_DISPLAY_NAME);

    btn.onclick = async function () {
        if (alias.length >= 4) {
            alert('Maximum player invite, wait for refus');
        } else {
            const username = inpUsername.value;
            const password = inpPassword.value;

            const result = await verifyUser(username, password);
            if (result.success) {
                if (userAlreadyInvit(result.display_name, alias)) {
                    alert('Invite already sent, please focus');
                } else {
                    alias.push(result.display_name);
                    alert(`User ${result.display_name} added to the tournament.`);
                }
            } else {
                alert(result.error || 'User does not exist or wrong password.');
            }

            if (alias.length == 4) {
                alert('Participants: ' + alias.join(', '));
                let startBtn = createButton('launch', 'Launch Tournament');
                startBtn.onclick = function () {
                    lab.remove();
                    inpUsername.remove();
                    inpPassword.remove();
                    btn.remove();
                    startBtn.remove();
                    startMultipleGames(alias);
                }
                container.appendChild(startBtn);
            }
        }
    }

    container.appendChild(lab);
    container.appendChild(inpUsername);
    container.appendChild(inpPassword);
    container.appendChild(btn);
    checkUserAcceptInvit(alias);
}

function userAlreadyInvit(inp, alias) {
    for (let i = 0; i < alias.length; i++) {
        if (inp == alias[i])
            return true;
    }
    return false;
}

start();
