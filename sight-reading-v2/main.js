onload = () => main();

let canvas;
let ctx;
let cWidth;
let cHalfWidth;
let cHeight;
let cHalfHeight;

let fillColor = "rgba(192, 187, 207, 1)";
let ledgerHeight = 40;

let noteMap = new Map();
let currentNoteIndex;

let practiceButton;
let practiceStarted = false;

let sessionDiv;
let sessionForm;
let sessionInput;

let resultDiv;
let correctAnswers = 0;
let incorrectAnswers = 0;
let correctAnswerSpan;
let incorrectAnswerSpan;

// debug variable
// let boxExists = true;
function main() {
    practiceButton = document.getElementById("practice");
    practiceButton.innerHTML = "Start Practice";

    sessionDiv = document.getElementById("session");
    sessionDiv.style.display = "none";
    sessionForm = document.getElementById("session-form");
    sessionInput = document.getElementById("num-input");
    sessionInput.addEventListener("keyup", checkNote);

    resultDiv = document.getElementById("results");
    resultDiv.style.display = "none";
    correctAnswerSpan = document.getElementById("correct-ans");
    incorrectAnswerSpan = document.getElementById("incorrect-ans");

    canvas = document.getElementById("canvas");

    cWidth = canvas.width;
    cHeight = canvas.height;
    cHalfWidth = cWidth / 2;
    cHalfHeight = cHeight / 2;

    ctx = canvas.getContext("2d");
    
    ctx.fillStyle = fillColor;
    ctx.fillRect(0, 0, cWidth, cHeight);
    addStaves(true);
    populateNoteMap(true);

    // don't worry about this for now ooffff
    // const trebleImg = new Image();
    // trebleImg.onload = () => {
    //     ctx.drawImage(img, 12, cHalfHeight + 80);
    // }
    // trebleImg.src = "https://en.wikipedia.org/wiki/File:Treble_clef.svg";
}

function makeBox() {
    if (boxExists) {
        boxExists = false;
        ctx.clearRect(0, 0, cWidth, cHeight);
    } else {
        boxExists = true;

        ctx.fillStyle = fillColor;
        ctx.fillRect(0, 0, cWidth, cHeight);
    }
    
}

function resetBox() {
    boxExists = false;
    ctx.clearRect(0, 0, cWidth, cHeight);

    boxExists = true;
    ctx.fillStyle = fillColor;
    ctx.fillRect(0, 0, cWidth, cHeight);
}

function addStaves() {
    resetBox();
    ctx.fillStyle = "black";
    for (let i = -2; i < 3; i++) {
        let height = i * 40 - 1;
        ctx.fillRect(10, cHalfHeight + height, cWidth - 20, 2);
    }
}

function populateNoteMap(isTreble) {
    if (isTreble) {
        let noteList = ["B", "C", "D", "E", "F", "G", "A"];
        for (let i = -11; i < 12; i++) {
            let index = 0;
            if (i < 0) {
                index = (noteList.length - ((i * -1) % noteList.length)) % noteList.length;
            } else {
                index = i % noteList.length;
            }
            noteMap.set(i, noteList[index])
        }
    }
}

function generateRandomNote() {
    resetBox();
    addStaves();
    let randIndex = getRandomInt(-11, 12);
    currentNoteIndex = randIndex;
    placeNote(randIndex);
}

function placeNote(index) {
    ctx.beginPath();
    ctx.ellipse(cHalfWidth, cHalfHeight - (index * 20), 20, 16, 0, 0, 10);
    ctx.strokeStyle = "black";
    ctx.lineWidth = 5;
    ctx.stroke();

    if (Math.abs(index) > 4) {
        addLedgers(index);
    }
}

function addLedgers(index) {
    ctx.fillStyle = "black";
    let numLedgers = Math.round((Math.abs(index)-4)/2);
    let polarity = index > 0 ? -1: 1;

    for (let i = 1; i < numLedgers + 1; i++) {
        let height = (i * 40) - (1 * polarity);
        let topLedger = cHalfHeight + (80 * polarity);
        ctx.fillRect(cHalfWidth - 30, topLedger + (height * polarity), 60, 2);
    }
}

function practice() {
    if (!practiceStarted) {
        practiceStarted = true;
        correctAnswers = 0;
        incorrectAnswers = 0;
        practiceButton.innerHTML = "Stop Practice";
        generateRandomNote();
        sessionDiv.style.display = "flex";
        resultDiv.style.display = "none";
        sessionInput.style.marginLeft = "0";
        let html = "<span id=\"validity\"></span>";
        document.getElementById("validity-holder").innerHTML = html;
    } else {
        practiceStarted = false;
        practiceButton.innerHTML = "Start Practice";
        sessionDiv.style.display = "none";
        correctAnswerSpan.innerHTML = correctAnswers;
        incorrectAnswerSpan.innerHTML = incorrectAnswers;
        resultDiv.style.display = "flex";
        addStaves();
    }
}

function checkNote() {
    sessionInput.style.marginLeft = "0";
    let html = "<span id=\"validity\"></span>";
    document.getElementById("validity-holder").innerHTML = html;
    if (sessionInput.value.length > 1) {
        sessionInput.setCustomValidity("Too Many Characters");
    }else if (sessionInput.value.toUpperCase() === noteMap.get(currentNoteIndex)) {
        sessionInput.setCustomValidity("");
        correctAnswers++;
        putCorrectAnswer(currentNoteIndex);
        sessionInput.value = "";
        setTimeout(generateRandomNote, 2000);
    } else {
        incorrectAnswers++;
        sessionInput.value = "";
        sessionInput.style.marginLeft = "20pt";
        sessionInput.setCustomValidity("Wrong Answer");
    }
}

function putCorrectAnswer(index) {
    ctx.lineWidth = 1;
    ctx.font = "20pt 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif"
    ctx.strokeText(noteMap.get(index), cHalfWidth + 35, cHalfHeight - (index * 20) + 7);
    // this is so cursed but its here because otherwise the green check is always there unless the
    // answer is wrong. resetting the form does nothing
    sessionInput.style.marginLeft = "20pt";
    let html = "<span id=\"validity\" style=\"color:rgb(42, 165, 69);\">✓</span>";
    document.getElementById("validity-holder").innerHTML = html;
}


// debug function
function placeAllNotes() {
    resetBox();
    addStaves();
    for(let i = -11; i < 12; i++) {
        placeNoteDebug(i);
    }
}

// debug function
function placeNoteDebug(index) {
    ctx.beginPath();
    ctx.fillStyle = "rgba(12, 30, 48, 0.74)"
    ctx.ellipse(cHalfWidth, cHalfHeight - (index * 20), 20, 16, 0, 0, 10);
    ctx.fill();
    ctx.strokeStyle = "white";
    ctx.lineWidth = 5;
    ctx.stroke();
    ctx.beginPath();
    ctx.strokeStyle = "black";
    ctx.lineWidth = 1;
    ctx.strokeText(noteMap.get(index), cHalfWidth + 30, cHalfHeight - (index * 20) + 3);
    ctx.strokeText(index, cHalfWidth + 40, cHalfHeight - (index * 20) + 3);

    if (Math.abs(index) > 4) {
        addLedgers(index);
    }
}

//directly from mdn Math.random() page
function getRandomInt(min, max) {
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled); // The maximum is exclusive and the minimum is inclusive
}
