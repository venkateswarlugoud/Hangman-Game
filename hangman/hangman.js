const HANGMAN_STAGES = [
    `+-------+
      |   |
          |
          |
          |
          |
    =========`,  

    `+-------+
      |   |
      O   |
          |
          |
          |
    =========`,  

    `+-------+
      |   |
      O   |
      |   |
          |
          |
    =========`,  

    `+-------+
      |   |
      O   |
     /|   |
          |
          |
    =========`,  

    `+-------+
      |   |
      O   |
     /|\\  |
          |
          |
    =========`,  

    `+-------+
      |   |
      O   |
     /|\\  |
     /    |
          |
    =========`,  

    `+-------+
      |   |
      O   |
     /|\\  |
     / \\  |
          |
    =========`  
];

const wordBank = {
    programming: [
        { word: "python", hint: "A popular programming language." },
        { word: "developer", hint: "A person who writes code." },
        { word: "algorithm", hint: "A step-by-step procedure for calculations." },
    ],
    animals: [
        { word: "elephant", hint: "The largest land animal." },
        { word: "giraffe", hint: "An animal with a very long neck." },
        { word: "dolphin", hint: "A highly intelligent marine mammal." },
    ],
    general: [
        { word: "hangman", hint: "A classic word-guessing game." },
        { word: "calendar", hint: "Used to track days, months, and years." },
        { word: "mountain", hint: "A natural elevation of the Earth's surface." },
    ],
};

let currentWordData = {};
let guessedLetters = new Set();
let attemptsLeft = HANGMAN_STAGES.length - 1;
let score = 0;
let usedHint = false;
let timer;
let timeLeft = 15; 
let gamesPlayed = 0;
let wins = 0;
let losses = 0;
let highScore = 0;
let mostGuessedLetters = {};

const backgroundMusic = document.getElementById("background-music");
const correctSound = document.getElementById("correct-sound");
const incorrectSound = document.getElementById("incorrect-sound");

document.getElementById("start-game-btn").addEventListener("click", startGame);
document.getElementById("submit-guess-btn").addEventListener("click", submitGuess);
document.getElementById("use-hint-btn").addEventListener("click", useHint);
document.getElementById("replay-btn").addEventListener("click", replayGame);

function startGame() {
    const welcomeMusic = document.getElementById("welcome-music");
    welcomeMusic.play();
    setTimeout(() => {
        welcomeMusic.pause(); 
        welcomeMusic.currentTime = 0; 
    }, 5000);
    const category = document.getElementById("category").value;
    const difficulty = document.getElementById("difficulty").value;
    currentWordData = loadWord(category);
    guessedLetters = new Set();
    attemptsLeft = HANGMAN_STAGES.length - 1;
    score = 0;
    usedHint = false;

    document.getElementById("category-selection").classList.add("hidden");
    document.getElementById("game-board").classList.remove("hidden");
    document.getElementById("game-over").classList.add("hidden");

    document.getElementById("hint-text").textContent = "Hint will appear after you click the button.";

    updateGameBoard();
    startTimer();

    gamesPlayed++;
    document.getElementById("games-played").textContent = `Games Played: ${gamesPlayed}`;

    if (backgroundMusic.paused) {
        backgroundMusic.play();
        backgroundMusic.loop = true; 
    }
}

function loadWord(category) {
    const words = wordBank[category];
    return words[Math.floor(Math.random() * words.length)];
}

function displayWord() {
    return currentWordData.word.split("").map(letter =>
        guessedLetters.has(letter) ? letter : "_"
    ).join(" ");
}

function updateGameBoard() {
    document.getElementById("word").textContent = displayWord();
    document.getElementById("hangman-image").textContent = HANGMAN_STAGES[HANGMAN_STAGES.length - 1 - attemptsLeft];
    document.getElementById("guessed-letters").textContent = [...guessedLetters].join(" ");
    document.getElementById("score").textContent = score;
    document.getElementById("time-left").textContent = `Time Left: ${timeLeft}s`;

    document.getElementById("high-score").textContent = `High Score: ${highScore}`;
    document.getElementById("win-loss-ratio").textContent = `Win/Loss Ratio: ${wins}/${losses}`;
    document.getElementById("most-frequent-guesses").textContent = `Most Guessed Letters: ${JSON.stringify(mostGuessedLetters)}`;
}

function startTimer() {
    timeLeft = 15;
    document.getElementById("time-left").textContent = `Time Left: ${timeLeft}s`;

    timer = setInterval(() => {
        timeLeft--;
        document.getElementById("time-left").textContent = `Time Left: ${timeLeft}s`;

        if (timeLeft <= 0) {
            clearInterval(timer);
            handleTimeOut();
        }
    }, 1000);
}

function handleTimeOut() {
    attemptsLeft--;

    if (attemptsLeft === 0) {
        endGame(false);
    } else {
        updateGameBoard();
    }
}

function submitGuess() {
    const guessInput = document.getElementById("guess-input");
    const guess = guessInput.value.toLowerCase();
    const errorMessage = document.getElementById("error-message");

    errorMessage.classList.add("hidden");

    if (!guess) {
        errorMessage.classList.remove("hidden"); 
        return;  
    }

    if (guessedLetters.has(guess)) return;

    guessedLetters.add(guess);
    mostGuessedLetters[guess] = (mostGuessedLetters[guess] || 0) + 1;

    if (currentWordData.word.includes(guess)) {
        correctSound.play();
        score += 10;
    } else {
        incorrectSound.play();
        attemptsLeft--;
    }
    guessInput.value = "";

    clearInterval(timer);
    startTimer();

    if (attemptsLeft === 0) {
        endGame(false);
    } else if ([...currentWordData.word].every(letter => guessedLetters.has(letter))) {
        endGame(true);
    } else {
        updateGameBoard();
    }
} 

function useHint() {
    if (usedHint) return;

    if (score >= 5) {
        score -= 5;
        usedHint = true;
        document.getElementById("hint-text").textContent = currentWordData.hint;
        updateGameBoard();
        const hintSound = document.getElementById("hint-sound");
        hintSound.play();

        hintSound.addEventListener("ended", () => {
            hintSound.pause();
            hintSound.currentTime = 0; 
        });
    } else {
        alert("You don't have enough points for a hint.");
    }
}

function endGame(won) {
    clearInterval(timer);
    document.getElementById("game-board").classList.add("hidden");
    document.getElementById("game-over").classList.remove("hidden");

    if (won) {
        wins++;
        score += 50;  
        highScore = Math.max(highScore, score);
        document.getElementById("game-over-message").textContent = "Congratulations, you won!🎉🥳🏆";
        const victorySound = document.getElementById("victory-sound");
        victorySound.play();
    } else {
        losses++;
        document.getElementById("game-over-message").textContent = "Game Over, you lost!😞💔👎";
        const lossSound = document.getElementById("loss-sound");
        lossSound.play();
    }

    document.getElementById("final-score").textContent = score;
    updateGameBoard();
}

function replayGame() {
    resetGameState();
    startGame();
}

function resetGameState() {
    guessedLetters.clear();  
    attemptsLeft = HANGMAN_STAGES.length - 1; 
    score = 0; 
    usedHint = false; 
    timeLeft = 15;  
    mostGuessedLetters = {}; 
    document.getElementById("hint-text").textContent = "Hint will appear after you click the button.";  
    document.getElementById("error-message").classList.add("hidden"); 
}
