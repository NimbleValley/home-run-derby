const tl = new TimelineMax();

const homeScreenContainer = document.getElementById("home-screen-container");
const playScreenContainer = document.getElementById("play-screen-container");
const aboutScreenContainer = document.getElementById("about-screen-container");
homeScreenContainer.style.display = "flex";

const teamSelect = document.getElementById("team-select");
const stadiumSelect = document.getElementById("stadium-select");
const difficultySelect = document.getElementById("difficulty-select");
const handSelect = document.getElementById("hand-select");

async function toPlayScreen() {
    tl.fromTo(homeScreenContainer, 0.5, { scale: 1, opacity: 1 }, { scale: 0.5, opacity: 0 });
    tl.fromTo(playScreenContainer, 0.5, { scale: 0, opacity: 0.5, top: "50vh"}, { scale: 1, opacity: 1, top: 0});
    await sleep(500);
    homeScreenContainer.style.display = "none";
    playScreenContainer.style.display = "flex";
}

async function toHomeScreen() {
    tl.fromTo(aboutScreenContainer, 0.5, { scale: 1, opacity: 1 }, { scale: 0.5, opacity: 0 });
    tl.fromTo(homeScreenContainer, 0.5, { scale: 0, opacity: 0.5, top: "50vh"}, { scale: 1, opacity: 1, top: 0});
    await sleep(500);
    aboutScreenContainer.style.display = "none";
    homeScreenContainer.style.display = "flex";
}

async function toAboutScreen() {
    tl.fromTo(homeScreenContainer, 0.5, { scale: 1, opacity: 1 }, { scale: 0.5, opacity: 0 });
    tl.fromTo(aboutScreenContainer, 0.5, { scale: 0, opacity: 0.5, top: "50vh"}, { scale: 1, opacity: 1, top: 0});
    await sleep(500);
    homeScreenContainer.style.display = "none";
    aboutScreenContainer.style.display = "flex";
}

const sleep = (milliseconds) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
}

const names = `Angels
Astros
Athletics
Blue Jays
Braves
Brewers
Cardinals
Cubs
Diamondbacks
Dodgers
Giants
Guardians
Mariners
Marlins
Mets
Nationals
Orioles
Padres
Pirates
Phillies
Rangers
Rays
Reds
Red Sox
Rockies
Royals
Tigers
Twins
White Sox
Yankees`;

const teamNames = names.split("\n");

for(let i = 0; i < teamNames.length; i ++) {
    let tempOption = document.createElement("option");
    tempOption.value = i;
    tempOption.text = teamNames[i];
    teamSelect.appendChild(tempOption);
}

if(localStorage.getItem("team") != null && localStorage.getItem("team") != "") {
    teamSelect.value = localStorage.getItem("team");
}
localStorage.setItem("team", teamSelect.value);

teamSelect.addEventListener('change', function() {
    localStorage.setItem("team", teamSelect.value);
});

stadiumSelect.addEventListener('change', function() {
    localStorage.setItem("stadium", stadiumSelect.value);
});

difficultySelect.addEventListener('change', function() {
    localStorage.setItem("difficulty", difficultySelect.value);
});

if(localStorage.getItem("stadium") != null && localStorage.getItem("stadium") != "") {
    stadiumSelect.value = localStorage.getItem("stadium");
}

if(localStorage.getItem("difficulty") != null && localStorage.getItem("difficulty") != "") {
    difficultySelect.value = localStorage.getItem("difficulty");
}

if(localStorage.getItem("hand") != null && localStorage.getItem("hand") != "") {
    handSelect.value = localStorage.getItem("hand");
}
localStorage.setItem("hand", handSelect.value);

handSelect.addEventListener('change', function() {
    localStorage.setItem("hand", handSelect.value);
});