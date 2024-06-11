import { start1v1Game } from "./PVP_Classic.js";

document.addEventListener("DOMContentLoaded", function() {
    const urlParams = new URLSearchParams(window.location.search);
    const player1 = urlParams.get('player1');
    const player2 = urlParams.get('player2');

    if (player1 && player2) {
        start1v1Game('5', player1, player2);  // Démarrer le jeu avec les deux utilisateurs
    } else {
        showLoginForm();  // Afficher le formulaire de connexion si les paramètres ne sont pas présents
    }
});

function showLoginForm() {
    let container = document.getElementById('invTurn');
    let lab = createLabel('invUser', 'Enter display Name of the user to invite');
    let inp = createInput('invUser', 'text');
    let passwordLab = createLabel('invPassword', 'Enter the password');
    let passwordInp = createInput('invPassword', 'password');
    let btn = createButton('submit', 'Invite');

    lab.style.color = '#ffffff';
    passwordLab.style.color = '#ffffff';

    let notificationDisplayed = false;

    btn.onclick = function() {
        let username = inp.value;
        let password = passwordInp.value;

        console.log(`Sending username: ${username}, password: ${password}`);

        fetch('/verify-user/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCSRFToken(),
            },
            body: JSON.stringify({ username: username, password: password })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                if (!notificationDisplayed) {
                    displayNotification('User connected successfully');
                    notificationDisplayed = true;
                }
                hideForm();
                start1v1Game('5', CURRENT_USER_DISPLAY_NAME, data.display_name);  // Pour le jeu en ligne
            } else {
                if (!notificationDisplayed) {
                    displayNotification('Invalid username or password');
                    notificationDisplayed = true;
                }
                console.error('Server response:', data);
            }
        })
        .catch(error => console.error('Error:', error));
    };

    container.appendChild(lab);
    container.appendChild(inp);
    container.appendChild(passwordLab);
    container.appendChild(passwordInp);
    container.appendChild(btn);
}

function getCSRFToken() {
    let csrfToken = null;
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'csrftoken') {
            csrfToken = value;
            break;
        }
    }
    return csrfToken;
}

function createLabel(forAttribute, textContent) {
    let label = document.createElement('label');
    label.setAttribute('for', forAttribute);
    label.textContent = textContent;
    return label;
}

function createInput(id, type) {
    let input = document.createElement('input');
    input.setAttribute('id', id);
    input.setAttribute('type', type);
    return input;
}

function createButton(id, textContent) {
    let button = document.createElement('button');
    button.setAttribute('id', id);
    button.textContent = textContent;
    return button;
}

function displayNotification(message) {
    alert(message);
}

function hideForm() {
    document.getElementById('invTurn').style.display = 'none';
}

