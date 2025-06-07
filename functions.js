// Global variable to store questions fetched from the API
let questions = [];
let currentQuestionIndex = 0;
let usedIndices = [];
const API_URL = "https://apex.oracle.com/pls/apex/gamescasino/questions/get_all/"; // Your API endpoint

/**
 * Fetches questions from the Oracle APEX API.
 * Transforms the API response format to match the existing game logic.
 * @returns {Promise<Array>} A promise that resolves to an array of transformed question objects.
 */
async function fetchQuestions() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        // Transform the API response 'items' into the format expected by your game logic
        return data.items.map(apiQuestion => ({
            id: apiQuestion.id, // Keep the ID if you need it for other API operations
            q: apiQuestion.question_text,
            options: [
                apiQuestion.option_1,
                apiQuestion.option_2,
                apiQuestion.option_3,
                apiQuestion.option_4
            ],
            correct: apiQuestion.correct_option_index
        }));
    } catch (error) {
        console.error("Error fetching questions:", error);
        alert("فشل في تحميل الأسئلة من الخادم. يرجى المحاولة مرة أخرى لاحقًا.");
        return []; // Return an empty array on error
    }
}


function renderQuestion() {
    // Ensure questions array is not empty before rendering
    if (questions.length === 0) {
        document.getElementById("question").textContent = "لا توجد أسئلة لعرضها.";
        document.getElementById("answers").innerHTML = "";
        return;
    }

    const q = questions[currentQuestionIndex];
    document.getElementById("question").textContent = q.q;
    const answersContainer = document.getElementById("answers");
    answersContainer.innerHTML = "";
    q.options.forEach((opt, index) => {
        const label = document.createElement("label");
        // Only show the correct answer hint for debugging/development, remove for actual game
        if (index === q.correct) { // Uncomment this line
            label.innerHTML = `${opt} <span class="correct">✔ الإجابة الصحيحة</span>`; // Uncomment this line
        } else { // Uncomment this line
            label.textContent = opt;
        } // Uncomment this line
        answersContainer.appendChild(label);
    });
}

function randomQuestion() {
    if (usedIndices.length === questions.length) {
        alert("تم عرض جميع الأسئلة!");
        return;
    }
    let newIndex;
    do {
        newIndex = Math.floor(Math.random() * questions.length);
    } while (usedIndices.includes(newIndex));
    currentQuestionIndex = newIndex;
    usedIndices.push(newIndex);
    renderQuestion();
}

function prevQuestion() {
    if (usedIndices.length > 1) {
        usedIndices.pop();
        currentQuestionIndex = usedIndices[usedIndices.length - 1];
        renderQuestion();
    }
}

function checkWinner(name, score) {
    if (score >= 10) {
        document.getElementById("winner-name").textContent = `الفائز هو: ${name}`;
        document.getElementById("game-section").style.display = "none";
        document.getElementById("winner-screen").style.display = "block";
    }
}

function restartGame() {
    document.getElementById("winner-screen").style.display = "none";
    document.getElementById("player-form").style.display = "block";
}

// Modified startGame to fetch questions
async function startGame() {
    const input = document.getElementById("player-input").value;
    const names = input.split(",").map(n => n.trim()).filter(n => n);
    if (names.length === 0) return alert("يرجى إدخال أسماء المتسابقين.");

    // Fetch questions from the API
    questions = await fetchQuestions();

    // Check if questions were successfully loaded
    if (questions.length === 0) {
        // The error message is handled inside fetchQuestions, just return here
        return;
    }

    document.getElementById("players").innerHTML = "";
    const playersContainer = document.getElementById("players");
    names.forEach(name => {
        const playerDiv = document.createElement("div");
        playerDiv.className = "player";

        const nameSpan = document.createElement("span");
        nameSpan.className = "player-name";
        nameSpan.textContent = name;

        const scoreSpan = document.createElement("span");
        scoreSpan.id = `score-${name}`;
        scoreSpan.textContent = "0";

        const controls = document.createElement("div");
        controls.className = "score-controls";
        const plusBtn = document.createElement("button");
        plusBtn.textContent = "+";
        plusBtn.onclick = () => {
            const newScore = parseInt(scoreSpan.textContent) + 1;
            scoreSpan.textContent = newScore;
            checkWinner(name, newScore);
        };

        const minusBtn = document.createElement("button");
        minusBtn.textContent = "-";
        minusBtn.onclick = () => {
            const newScore = parseInt(scoreSpan.textContent) - 1;
            scoreSpan.textContent = newScore;
        };

        controls.appendChild(plusBtn);
        controls.appendChild(minusBtn);

        playerDiv.appendChild(nameSpan);
        playerDiv.appendChild(scoreSpan);
        playerDiv.appendChild(controls);

        playersContainer.appendChild(playerDiv);
    });

    usedIndices = [];
    randomQuestion(); // Call randomQuestion only after questions are loaded
    document.getElementById("player-form").style.display = "none";
    document.getElementById("game-section").style.display = "flex";
}
