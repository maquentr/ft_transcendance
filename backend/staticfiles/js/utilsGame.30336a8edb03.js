const selectValue = ['BigPaddle', 'SmallPaddle', 'DoublePts', 'FastPaddle'];

const selectOptions =   ['Increase your paddle size by 25%',
                        'Decrease ennemy paddle size by 25%',
                        'Your next score count double points',
                        'Increase paddle Movement speed'];

/*
**  Fucntion part
*/

function createLabel(id, text)
{
    const label = document.createElement('label');
    label.setAttribute('for', id);
    label.style.color = '#FFFFFF';
    label.textContent = text;

    return (label);
}

function createTextInputs2v2Cust(id, text)
{
    const label = document.createElement('p');
    // label.setAttribute('for', id);
    label.style.color = 'RED';
    label.textContent = text;

    return (label);
}

function createTextInputs2v2Classic(id, text)
{
    const label = document.createElement('p');
    // label.setAttribute('for', id);
    label.style.color = 'RED';
    label.textContent = text;

    return (label);
}

function createInput(id, type)
{
    const newInput = document.createElement('input');
    newInput.setAttribute('type', type);
    newInput.setAttribute('id', id);

    return (newInput);
}

function createSelect(id, nbMenu)
{
    const newSelect = document.createElement('select');
    newSelect.setAttribute('id', id);

    
    for (let i = 0; i < 4; i++)
    {
        if (i === 1 && nbMenu === 4)
            continue;
        const newOption = document.createElement('option');
        newOption.setAttribute('value', selectValue[i]);
        newOption.textContent = selectOptions[i];
        newSelect.appendChild(newOption);
    }
    return (newSelect);
}

function createButton(id, text)
{
    const newButton = document.createElement('button');
    newButton.setAttribute('id', id);
    newButton.textContent = text;

    return (newButton);
}

function    createBallMenu()
{
    const ballMenu = document.createElement('div');
    ballMenu.setAttribute('id', 'ballMenu');

    const labelColorBall = createLabel('ballColor', 'Choose the color of the Ball');
    const inputColorBall = createInput('ballColor', 'color');
    inputColorBall.setAttribute('value', '#ffffff');

    ballMenu.appendChild(labelColorBall);
    ballMenu.appendChild(inputColorBall);
    
    return (ballMenu);
}

function initPlayerReady(playerReady, nbPlayer)
{
    for (let i = 0; i < nbPlayer; i++)
    {
        playerReady[i] = false;
    }
}

function    createMenu(container, nbOfMenus)
{
    container.innerHTML = '';
    let playerReady = new Array(nbOfMenus);

    initPlayerReady(playerReady, nbOfMenus);
    for (let i = 1; i <= nbOfMenus; i++)
    {
        const divMenu =  document.createElement('div');
        divMenu.setAttribute('id', `menuP${i}`);

        const labelColor = createLabel(`paddleColorP${i}`, "Color for your Paddle");
        const inputColor = createInput(`paddleColorP${i}`, 'color');

        const labelPow = createLabel(`powerUpP${i}`, 'Choose Power Up you want to Use');
        const selectPow = createSelect(`powerUpP${i}`, nbOfMenus);
        const buttonReady = createButton(`P${i}Ready`, 'Ready');
        buttonReady.onclick = function()
        {
            if (playerReady[i - 1])
                playerReady[i - 1] = false;
            else
                playerReady[i - 1] = true;
        }
        divMenu.appendChild(labelColor);
        divMenu.appendChild(inputColor);
        divMenu.appendChild(labelPow);
        divMenu.appendChild(selectPow);
        divMenu.appendChild(buttonReady);
        container.appendChild(divMenu);
    }

    const ballMenu = createBallMenu();
    container.appendChild(ballMenu);
    return (playerReady);
}

function formatDate()
{
    let d = new Date(),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

    return [year, month, day].join('-');
}

function quitGame(urlCallBack, resultStr) {
    let str = formatDate() + ';' + resultStr;
    let button = createButton('quit', 'End Match');
    document.body.appendChild(button);

    button.onclick = function() {
        console.log('str return : ', str);
        // Ajoutez `str` en tant que paramètre de requête dans l'URL
        let callbackUrlWithParams = `${urlCallBack}?data=${encodeURIComponent(str)}`;
        window.location.href = callbackUrlWithParams;
    }
}


export {createMenu, createButton, createInput, createLabel, formatDate, quitGame, createTextInputs2v2Classic, createTextInputs2v2Cust};
