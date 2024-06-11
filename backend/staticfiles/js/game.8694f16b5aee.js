import { startGaming } from "./PlayerVsBot.js";
import { start1v1CustomGame } from "./PVP_custom.js";
import { start1v1Game } from "./PVP_Classic.js";
import { start2v2CustomGame } from "./2vs2_Custom.js";
import { start2v2ClassicGame } from "./2vs2_Classic.js";
import { start4PlayerCustom } from "./4PlayerCustom.js";
import { start4PlayerClassic } from "./4PlayerClassic.js";
import { createButton, createMenu, createInput, createLabel, createTextInputs2v2Cust, createTextInputs2v2Classic} from "./utilsGame.js";


function preLobbyCustom(container, nbOfPlayers, team)
{
    let playerReady = [];
    const scoreLabel = createLabel('scoreToReach', 'Score needed to win');
    const scoreToReach = createInput('scoreToReach', 'number');
    const launchButton = createButton('launchButton', 'Start Game');
    const textInputs4v4Cust = createTextInputs2v2Cust('p','4 PLAYERS INPUT  = Player 1 inputs : W-R / Player 2 : R-F / Player 3 : O-L / Player 4 : U-J');
    const textInputs2v2Cust = createTextInputs2v2Cust('p', '2 PLAYER INPUT = Player 1 : W-S / Player 2 : up arrow-down arrow ');

    scoreToReach.setAttribute('min', '2');
    scoreToReach.setAttribute('max', '20');
    scoreToReach.setAttribute('step', '1');
    scoreToReach.setAttribute('value', '5');
    
    if (team)
    {
        playerReady = createMenu(container, nbOfPlayers / 2);
        container.appendChild(scoreLabel);
        container.appendChild(scoreToReach);
        container.appendChild(launchButton);
        container.appendChild(textInputs4v4Cust);
        container.appendChild(textInputs2v2Cust);
        launchButton.onclick = function()
        {
            if (playerReady[0] === true && playerReady[1] === true)
            {
                let goal;

                if (Number(scoreToReach.value) > 0)
                    goal = Number(scoreToReach.value);
                else
                    goal = 7;
               scoreLabel.remove();
               scoreToReach.remove();
               launchButton.remove();
               textInputs2v2Cust.remove();
               textInputs4v4Cust.remove();
               start2v2CustomGame(goal);
            }
            else
                alert(playerReady[0] === true ? 'Team 2 not ready' : 'Team 1 not ready');
        }
    }
    else
    {
        playerReady = createMenu(container, nbOfPlayers);
        container.appendChild(scoreLabel);
        container.appendChild(scoreToReach);
        container.appendChild(launchButton);
        container.appendChild(textInputs4v4Cust);
        container.appendChild(textInputs2v2Cust); //same menu for 1v1 custom and 4pCustom ? so this text must not be shown ? 
        launchButton.onclick = function()
        {
            if (nbOfPlayers === 2)
            {
                if (playerReady[0] === true && playerReady[1] === true)
                {
                    let goal;

                    if (Number(scoreToReach.value) > 0)
                        goal = Number(scoreToReach.value);
                    else
                        goal = 7;
                    scoreLabel.remove();
                    scoreToReach.remove();
                    launchButton.remove();
                    textInputs2v2Cust.remove();
                    textInputs4v4Cust.remove();

                    start1v1CustomGame(goal);
                }
                else 
                {
                    alert('Player is not ready, pls click on ready');
                }
            }
            else if (nbOfPlayers === 4)
            {
                if(playerReady[0] === true && playerReady[1] === true 
                    && playerReady[2] === true && playerReady[3] === true)
                {
                    let goal;

                    if (Number(scoreToReach.value) > 0)
                        goal = Number(scoreToReach.value);
                    else
                        goal = 7;
                    scoreLabel.remove();
                    scoreToReach.remove();
                    launchButton.remove();
                    textInputs2v2Cust.remove();
                    textInputs4v4Cust.remove();
                    start4PlayerCustom(goal);
                    // enlever decrease ennemy paddle 
                }
                else
                {
                    alert('Some player are not ready, pls click on ready');
                }
            }
        }
    }
}

function preLobbyClassic(container, nbOfPlayers, team)
{
    const scoreLabel = createLabel('scoreToReach', 'Score needed to win');
    const scoreToReach = createInput('scoreToReach', 'number');
    const launchButton = createButton('launchButton', 'Ready');
    const textInputs2v2Classic = createTextInputs2v2Classic('p','2 PLAYER INPUT = Player 1 : W-S / Player 2 : up arrow-down arrow ');
    const textInputs4v4Classic = createTextInputs2v2Classic('p','4 PLAYERS INPUT  = Player 1 inputs : W-R / Player 2 : R-F / Player 3 : O-L / Player 4 : U-J');

    
    scoreToReach.setAttribute('min', '2');
    scoreToReach.setAttribute('max', '20');
    scoreToReach.setAttribute('step', '1');
    scoreToReach.setAttribute('value', '5');
    
    container.appendChild(scoreLabel);
    container.appendChild(scoreToReach);
    container.appendChild(launchButton);
    container.appendChild(textInputs2v2Classic); //same question as previous
    container.appendChild(textInputs4v4Classic); //same question as previous
    if (nbOfPlayers == 4 && team == false)
    {
        launchButton.onclick = function()
        {
            let goal;
            scoreLabel.remove();
            
            if (Number(scoreToReach.value) > 0)
                goal = Number(scoreToReach.value);
            else
                goal = 7;
            scoreToReach.remove()
            launchButton.remove()
            textInputs2v2Classic.remove();
            textInputs4v4Classic.remove();
            start4PlayerClassic(goal);
        }
    }
    else if (nbOfPlayers == 2)
    {
        launchButton.onclick = function()
        {
            let goal;
            scoreLabel.remove();
            
            if (Number(scoreToReach.value) > 0)
                goal = Number(scoreToReach.value);
            else
                goal = 7;
            scoreToReach.remove()
            launchButton.remove()
            textInputs2v2Classic.remove();
            textInputs4v4Classic.remove();

            start1v1Game(goal);
        }
    }
    else
    {
        launchButton.onclick = function()
        {
            let goal;
            scoreLabel.remove();
            
            if (Number(scoreToReach.value) > 0)
                goal = Number(scoreToReach.value);
            else
                goal = 7;
            scoreToReach.remove()
            textInputs4v4Classic.remove();
            launchButton.remove()
            textInputs2v2Classic.remove();

            start2v2ClassicGame(goal);
        }
    }
}

function chooseMode(container, nbPlayer, team)
{
    if (nbPlayer == 2)
    {
        const aiButton = createButton('ai', 'AI VS You');
        aiButton.classList.add("btn", "btn-primary", "mb-2");
        const classic = createButton('1v1Classic', 'Classic 1 vs 1');
        classic.classList.add("btn", "btn-secondary", "mb-2");
        const custom = createButton('1v1custom', 'Custom 1 vs 1');
        custom.classList.add("btn", "btn-secondary");
        custom.onclick = function()
        {
            aiButton.remove();
            classic.remove();
            custom.remove();
            preLobbyCustom(container, nbPlayer, false);
        }
        classic.onclick = function()
        {
            aiButton.remove();
            classic.remove();
            custom.remove();
            preLobbyClassic(container, nbPlayer, false);
        }
        aiButton.onclick = function()
        {
            aiButton.remove();
            classic.remove();
            custom.remove()
            startGaming();
        }
        // Créez un groupe de boutons verticaux
       const buttonGroup = document.createElement('div');
        buttonGroup.classList.add('btn-group-vertical');
        buttonGroup.appendChild(aiButton);
        buttonGroup.appendChild(classic);
        buttonGroup.appendChild(custom);
        // Ajoutez le groupe de boutons au conteneur
        container.appendChild(buttonGroup); 
   
    }
    else if (nbPlayer == 4)
    {
        if (team)
        {
            const classic = createButton('classic', 'Classic 2 vs 2');
            classic.classList.add("btn", "btn-secondary", "mb-2");
            const custom = createButton('custom', 'Custom 2 vs 2');
            custom.classList.add("btn", "btn-secondary");
            classic.onclick = function()
            {
                custom.remove();
                classic.remove();
                preLobbyClassic(container, nbPlayer, true);
            }
            custom.onclick = function()
            {
                custom.remove();
                classic.remove();
                preLobbyCustom(container, nbPlayer, true);
            }
            // Créez un groupe de boutons verticaux
            const buttonGroup = document.createElement('div');
            buttonGroup.classList.add('btn-group-vertical');
            buttonGroup.appendChild(classic);
            buttonGroup.appendChild(custom);
        
            // Ajoutez le groupe de boutons au conteneur
            container.appendChild(buttonGroup);
        }
        else
        {
            const classic = createButton('classic', 'Classic 1v1v1v1');
            classic.classList.add("btn", "btn-secondary", "mb-2");
            const custom = createButton('custom', 'custom 1v1v1v1');
            custom.classList.add("btn", "btn-secondary");
            classic.onclick = function()
            {
                custom.remove();
                classic.remove();
                preLobbyClassic(container, nbPlayer, false);
            }
            custom.onclick = function()
            {
                classic.remove();
                custom.remove();
                preLobbyCustom(container, nbPlayer, false);
            }
            // Créez un groupe de boutons verticaux
            const buttonGroup = document.createElement('div');
            buttonGroup.classList.add('btn-group-vertical');
            buttonGroup.appendChild(classic);
            buttonGroup.appendChild(custom);
    
            // Ajoutez le groupe de boutons au conteneur
            container.appendChild(buttonGroup);
        }
    }
}

/*
** Function to get how many player will play. Call function choose Mode 
**  to get more details.
*/

function chooseNbPlayer()
{
    let nbPlayer = 0;
    const container = document.getElementById("container");

    const pvpButton = createButton('1v1', '1 VS 1');
    pvpButton.classList.add("btn", "btn-primary", "mb-2");
    const teamButton = createButton('2v2', '2 VS 2');
    teamButton.classList.add("btn", "btn-secondary", "mb-2");
    const multiPlayerButton = createButton('1v1v1v1', '1 VS 1 VS 1 VS 1');
    multiPlayerButton.classList.add("btn", "btn-secondary");


    pvpButton.onclick = function()
    {
        nbPlayer = 2;
        teamButton.remove();
        multiPlayerButton.remove();
        pvpButton.remove();
        chooseMode(container, nbPlayer, false);
    }
    teamButton.onclick = function()
    {
        nbPlayer = 4;
        pvpButton.remove();
        teamButton.remove();
        multiPlayerButton.remove();
        chooseMode(container, nbPlayer, true);
    }
    multiPlayerButton.onclick = function()
    {
        nbPlayer = 4;
        pvpButton.remove();
        teamButton.remove();
        multiPlayerButton.remove();
        chooseMode(container, nbPlayer, false);
    }
    // Ajoutez les boutons dans une div avec la classe "btn-group-vertical"
    const buttonGroup = document.createElement('div');
    buttonGroup.classList.add('btn-group-vertical');
    buttonGroup.appendChild(pvpButton);
    buttonGroup.appendChild(teamButton);
    buttonGroup.appendChild(multiPlayerButton);

    container.appendChild(buttonGroup);
}


function gamePageContent() {
    chooseNbPlayer()
}

gamePageContent();