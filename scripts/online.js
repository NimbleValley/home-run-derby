const playerLobbyContainer = document.getElementById("player-lobby-container");

var playerId;
var playerRef;
var players = {};
var playerElements = {};

var playersInMainLobby = [];
var playersInMyLobby = {};

var team = localStorage.getItem("team");
while (team == null) {
    team = 5;
}

var name = localStorage.getItem("name");
while (name == null) {
    //prompt("What would you like to be know as?")
    name = "Test";
}

firebase.auth().onAuthStateChanged((user) => {
    console.log(user.uid);
    if (user) {
        console.warn("User logged in");

        playerId = user.uid;
        playerRef = firebase.database().ref(`players/${playerId}`);

        playerRef.set({
            id: playerId,
            name: name,
            team: team,
            lobby: -1,
            homeruns: 0,
            wait: 0
        });

        playerRef.onDisconnect().remove();

        initGame();
    } else {
        console.warn("User logged out");
    }
});

firebase.auth().signInAnonymously().catch((error) => {
    var errorCode = error.code;
    var errorMessage = error.message;
    console.error(errorCode, errorMessage);
});

function initGame() {
    const allPlayersRef = firebase.database().ref(`players`);

    allPlayersRef.on("value", (snapshot) => {
        playersInMainLobby = [];
        players = snapshot.val() || {};
        Object.keys(players).forEach((key) => {
            const characterState = players[key];
            let el = playerElements[key];
            // Now update the DOM
            el.querySelector(".player-lobby-name").innerText = characterState.name;

            if (parseInt(characterState.lobby) == -1) {
                // If lobby is -1, they are waiting for game
                el.querySelector(".player-lobby-text").innerText = "In lobby";
                el.querySelector(".player-lobby-text").style.backgroundColor = "rgba(24, 180, 32, 0.384)";
                playersInMainLobby.push(characterState);
            } else {
                // If lobby is not -1, they are in game
                el.querySelector(".player-lobby-text").innerText = "In game";
                el.querySelector(".player-lobby-text").style.backgroundColor = "rgba(180, 24, 24, 0.384)";
            }
            // If player has same lobby as me, add them to my lobby
            if(parseInt(characterState.lobby) == players[playerId].lobby) {
                playersInMyLobby[characterState.id] = (characterState);
            }
        });
        console.log(playersInMyLobby);

        // If two or more players are in main lobby, start a game
        if (playersInMainLobby.length >= 2) {
            players[playerId].lobby = Object.keys(players).length;
            console.warn("Created lobby " + players[playerId].lobby);
            playerRef.set(players[playerId]);
        }
    });
    allPlayersRef.on("child_added", (snapshot) => {
        const addedPlayer = snapshot.val();
        console.log(addedPlayer);

        let tempElement = document.createElement("div");
        tempElement.className = "player-element";

        let tempName = document.createElement("h2");
        tempName.className = "player-lobby-name";
        tempName.innerText = addedPlayer.name;

        let tempLobby = document.createElement("h2");
        tempLobby.className = "player-lobby-text";
        tempLobby.innerText = "In game";
        tempLobby.style.backgroundColor = "rgba(180, 24, 24, 0.384)";
        if (parseInt(addedPlayer.lobby) == -1) {
            tempLobby.innerText = "In lobby";
            tempLobby.style.backgroundColor = "rgba(24, 180, 32, 0.384)";
        }

        tempElement.appendChild(tempName);
        tempElement.appendChild(tempLobby);

        playerElements[addedPlayer.id] = tempElement;
        playerLobbyContainer.appendChild(tempElement);
    });
}

document.addEventListener('keypress', function () {
    players[playerId].lobby = 5;
    playerRef.set(players[playerId]);
});