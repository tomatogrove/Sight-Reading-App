onload = () => main();

let canvas;
let ctx;
let cWidth;
let cHalfWidth;
let cHeight;
let cHalfHeight;

let fillColor = "bisque";
let ledgerHeight = 40;

let setUpDiv;
let sharpCheck;
let flatCheck;
let includeSharps = false;
let includeFlats = false;
let isTreble = true;

let noteMap = new Map();
let currentNoteInfo = {
    currentNoteIndex: -1,
    sharp: false,
    flat: false
};

let practiceButton;
let practiceStarted = false;

let sessionInputDiv;

let resultDiv;
let correctAnswers = 0;
let incorrectAnswers = 0;
let startTimeStamp;
let endTimeStamp;
let resultsStats = [];
let correctAnswerSpan;
let incorrectAnswerSpan;


let trebleImg;
let bassImg;
let sharpImg;
let flatImg;
let naturalImg;

// debug variable
// let boxExists = true;
function main() {
    setUpElements();

    let width = 100;
    trebleImg = new Image(width, width * 2.5);
    trebleImg.src = "https://upload.wikimedia.org/wikipedia/commons/f/ff/GClef.svg";
    
    bassImg = new Image(width, width);
    bassImg.src = "https://upload.wikimedia.org/wikipedia/commons/c/c5/FClef.svg";

    width = 25;
    sharpImg = new Image(width, width * 2);
    sharpImg.src = "https://upload.wikimedia.org/wikipedia/commons/a/a6/Sharp.svg";

    flatImg = new Image(width, width * 2);
    flatImg.src = "https://upload.wikimedia.org/wikipedia/commons/b/ba/Flat.svg";

    naturalImg = new Image(width, width * 2);
    naturalImg.src = "https://upload.wikimedia.org/wikipedia/commons/3/31/B%C3%A9carre.svg";
    

    ctx.fillStyle = fillColor;
    ctx.fillRect(0, 0, cWidth, cHeight);
    clearResultStats();
    resetCanvas();
    populateNoteMap(true);
    

    setUpEventListeners();
}

// set up functions (settings)
function setUpElements() {
    setUpDiv = document.getElementById("set-up");
    sharpCheck = document.getElementById("sharp-toggle");
    sharpCheck.checked = false;
    flatCheck = document.getElementById("flat-toggle");
    flatCheck.checked = false;

    practiceButton = document.getElementById("practice");
    practiceButton.innerHTML = "Start Practice";

    sessionInputDiv = document.getElementById("session-inputs");
    sessionInputDiv.style.display = "none";

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
}

function setUpEventListeners() {
    const radios = document.getElementsByName("clefs");
    radios[0].checked = true;
    radios[1].checked = false;
    
    radios[0].addEventListener("change", toggleClef);
    radios[1].addEventListener("change", toggleBass);

    sharpCheck.addEventListener("change", toggleSharps);
    flatCheck.addEventListener("change", toggleFlats);
}

function toggleClef() {
    isTreble = true;
    resetCanvas();
}

function toggleBass() {
    isTreble = false;
    resetCanvas();
}

function resetBox() {
    boxExists = false;
    ctx.clearRect(0, 0, cWidth, cHeight);

    boxExists = true;
    ctx.fillStyle = fillColor;
    ctx.fillRect(0, 0, cWidth, cHeight);
}

function resetCanvas() {
    resetBox();
    addStaves();
    if (isTreble) {
        showTrebleClef();
    } else {
        showBaseClef();
    }
}

function addStaves() {
    ctx.fillStyle = "black";
    for (let i = -2; i < 3; i++) {
        let height = i * 40 - 1;
        ctx.fillRect(10, cHalfHeight + height, cWidth - 20, 2);
    }
}

function showTrebleClef() {
    ctx.drawImage(trebleImg, 5, cHalfHeight / 2, trebleImg.width, trebleImg.height);
    populateNoteMap();
}

function showBaseClef() {
    ctx.drawImage(bassImg, 5, cHalfHeight / 1.4, bassImg.width, bassImg.height);
    populateNoteMap();
}

function populateNoteMap() {
    let noteList;
    if (isTreble) {
        noteList = ["B", "C", "D", "E", "F", "G", "A"];
    } else {
        noteList = ["D", "E", "F", "G", "A", "B", "C"];
    }

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

function toggleSharps() {
    includeSharps = !includeSharps;
}

function toggleFlats() {
    includeFlats = !includeFlats;
}



// session functions
function practice() {
    if (!practiceStarted) {
        practiceStarted = true;
        startTimeStamp = Date.now();
        endTimeStamp = 0;
        correctAnswers = 0;
        incorrectAnswers = 0;
        practiceButton.innerHTML = "Stop Practice";

        toggleDivVisibilities();
        clearResultStats();
        generateRandomNote();
    } else {
        practiceStarted = false;
        endTimeStamp  = Date.now();
        practiceButton.innerHTML = "Start Practice";

        setResults();
        toggleDivVisibilities();
        generateStats();
        resetCanvas();
    }
}

function toggleDivVisibilities() {
    if (practiceStarted) {
        sessionInputDiv.style.display = "flex";
        resultDiv.style.display = "none";
        setUpDiv.style.display = "none";
    } else {
        sessionInputDiv.style.display = "none";
        resultDiv.style.display = "flex";
        setUpDiv.style.display = "flex";
    }
}

function generateRandomNote() {
    if (practiceStarted) {
        resetCanvas();
        currentNoteInfo.currentNoteIndex = getRandomInt(-11, 11);
        if (includeSharps || includeFlats) {
            addSharpOrFlat();
        }
        addToResultsStats();
        createNoteInputs();
        placeNote();
    }
}

function addSharpOrFlat() {
    currentNoteInfo.sharp = false;
    currentNoteInfo.flat = false;
    let status;
    if (includeSharps && includeFlats) {
        status = getRandomInt(-1, 1);
    } else if (includeSharps) {
        status = getRandomInt(0, 1);
    } else {
        status = getRandomInt(-1, 0);
    }

    currentNoteInfo.sharp = status === 1;
    currentNoteInfo.flat = status === -1;
}

// still have to test this but uhhhhhh here we go
function createNoteInputs() {
    let noteList = ["C", "D", "E", "F", "G", "A", "B"];

    let naturalStr = "";
    let sharpStr = "";
    let flatStr = "";

    noteList.forEach((note) => {
        naturalStr += ` <button id="${note}" class="note-buttons" onclick="checkNote('${note}')">${note}</button> `;
        sharpStr += includeSharps ? ` <button id="${note}#" class="note-buttons" onclick="checkNote('${note}', '#')">${note}#</button> ` : "";
        flatStr += includeFlats ? ` <button id="${note}b" class="note-buttons" onclick="checkNote('${note}', 'b')">${note}b</button> ` : "";
    })

    document.getElementById("naturals").innerHTML = naturalStr;
    document.getElementById("sharps").innerHTML = sharpStr;
    document.getElementById("flats").innerHTML = flatStr;
}

function placeNote() {
    let index = currentNoteInfo.currentNoteIndex;
    ctx.beginPath();
    ctx.ellipse(cHalfWidth, cHalfHeight - (index * 20), 20, 16, 0, 0, 10);
    ctx.strokeStyle = "black";
    ctx.lineWidth = 5;
    ctx.stroke();

    if (Math.abs(index) > 4) {
        addLedgers();
    }
    if (currentNoteInfo.sharp || currentNoteInfo.flat) {
        placeAccidental();
    }
}

function addLedgers() {
    let index = currentNoteInfo.currentNoteIndex;
    ctx.fillStyle = "black";
    let numLedgers = Math.round((Math.abs(index)-4)/2);
    let polarity = index > 0 ? -1: 1;

    for (let i = 1; i < numLedgers + 1; i++) {
        let height = (i * 40) - (1 * polarity);
        let topLedger = cHalfHeight + (80 * polarity);
        ctx.fillRect(cHalfWidth - 30, topLedger + (height * polarity), 60, 2);
    }
}

function placeAccidental() {
    let index = currentNoteInfo.currentNoteIndex;
    // insert visual for sharp and flat yaay
    if (currentNoteInfo.sharp) {
        ctx.drawImage(sharpImg, cHalfWidth - 50, cHalfHeight - (index * 20) - 30, sharpImg.width, sharpImg.height);
    } else {
        ctx.drawImage(flatImg, cHalfWidth - 50, cHalfHeight - (index * 20) - 30, flatImg.width, flatImg.height);
    }
}

function checkNote(note, accidental) {
    let match = note === noteMap.get(currentNoteInfo.currentNoteIndex);
    if (match) {
        if (currentNoteInfo.sharp) {
            match = accidental === "#";
        } else if (currentNoteInfo.flat) {
            match = accidental === "b";
        } else {
            match = accidental == undefined;
        }
    }

    if (match) {
        correctAnswers++;
        setResultStatEndTime();
        addAttemptToResultsStats(note, accidental);
        putCorrectAnswer(currentNoteInfo.currentNoteIndex);
        markCorrect(note, accidental);
        setTimeout(generateRandomNote, 2000);
    } else {
        addAttemptToResultsStats(note, accidental);
        markIncorrect(note, accidental);
        incorrectAnswers++;
    }
}

function putCorrectAnswer(index) {
    ctx.lineWidth = 1;
    ctx.font = "20pt 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif"
    ctx.strokeText(noteMap.get(index), cHalfWidth + 35, cHalfHeight - (index * 20) + 7);
}

function markCorrect(note, accidental) {
    let modifier = accidental ?? "";

    document.getElementById(note + modifier).classList.add("correct");
}

function markIncorrect(note, accidental) {
    let modifier = accidental ?? "";

    let button = document.getElementById(note + modifier);
    button.disabled = true;
    button.classList.add("incorrect");
}


// results functions
function clearResultStats() {
    let div = document.getElementById("results-stats");
    div.innerHTML = `
    <table>
        <thead>
            <tr>
            <th scope="col">Note</th>
            <th scope="col">Guesses</th>
            <th scope="col">Attempts</th>
            <th scope="col">Time Elapsed</th>
            <th scope="col">Location</th>
            </tr>
        </thead>
        <tbody>
        </tbody>
    </table>
    `;
    div.style.display = "none";

    resultsStats = [];

}

function addToResultsStats() {
    let location;

    if (currentNoteInfo.currentNoteIndex > 4) {
        location = "top ledger";
    } else if (currentNoteInfo.currentNoteIndex < -4) {
        location = "bottom ledger";
    } else {
        location = "staff";
    }

    let note = noteMap.get(currentNoteInfo.currentNoteIndex);
    if (currentNoteInfo.sharp) {
        note += "#";
    } 
    if (currentNoteInfo.flat) {
        note += "b";
    }
    
    resultsStats.push({
        note: note,
        attempts: 0,
        guesses: [],
        startTimeStamp: Date.now(),
        endTimeStamp: Date.now(),
        location: location
    });
}

function setResultStatEndTime() {
    resultsStats[resultsStats.length - 1].endTimeStamp = Date.now();
}

function addAttemptToResultsStats(note, accidental) {
    let modifier = accidental ?? "";
    resultsStats[resultsStats.length - 1].attempts++;
    resultsStats[resultsStats.length - 1].guesses.push(note + modifier);
}

function generateStats() {
    const statsDiv = document.getElementById("results-stats");
    statsDiv.style.display = "flex";
    const statsBody = statsDiv.getElementsByTagName("tbody");
    let rows = "";
    resultsStats.forEach((stat) => {
        const timeElapsed = timeStampFormatter(stat.endTimeStamp - stat.startTimeStamp);
        const timeString = `${timeElapsed.m}:${timeElapsed.s}:${timeElapsed.ms}`;
        rows += ` <tr>
            <th scope="row">${stat.note}</th>
            <td>${stat.guesses.join(", ")}</td>
            <td>${stat.attempts}</td>
            <td>${timeString}</td>
            <td>${stat.location}</td>
        </tr>`;
    });

    statsBody[0].innerHTML = "<tbody>"+ rows + "</tbody>"
}

function setResults() {
    correctAnswerSpan.innerHTML = correctAnswers;
    incorrectAnswerSpan.innerHTML = incorrectAnswers;

    let stamp = timeStampFormatter(endTimeStamp - startTimeStamp);
    document.getElementById("timestamp").innerHTML = `<p>You practiced for ${stamp.h} hour(s), ${stamp.m} minute(s), and ${stamp.s} second(s)</p>`;
}

// starter function (remove in the end)
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

// debug function
function placeAllNotes() {
    resetCanvas();
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

function timeStampFormatter(timestamp) {
    let times = {
        ms: 0,
        s: 0,
        m: 0,
        h: 0
    }

    times.ms = timestamp % 1000;

    let seconds = timestamp / 1000;
    if (seconds > 59) {
        seconds  = seconds % 60;
    }
    times.s = Math.floor(seconds);

    let minutes = timestamp / 1000 / 60;
    if (minutes > 59) {
        minutes = minutes % 60;
    }
    times.m = Math.floor(minutes);

    times.h = Math.floor(timestamp / 1000 / 60 / 60);

    return times;
}

// from mdn Math.random() page
function getRandomInt(min, max) {
    return Math.round(Math.random() * (max - min) + min);
}

