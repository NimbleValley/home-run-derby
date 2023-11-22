var tl = new TimelineMax();

const loadingPanel = document.getElementById("loading-panel");

const outCountText = document.getElementById("out-count");
const homerunCount = document.getElementById("homerun-count");
const exitVelocityText = document.getElementById("exit-velocity");
const launchAngleText = document.getElementById("launch-angle");

const homerunContainer = document.getElementById("homerun-container");
const homerunText = document.getElementById("homerun-text");

const root = document.querySelector(':root');

const homerunTotalText = document.getElementById("homerun-total-text");
const gameOverContainer = document.getElementById("game-over-container");
gameOverContainer.style.display = "none";
const clickToBegin = document.getElementById("click-to-begin");
clickToBegin.style.display = "none";

var outCount = 0;
var hrCount = 0;
var fireworksOn = false;
var canvasFire;

const primaryColors = [
    "#ba0021",
    "#eb6e1f",
    "#003831",
    "#134a8e",
    "#ce1141",
    "#12284B",
    "#C41E3A",
    "#0E3386",
    "#A71930",
    "#005A9C",
    "#00385D",
    "#E50022",
    "#0C2C56",
    "#00A3E0",
    "#002D72",
    "#AB0003",
    "#DF4601",
    "#FFC425",
    "#FDB827",
    "#E81828",
    "#C0111F",
    "#092C5C",
    "#8FBCE6",
    "#BD3039",
    "#33006f",
    "#004687",
    "#BD9B60",
    "#002B5C",
    "#27251F",
    "#0C2340"
]

const secondaryColors = [
    "#003263",
    "#002d62",
    "#efb21e",
    "#e8291c",
    "#13274f",
    "#FFC52F",
    "#0C2340",
    "#CC3433",
    "#E3D4AD",
    "#EF3E42",
    "#27251F",
    "#E50022",
    "#005C5C",
    "#EF3340",
    "#FF5910",
    "#14225A",
    "#000000",
    "#2F241D",
    "#27251F",
    "#002D72",
    "#003278",
    "#8FBCE6",
    "#000000",
    "#0C2340",
    "#C4CED4",
    "#BD9B60",
    "#FA4616",
    "#D31145",
    "#C4CED4",
    "#C4CED3"
]

var teamTheme = "0";

if(localStorage.getItem("team") != null && localStorage.getItem("team") != "") {
    teamTheme = localStorage.getItem("team");
}

homerunContainer.style.backgroundColor = primaryColors[parseInt(teamTheme)];
homerunText.style.color = secondaryColors[parseInt(teamTheme)];
root.style.setProperty("--secondary-color", secondaryColors[parseInt(teamTheme)]);

async function updateOutCount() {
    tl.fromTo(outCountText, 0.25, { scale: 1, opacity: 1 }, { scale: 0.5, opacity: 0 });
    tl.fromTo(outCountText, 0.25, { scale: 0.5, opacity: 0 }, { scale: 1, opacity: 1 });
    await sleep(250);
    outCountText.innerText = `Outs: ${outCount}`;
}

async function updateHomerunCount() {
    homerunContainer.style.display = "flex";
    //tl.fromTo(homerunCount, 0.25, { scale: 1, opacity: 1 }, { scale: 0.5, opacity: 0 });
    //tl.fromTo(homerunCount, 0.25, { scale: 0.5, opacity: 0 }, { scale: 1, opacity: 1 });
    for(let i = 0; i < 3; i ++)
        tl.fromTo(homerunText, 1.25, { scale: 0.85, opacity: 1 }, { scale: 1.5, opacity: 0.0 }, "+=0.0");
    await sleep(250);
    homerunCount.innerText = `HR: ${hrCount}`;
}

async function updateHitMetrics(exit, angle) {
    await sleep(100);

    tl.fromTo(exitVelocityText, 0.25, { opacity: 1 }, { opacity: 0 });
    tl.fromTo(launchAngleText, 0.25, { opacity: 1 }, { opacity: 0 }, "-=0.25");
    tl.fromTo(exitVelocityText, 0.25, { opacity: 0 }, { opacity: 1 });
    tl.fromTo(launchAngleText, 0.25, { opacity: 0 }, { opacity: 1 }, "-=0.25");

    await sleep(250);

    exitVelocityText.innerText = `${exit} mph`;
    launchAngleText.innerText = `${angle}°`;

    if (exit > 100) {
        exitVelocityText.style.color = "#fcba03";
    } else {
        exitVelocityText.style.color = "white";
    }
}

const sleep = (milliseconds) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
}