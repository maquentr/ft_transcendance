import { startGaming } from "./PlayerVsBot.js";
import { start1v1CustomGame } from "./PVP_custom.js";
import { start1v1Game } from "./PVP_Classic.js";
import { start2v2CustomGame } from "./2vs2_Custom.js";
import { start2v2ClassicGame } from "./2vs2_Classic.js";
import { start4PlayerCustom } from "./4PlayerCustom.js";
import { start4PlayerClassic } from "./4PlayerClassic.js";
import { createButton, createMenu, createInput, createLabel } from "./utilsGame.js";


function preLobbyCustom(container, nbOfPlayers, team)
{
    let playerReady = [];
    const scoreLabel = createLabel('scoreToReach', 'Score needed to win');
    const scoreToReach = createInput('scoreToReach', 'number');
    const launchButton = createButton('launchButton', 'Start Game');

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
        launchButton.onclick = function()
        {
            if (nbOfPlayers === 2 && (playerReady[0] === true && playerReady[1] === true))
            {
                let goal;

                if (Number(scoreToReach.value) > 0)
                    goal = Number(scoreToReach.value);
                else
                    goal = 7;
               scoreLabel.remove();
               scoreToReach.remove();
               launchButton.remove();
               start1v1CustomGame(goal);
            }
            else if (nbOfPlayers === 4 && (playerReady[0] === true && playerReady[1] === true 
                    && playerReady[2] === true && playerReady[3] === true))
            {
                let goal;

                if (Number(scoreToReach.value) > 0)
                    goal = Number(scoreToReach.value);
                else
                    goal = 7;
               scoreLabel.remove();
               scoreToReach.remove();
               launchButton.remove();
               start4PlayerCustom(goal);
            }
        }
    }
}

function preLobbyClassic(container, nbOfPlayers, team)
{
    const scoreLabel = createLabel('scoreToReach', 'Score needed to win');
    const scoreToReach = createInput('scoreToReach', 'number');
    const launchButton = createButton('launchButton', 'Ready');
    
    scoreToReach.setAttribute('min', '2');
    scoreToReach.setAttribute('max', '20');
    scoreToReach.setAttribute('step', '1');
    scoreToReach.setAttribute('value', '5');
    
    container.appendChild(scoreLabel);
    container.appendChild(scoreToReach);
    container.appendChild(launchButton);
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
            launchButton.remove()
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