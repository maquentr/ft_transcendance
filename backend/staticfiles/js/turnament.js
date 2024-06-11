import { createButton, createInput, createLabel, formatDate, quitGame } from "./utilsGame.js";
import { startTournamentGame } from "./tournamentGame.js";

async function verifyUser(username, password) {
    const response = await fetch('/verify-user/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken'),
        },
        body: JSON.stringify({ username, password })
    });
    const result = await response.json();
    return result.exists ? result.display_name : null;
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
    nextMatch.innerText = `Match 1 : ${games[0].player1} vs ${games[0].player2} \nClick on buttton when ready`;
    let jsonString = '';

    const button = createButtonBis();
    button.addEventListener('click', async function () {
        if (currentGameIndex < games.length) {
            const game = games[currentGameIndex];
            
            button.style.display = 'none';
            nextMatch.style.display = 'none';
            
            const result = await startTournamentGame(game.player1, game.player2);
            winner.push(result);
            let str;
            if (result == game.player1)
            {
                str = `${game.player1}:W|${game.player2}:L`;
            }
            else
                str = `${game.player1}:L|${game.player2}:W`;
            jsonString += str + ';';
            currentGameIndex++;
            if (currentGameIndex < games.length) 
            {
                // Send notif to player 2 and player 3
                nextMatch.innerText = `Match ${currentGameIndex + 1} : ${games[currentGameIndex].player1} vs ${games[currentGameIndex].player2}`;
                button.innerText = `Start match ${currentGameIndex + 1}`;
                button.style.display = 'block';
                nextMatch.style.display = 'block';
            }
            else
            {
                nextMatch.innerText = `Final Match : ${winner[0]} vs ${winner[1]}`;
                button.innerText = 'Start FINALE';
                button.style.display = 'block';
                nextMatch.style.display = 'block';
            }
        }
        else if (currentGameIndex == games.length)
        {
            button.remove();
            nextMatch.style.display = 'none';
            let finalRes = await startTournamentGame(winner[0], winner[1]);
            nextMatch.innerText = `Congradulation ${finalRes} you win the Tournament`;
            let str;
            if (finalRes == winner[0])
                str = `${winner[0]}:W|${winner[1]}:L`;
            else
                str =`${winner[0]}:L|${winner[1]}:W`;
            jsonString += str;
            nextMatch.style.display = 'block';
            quitGame('callback-tournament', jsonString);
        }
    });
}

function start() {
    let container = document.getElementById('invTurn');
    let lab = createLabel('invUser', 'Enter display Name of the user to invite');
    let inp = createInput('invUser', 'text');
    let pwd = createInput('invPwd', 'password');
    let btn = createButton('submit', 'Invite');
    let alias = [];

    lab.style.color = '#ffffff';

    btn.onclick = async function () {
        if (alias.length >= 4) {
            alert('Maximum player invite, wait for refus');
        } else if (userAlreadyInvit(inp.value, alias)) {
            alert('Invite already sent, focus please');
        } else {
            const displayName = await verifyUser(inp.value, pwd.value);
            if (displayName) {
                alias.push(displayName);
                console.log('push : ', displayName);
                if (alias.length == 4) {
                    let startBtn = createButton('launch', 'LaunchTurnament');
                    startBtn.onclick = function () {
                        lab.remove();
                        inp.remove();
                        pwd.remove();
                        btn.remove();
                        startBtn.remove();
                        startMultipleGames(alias);
                    };
                    container.appendChild(startBtn);
                }
            } else {
                alert('User does not exist or incorrect password');
            }
        }
    };

    container.appendChild(lab);
    container.appendChild(inp);
    container.appendChild(pwd);
    container.appendChild(btn);
}

function userAlreadyInvit(inp, alias) {
    for (let i = 0; i < alias.length; i++) {
        if (inp == alias[i])
            return true;
    }
    return false;
}

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

start();