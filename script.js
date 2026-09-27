/* =========================================================
   MATHFUN - SCRIPT.JS
   Aplikasi Latihan Matematika Interaktif
   Fitur:
   - Operasi: Pertambahan, Pengurangan, Perkalian, Pembagian
   - Mode: Angka Acak & Pilih Angka (1 - 10)
   - Timer Latihan: 1, 3, dan 5 Menit
   - Kuis Interaktif dengan Feedback Instan & Shortcut Tombol 1-4
   - Hasil Skor & Statistik (Total Soal, Benar, Salah)
   - Detail Jawaban Tiap Soal
   - Riwayat & Rekap Latihan Tersimpan (localStorage)
   ========================================================= */

/* =========================================================
   1. DATA & VARIABEL GLOBAL
   ========================================================= */

let currentOperation = "";
let currentMode = "";
let selectedNumber = null;
let selectedTime = 1;

let questions = [];
let currentQuestionIndex = 0;

let correctAnswers = 0;
let wrongAnswers = 0;
let userAnswers = [];

let timerInterval = null;
let remainingSeconds = 60;
let isAnswering = false;

let historyData = [];
const TOTAL_QUESTIONS = 50;

/* =========================================================
   2. ELEMENT HELPER
   ========================================================= */

function getElement(id) {
    return document.getElementById(id);
}

function showElement(element) {
    if (!element) return;
    element.classList.remove("hidden-section");
    if (element.classList.contains("section")) {
        element.classList.add("active-section");
    }
}

function hideElement(element) {
    if (!element) return;
    element.classList.add("hidden-section");
    element.classList.remove("active-section");
}

/* =========================================================
   3. SECTION / NAVIGATION
   ========================================================= */

const sections = document.querySelectorAll(".section");

function showSection(sectionId) {
    const allSections = document.querySelectorAll(".section");
    allSections.forEach(section => {
        section.classList.add("hidden-section");
        section.classList.remove("active-section");
    });

    const target = getElement(sectionId);
    if (target) {
        target.classList.remove("hidden-section");
        target.classList.add("active-section");
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }

    if (sectionId === "hasil") {
        displayHistory();
    }

    updateNavigation(sectionId);
}

function updateNavigation(sectionId) {
    document.querySelectorAll(".nav-link").forEach(link => {
        link.classList.remove("active");
    });

    document.querySelectorAll(".mobile-nav a").forEach(link => {
        link.classList.remove("active");
    });

    const targetLinks = document.querySelectorAll(`[href="#${sectionId}"]`);
    targetLinks.forEach(link => {
        link.classList.add("active");
    });
}

/* =========================================================
   4. MOBILE MENU
   ========================================================= */

const menuToggle = getElement("menuToggle");
const mobileNav = getElement("mobileNav");

if (menuToggle) {
    menuToggle.addEventListener("click", () => {
        if (!mobileNav) return;
        mobileNav.classList.toggle("show");

        const icon = menuToggle.querySelector("span") || menuToggle;
        if (icon) {
            icon.textContent = mobileNav.classList.contains("show") ? "✕" : "☰";
        }
    });
}

if (mobileNav) {
    mobileNav.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", () => {
            closeMobileMenu();
        });
    });
}

function closeMobileMenu() {
    const mNav = getElement("mobileNav");
    if (mNav) {
        mNav.classList.remove("show");
    }
    const mToggle = getElement("menuToggle");
    if (mToggle) {
        const icon = mToggle.querySelector("span") || mToggle;
        if (icon) {
            icon.textContent = "☰";
        }
    }
}

/* =========================================================
   5. OPERASI MATEMATIKA CONFIG
   ========================================================= */

const operationInfo = {
    addition: {
        name: "Pertambahan",
        symbol: "+",
        icon: "➕"
    },
    subtraction: {
        name: "Pengurangan",
        symbol: "−",
        icon: "➖"
    },
    multiplication: {
        name: "Perkalian",
        symbol: "×",
        icon: "✖️"
    },
    division: {
        name: "Pembagian",
        symbol: "÷",
        icon: "➗"
    }
};

/* =========================================================
   6. MEMILIH OPERASI
   ========================================================= */

function selectOperation(operation) {
    currentOperation = operation;

    if (operation === "division") {
        setupDivision();
    } else {
        setupNormalOperation();
    }

    showSection("setup");
}

function openOperation(operation) {
    selectOperation(operation);
}

function scrollToOperations() {
    const ops = getElement("operations");
    if (ops) {
        ops.scrollIntoView({ behavior: "smooth" });
    }
}

/* =========================================================
   7. SETUP OPERASI NORMAL
   ========================================================= */

function setupNormalOperation() {
    const info = operationInfo[currentOperation];
    if (!info) return;

    const icon = getElement("setupOperationIcon");
    const title = getElement("setupTitle");
    const description = getElement("setupDescription");

    if (icon) icon.textContent = info.icon;
    if (title) title.textContent = info.name;
    if (description) {
        description.textContent = `Latihan ${info.name.toLowerCase()} untuk mengasah kemampuan berhitungmu.`;
    }

    resetSetupSelections();

    const modeSelection = getElement("modeSelection");
    const numberSelection = getElement("numberSelection");

    if (modeSelection) {
        modeSelection.style.display = "block";
    }
    if (numberSelection) {
        numberSelection.classList.remove("show");
    }
}

/* =========================================================
   8. SETUP PEMBAGIAN
   ========================================================= */

function setupDivision() {
    currentOperation = "division";
    const info = operationInfo.division;

    const icon = getElement("setupOperationIcon");
    const title = getElement("setupTitle");
    const description = getElement("setupDescription");

    if (icon) icon.textContent = info.icon;
    if (title) title.textContent = info.name;
    if (description) {
        description.textContent = "Latihan pembagian dengan hasil bilangan bulat yang mudah dipahami.";
    }

    resetSetupSelections();

    const modeSelection = getElement("modeSelection");
    const numberSelection = getElement("numberSelection");

    // Pembagian tidak menggunakan pemilihan mode angka
    if (modeSelection) {
        modeSelection.style.display = "none";
    }
    if (numberSelection) {
        numberSelection.classList.remove("show");
    }

    updateStartButton();
}

/* =========================================================
   9. RESET SETUP
   ========================================================= */

function resetSetupSelections() {
    currentMode = "";
    selectedNumber = null;
    selectedTime = 1;

    document.querySelectorAll(".mode-card").forEach(card => {
        card.classList.remove("selected");
    });

    document.querySelectorAll(".number-grid button").forEach(button => {
        button.classList.remove("selected");
    });

    document.querySelectorAll(".time-card").forEach(card => {
        card.classList.remove("selected");
    });

    // Default waktu 1 menit
    const defaultTimeCard =
        document.querySelector('.time-card[data-time="1"]') ||
        document.querySelector(".time-card");

    if (defaultTimeCard) {
        defaultTimeCard.classList.add("selected");
    }

    updateStartButton();
}

/* =========================================================
   10. MEMILIH MODE
   ========================================================= */

function selectMode(mode) {
    if (mode === "choose") {
        mode = "number";
    }
    currentMode = mode;

    document.querySelectorAll(".mode-card").forEach(card => {
        card.classList.remove("selected");
    });

    const selectedCard =
        document.querySelector(`.mode-card[data-mode="${mode}"]`) ||
        document.querySelector(`.mode-card[data-mode="${mode === "number" ? "choose" : "random"}"]`) ||
        (mode === "number" ? getElement("chooseMode") : getElement("randomMode"));

    if (selectedCard) {
        selectedCard.classList.add("selected");
    }

    const numberSelection = getElement("numberSelection");

    if (mode === "number") {
        if (numberSelection) {
            numberSelection.classList.add("show");
        }
    } else {
        if (numberSelection) {
            numberSelection.classList.remove("show");
        }
        selectedNumber = null;
        document.querySelectorAll(".number-grid button").forEach(button => {
            button.classList.remove("selected");
        });
    }

    updateStartButton();
}

/* =========================================================
   11. MEMILIH ANGKA 1 - 10
   ========================================================= */

function selectNumber(number) {
    selectedNumber = Number(number);

    document.querySelectorAll(".number-grid button").forEach(button => {
        button.classList.remove("selected");
    });

    const selectedButton =
        document.querySelector(`.number-grid button[data-number="${number}"]`) ||
        Array.from(document.querySelectorAll(".number-grid button")).find(
            b => b.textContent.trim() === String(number)
        );

    if (selectedButton) {
        selectedButton.classList.add("selected");
    }

    updateStartButton();
}

/* =========================================================
   12. MEMILIH WAKTU
   ========================================================= */

function selectTime(minutes) {
    selectedTime = Number(minutes);

    document.querySelectorAll(".time-card").forEach(card => {
        card.classList.remove("selected");
    });

    const selectedCard =
        document.querySelector(`.time-card[data-time="${minutes}"]`) ||
        Array.from(document.querySelectorAll(".time-card")).find(c =>
            c.textContent.includes(String(minutes))
        );

    if (selectedCard) {
        selectedCard.classList.add("selected");
    }

    updateStartButton();
}

/* =========================================================
   13. VALIDASI TOMBOL MULAI
   ========================================================= */

function updateStartButton() {
    const startButton = getElement("startButton");
    if (!startButton) return;

    let ready = false;

    if (currentOperation === "division") {
        ready = selectedTime > 0;
    } else {
        if (currentMode === "random") {
            ready = selectedTime > 0;
        } else if (currentMode === "number") {
            ready = selectedNumber !== null && selectedTime > 0;
        }
    }

    startButton.disabled = !ready;

    if (ready) {
        startButton.style.opacity = "1";
        startButton.style.cursor = "pointer";
    } else {
        startButton.style.opacity = "0.5";
        startButton.style.cursor = "not-allowed";
    }
}

/* =========================================================
   14. MEMULAI LATIHAN
   ========================================================= */

function startQuiz() {
    // Validasi input
    if (currentOperation !== "division") {
        if (!currentMode) {
            showMessage(
                "Pilih Mode",
                "Silakan pilih Angka Acak atau Pilih Angka terlebih dahulu.",
                "⚠️"
            );
            return;
        }

        if (currentMode === "number" && selectedNumber === null) {
            showMessage(
                "Pilih Angka",
                "Silakan pilih angka 1 sampai 10.",
                "🔢"
            );
            return;
        }
    }

    // Set judul dan ikon operasi di kuis
    const info = operationInfo[currentOperation] || { name: "Latihan", icon: "🧮" };
    const quizIcon = getElement("quizIcon");
    const quizName = getElement("quizName");
    if (quizIcon) quizIcon.textContent = info.icon;
    if (quizName) quizName.textContent = info.name;

    // Reset data kuis
    currentQuestionIndex = 0;
    correctAnswers = 0;
    wrongAnswers = 0;
    userAnswers = [];

    const correctElement = getElement("correctCount");
    if (correctElement) correctElement.textContent = "0";

    const questionNumber = getElement("questionNumber");
    if (questionNumber) questionNumber.textContent = "1";

    const progressFill = getElement("progressFill");
    if (progressFill) progressFill.style.width = "0%";

    // Buat kumpulan soal baru
    questions = generateQuestions();

    // Inisialisasi timer
    remainingSeconds = selectedTime * 60;
    stopTimer();

    showSection("quiz");
    displayQuestion();
    startTimer();
}

/* =========================================================
   15. HELPER MATEMATIKA & ARRAY
   ========================================================= */

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

/* =========================================================
   16. MEMBUAT SOAL
   ========================================================= */

function generateQuestions() {
    const generated = [];

    for (let i = 0; i < TOTAL_QUESTIONS; i++) {
        let question;

        if (currentOperation === "addition") {
            question = generateAdditionQuestion();
        } else if (currentOperation === "subtraction") {
            question = generateSubtractionQuestion();
        } else if (currentOperation === "multiplication") {
            question = generateMultiplicationQuestion();
        } else if (currentOperation === "division") {
            question = generateDivisionQuestion();
        }

        if (question) {
            generated.push(question);
        }
    }

    return generated;
}

function generateAdditionQuestion() {
    let a;
    let b;

    if (currentMode === "number") {
        a = selectedNumber;
        b = randomInt(1, 10);
    } else {
        a = randomInt(1, 9);
        b = randomInt(1, 9);
    }

    const answer = a + b;
    return {
        a,
        b,
        operator: "+",
        answer,
        text: `${a} + ${b}`
    };
}

function generateSubtractionQuestion() {
    let a;
    let b;

    if (currentMode === "number") {
        a = selectedNumber;
        b = randomInt(1, 10);
    } else {
        a = randomInt(1, 9);
        b = randomInt(1, 9);
    }

    // Pastikan hasil tidak negatif
    if (b > a) {
        [a, b] = [b, a];
    }

    const answer = a - b;
    return {
        a,
        b,
        operator: "−",
        answer,
        text: `${a} − ${b}`
    };
}

function generateMultiplicationQuestion() {
    let a;
    let b;

    if (currentMode === "number") {
        a = selectedNumber;
        b = randomInt(1, 10);
    } else {
        a = randomInt(1, 9);
        b = randomInt(1, 9);
    }

    const answer = a * b;
    return {
        a,
        b,
        operator: "×",
        answer,
        text: `${a} × ${b}`
    };
}

function generateDivisionQuestion() {
    const divisor = randomInt(2, 10);
    const quotient = randomInt(1, 10);
    const dividend = divisor * quotient;

    return {
        a: dividend,
        b: divisor,
        operator: "÷",
        answer: quotient,
        text: `${dividend} ÷ ${divisor}`
    };
}

/* =========================================================
   17. MENAMPILKAN SOAL
   ========================================================= */

function displayQuestion() {
    if (currentQuestionIndex >= questions.length) {
        finishQuiz();
        return;
    }

    isAnswering = false;
    const questionData = questions[currentQuestionIndex];

    const questionElement = getElement("question");
    if (questionElement) {
        questionElement.textContent = `${questionData.text} = ?`;
        questionElement.style.animation = "none";
        void questionElement.offsetWidth;
        questionElement.style.animation = "questionPop 0.5s ease";
    }

    const questionNumber = getElement("questionNumber");
    if (questionNumber) {
        questionNumber.textContent = currentQuestionIndex + 1;
    }

    updateProgress();
    generateAnswerChoices(questionData.answer);

    const feedback = getElement("quizFeedback");
    if (feedback) {
        feedback.classList.remove("show");
        feedback.classList.remove("wrong-feedback");
    }
}

/* =========================================================
   18. MEMBUAT PILIHAN JAWABAN
   ========================================================= */

function generateAnswerChoices(correctAnswer) {
    const answerGrid = getElement("answerGrid");
    if (!answerGrid) return;

    answerGrid.innerHTML = "";
    const choices = new Set();
    choices.add(correctAnswer);

    let attempts = 0;
    while (choices.size < 4 && attempts < 100) {
        attempts++;
        let variation;

        if (correctAnswer <= 10) {
            variation = correctAnswer + randomInt(-5, 5);
        } else {
            variation = correctAnswer + randomInt(-10, 10);
        }

        if (variation < 0) {
            variation = Math.abs(variation);
        }

        if (variation !== correctAnswer && variation >= 0) {
            choices.add(variation);
        }
    }

    // Fallback jika jawaban duplikat
    let fallback = 0;
    while (choices.size < 4) {
        if (!choices.has(fallback) && fallback >= 0) {
            choices.add(fallback);
        }
        fallback++;
    }

    const shuffledChoices = shuffle([...choices]);

    shuffledChoices.forEach(choice => {
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = choice;
        button.dataset.answer = choice;

        button.addEventListener("click", () => {
            checkAnswer(choice, button);
        });

        answerGrid.appendChild(button);
    });
}

/* =========================================================
   19. MEMERIKSA JAWABAN
   ========================================================= */

function checkAnswer(userAnswer, clickedButton) {
    if (isAnswering) return;
    isAnswering = true;

    const current = questions[currentQuestionIndex];
    const correctAnswer = current.answer;
    const isCorrect = Number(userAnswer) === Number(correctAnswer);

    const buttons = document.querySelectorAll("#answerGrid button");
    buttons.forEach(button => {
        button.disabled = true;
    });

    userAnswers.push({
        questionNumber: currentQuestionIndex + 1,
        question: current.text,
        userAnswer: Number(userAnswer),
        correctAnswer: Number(correctAnswer),
        correct: isCorrect
    });

    if (isCorrect) {
        correctAnswers++;

        // Update jumlah benar di layar secara langsung
        const correctElement = getElement("correctCount");
        if (correctElement) {
            correctElement.textContent = correctAnswers;
        }

        if (clickedButton) {
            clickedButton.classList.add("correct");
        }
        showFeedback(true, "Jawaban benar! 🎉");
    } else {
        wrongAnswers++;

        if (clickedButton) {
            clickedButton.classList.add("wrong");
        }

        buttons.forEach(button => {
            if (Number(button.dataset.answer) === Number(correctAnswer)) {
                button.classList.add("correct");
            }
        });

        showFeedback(false, `Jawaban yang benar adalah ${correctAnswer}`);
    }

    setTimeout(() => {
        currentQuestionIndex++;
        displayQuestion();
    }, 850);
}

/* =========================================================
   20. FEEDBACK JAWABAN
   ========================================================= */

function showFeedback(isCorrect, message) {
    const feedback = getElement("quizFeedback");
    const feedbackIcon = getElement("feedbackIcon");
    const feedbackText = getElement("feedbackText");

    if (!feedback) return;
    feedback.classList.add("show");

    if (isCorrect) {
        feedback.classList.remove("wrong-feedback");
        if (feedbackIcon) feedbackIcon.textContent = "🎉";
    } else {
        feedback.classList.add("wrong-feedback");
        if (feedbackIcon) feedbackIcon.textContent = "💡";
    }

    if (feedbackText) {
        feedbackText.textContent = message;
    }
}

/* =========================================================
   21. PROGRESS BAR
   ========================================================= */

function updateProgress() {
    const progressFill = getElement("progressFill");
    if (!progressFill) return;

    const progress = (currentQuestionIndex / questions.length) * 100;
    progressFill.style.width = `${Math.min(progress, 100)}%`;
}

/* =========================================================
   22. TIMER SISTEM
   ========================================================= */

function startTimer() {
    updateTimerDisplay();

    timerInterval = setInterval(() => {
        remainingSeconds--;
        updateTimerDisplay();

        if (remainingSeconds <= 0) {
            remainingSeconds = 0;
            updateTimerDisplay();
            stopTimer();
            finishQuiz(true);
        }
    }, 1000);
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

function updateTimerDisplay() {
    const timer = getElement("timer");
    const timerText = getElement("timerText");

    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = remainingSeconds % 60;
    const formattedSeconds = String(seconds).padStart(2, "0");
    const formattedMinutes = String(minutes).padStart(2, "0");
    const timeDisplay = `${formattedMinutes}:${formattedSeconds}`;

    if (timerText) {
        timerText.textContent = timeDisplay;
    } else if (timer) {
        timer.textContent = timeDisplay;
    }

    if (timer) {
        if (remainingSeconds <= 10) {
            timer.classList.add("warning");
        } else {
            timer.classList.remove("warning");
        }
    }
}

/* =========================================================
   23. SELESAI LATIHAN & MENAMPILKAN HASIL
   ========================================================= */

function finishQuiz(timeUp = false) {
    stopTimer();
    isAnswering = true;

    saveHistory(timeUp);
    showResult(timeUp);
}

function showResult(timeUp = false) {
    const score = calculateScore();

    const scoreNumber = getElement("scoreNumber");
    if (scoreNumber) {
        scoreNumber.textContent = score;
    }

    // Update statistik hasil
    const totalQuestionsElem = getElement("totalQuestions");
    if (totalQuestionsElem) {
        totalQuestionsElem.textContent = userAnswers.length;
    }

    const resultCorrectElem = getElement("resultCorrect");
    if (resultCorrectElem) {
        resultCorrectElem.textContent = correctAnswers;
    }

    const resultWrongElem = getElement("resultWrong");
    if (resultWrongElem) {
        resultWrongElem.textContent = wrongAnswers;
    }

    // Title & Emoticon perayaan
    const resultCelebration = getElement("resultCelebration");
    if (resultCelebration) {
        resultCelebration.textContent = timeUp ? "⏰" : getResultEmoji(score);
    }

    const resultTitle = getElement("resultTitle");
    if (resultTitle) {
        resultTitle.textContent = timeUp ? "Waktu Habis!" : getResultTitle(score);
    }

    const resultSubtitle = getElement("resultSubtitle");
    if (resultSubtitle) {
        if (timeUp) {
            resultSubtitle.textContent = `Waktu latihan telah berakhir. Kamu berhasil menjawab ${userAnswers.length} soal.`;
        } else {
            resultSubtitle.textContent = userAnswers.length > 0
                ? `Kamu berhasil menyelesaikan latihan dengan nilai ${score} poin!`
                : "Berikut hasil latihanmu.";
        }
    }

    generateAnswerDetails();
    showSection("result");
}

function calculateScore() {
    if (userAnswers.length === 0) {
        return 0;
    }
    return Math.round((correctAnswers / userAnswers.length) * 100);
}

function getResultEmoji(score) {
    if (score >= 90) return "🏆";
    if (score >= 75) return "🎉";
    if (score >= 60) return "😊";
    if (score >= 40) return "💪";
    return "🌱";
}

function getResultTitle(score) {
    if (score >= 90) return "Luar Biasa!";
    if (score >= 75) return "Hebat Sekali!";
    if (score >= 60) return "Bagus!";
    if (score >= 40) return "Terus Berlatih!";
    return "Jangan Menyerah!";
}

/* =========================================================
   24. DETAIL JAWABAN
   ========================================================= */

function showResultDetails() {
    showSection("resultDetails");
}

function generateAnswerDetails() {
    const container = getElement("answerDetails");
    if (!container) return;

    container.innerHTML = "";

    if (userAnswers.length === 0) {
        container.innerHTML = `
            <div class="empty-history">
                <div class="empty-history-icon">📚</div>
                <h3>Belum ada jawaban</h3>
                <p>Coba kerjakan latihan lagi.</p>
            </div>
        `;
        return;
    }

    userAnswers.forEach((item, index) => {
        const card = document.createElement("div");
        card.className = "answer-detail-card";
        if (!item.correct) {
            card.classList.add("wrong");
        }
        card.style.animationDelay = `${index * 0.04}s`;

        card.innerHTML = `
            <div class="detail-number">
                ${index + 1}
            </div>
            <div>
                <div class="detail-question">
                    ${escapeHTML(item.question)} = ?
                </div>
            </div>
            <div class="detail-answer">
                <span class="your-answer">
                    Jawabanmu: <strong>${item.userAnswer}</strong>
                </span>
                ${
                    !item.correct
                        ? `<span class="correct-answer">
                            Jawaban benar: ${item.correctAnswer}
                           </span>`
                        : `<span class="correct-answer">
                            ✓ Benar
                           </span>`
                }
            </div>
        `;

        container.appendChild(card);
    });
}

/* =========================================================
   25. SIMPAN & LOAD RIWAYAT LATIHAN
   ========================================================= */

function saveHistory(timeUp = false) {
    const score = calculateScore();

    const record = {
        id: Date.now(),
        operation: currentOperation,
        operationName: operationInfo[currentOperation]?.name || "Matematika",
        mode: currentMode,
        number: selectedNumber,
        time: selectedTime,
        correct: correctAnswers,
        wrong: wrongAnswers,
        answered: userAnswers.length,
        score,
        timeUp,
        date: new Date().toLocaleString("id-ID", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        })
    };

    historyData.unshift(record);

    if (historyData.length > 30) {
        historyData = historyData.slice(0, 30);
    }

    try {
        localStorage.setItem("mathfun_history", JSON.stringify(historyData));
    } catch (e) {
        console.warn("Gagal menyimpan ke localStorage:", e);
    }
}

function loadHistory() {
    try {
        const saved = localStorage.getItem("mathfun_history");
        if (!saved) {
            historyData = [];
            return;
        }
        const parsed = JSON.parse(saved);
        historyData = Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        historyData = [];
    }
}

function displayHistory() {
    loadHistory();

    let totalCorrect = 0;
    let totalWrong = 0;
    let totalAnswered = 0;
    let totalScoreSum = 0;

    historyData.forEach(item => {
        totalCorrect += Number(item.correct || 0);
        totalWrong += Number(item.wrong || 0);
        totalAnswered += Number(item.answered || 0);
        totalScoreSum += Number(item.score || 0);
    });

    const avgScore = historyData.length > 0 ? Math.round(totalScoreSum / historyData.length) : 0;

    const historyTotal = getElement("historyTotal");
    const historyCorrect = getElement("historyCorrect");
    const historyWrong = getElement("historyWrong");
    const historyScore = getElement("historyScore");

    if (historyTotal) historyTotal.textContent = totalAnswered;
    if (historyCorrect) historyCorrect.textContent = totalCorrect;
    if (historyWrong) historyWrong.textContent = totalWrong;
    if (historyScore) historyScore.textContent = avgScore;

    const list = getElement("historyList");
    if (!list) return;

    list.innerHTML = "";

    if (historyData.length === 0) {
        list.innerHTML = `
            <div class="empty-history">
                <div class="empty-history-icon">📚</div>
                <h3>Belum ada riwayat</h3>
                <p>Yuk mulai latihan pertamamu!</p>
                <button class="primary-button" type="button" onclick="showSection('home')">
                    🚀 Mulai Latihan
                </button>
            </div>
        `;
        return;
    }

    historyData.forEach(item => {
        const div = document.createElement("div");
        div.className = "history-item";

        const icon = getOperationIcon(item.operation);
        const modeText = getModeText(item);

        div.innerHTML = `
            <div class="history-item-icon">
                ${icon}
            </div>
            <div>
                <h4>${escapeHTML(item.operationName)}</h4>
                <p>${modeText} • ${escapeHTML(item.date)}</p>
            </div>
            <div class="history-score">
                <strong>${item.score} Poin</strong>
                <span>${item.correct} benar / ${item.wrong} salah</span>
            </div>
        `;

        list.appendChild(div);
    });
}

function getOperationIcon(operation) {
    if (operation === "addition") return "➕";
    if (operation === "subtraction") return "➖";
    if (operation === "multiplication") return "✖️";
    if (operation === "division") return "➗";
    return "🔢";
}

function getModeText(item) {
    if (item.operation === "division") {
        return `Pembagian • ${item.time} menit`;
    }
    if (item.mode === "random") {
        return `Angka Acak • ${item.time} menit`;
    }
    if (item.mode === "number") {
        return `Angka ${item.number} • ${item.time} menit`;
    }
    return `${item.time} menit`;
}

function escapeHTML(value) {
    if (value === null || value === undefined) return "";
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

/* =========================================================
   26. NAVIGASI HOME & ULANGI
   ========================================================= */

function goHome() {
    stopTimer();
    isAnswering = false;
    showSection("home");
}

function backToOperations() {
    stopTimer();
    currentOperation = "";
    currentMode = "";
    selectedNumber = null;
    showSection("home");
    scrollToOperations();
}

function backFromSetup() {
    stopTimer();
    showSection("home");
}

function retryQuiz() {
    currentQuestionIndex = 0;
    correctAnswers = 0;
    wrongAnswers = 0;
    userAnswers = [];

    const correctElement = getElement("correctCount");
    if (correctElement) correctElement.textContent = "0";

    const questionNumber = getElement("questionNumber");
    if (questionNumber) questionNumber.textContent = "1";

    const progressFill = getElement("progressFill");
    if (progressFill) progressFill.style.width = "0%";

    questions = generateQuestions();
    remainingSeconds = selectedTime * 60;
    stopTimer();

    showSection("quiz");
    displayQuestion();
    startTimer();
}

function openHistory() {
    displayHistory();
    showSection("hasil");
}

function openAbout() {
    showSection("tentang");
}

/* =========================================================
   27. MODAL KONFIRMASI & PESAN
   ========================================================= */

function confirmQuit() {
    const modal = getElement("quitModal");
    if (!modal) {
        goHome();
        return;
    }
    modal.classList.add("show");
}

function closeQuitModal() {
    const modal = getElement("quitModal");
    if (modal) {
        modal.classList.remove("show");
    }
}

function quitQuiz() {
    closeQuitModal();
    stopTimer();
    isAnswering = false;
    showSection("home");
}

function showMessage(title, message, icon = "💡") {
    const modal = getElement("alertModal");
    if (modal) {
        const modalIcon = getElement("modalIcon");
        const modalTitle = getElement("modalTitle");
        const modalMessage = getElement("modalMessage");

        if (modalIcon) modalIcon.textContent = icon;
        if (modalTitle) modalTitle.textContent = title;
        if (modalMessage) modalMessage.textContent = message;

        modal.classList.add("show");
    } else {
        alert(`${title}\n\n${message}`);
    }
}

function closeAlertModal() {
    const modal = getElement("alertModal");
    if (modal) {
        modal.classList.remove("show");
    }
}

/* =========================================================
   28. EVENT LISTENERS
   ========================================================= */

// Klik di luar area modal untuk menutup
const quitModalOverlay = getElement("quitModal");
if (quitModalOverlay) {
    quitModalOverlay.addEventListener("click", event => {
        if (event.target === quitModalOverlay) {
            closeQuitModal();
        }
    });
}

const alertModalOverlay = getElement("alertModal");
if (alertModalOverlay) {
    alertModalOverlay.addEventListener("click", event => {
        if (event.target === alertModalOverlay) {
            closeAlertModal();
        }
    });
}

// Dukungan Keyboard
document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
        closeQuitModal();
        closeAlertModal();
    }

    // Tombol angka 1-4 untuk pilihan jawaban kuis
    if (event.key >= "1" && event.key <= "4") {
        const buttons = document.querySelectorAll("#answerGrid button");
        const index = Number(event.key) - 1;

        if (buttons[index] && !buttons[index].disabled) {
            buttons[index].click();
        }
    }
});

// Event Navigasi
document.querySelectorAll(".nav-link, .mobile-nav a").forEach(link => {
    link.addEventListener("click", event => {
        const href = link.getAttribute("href");
        if (href && href.startsWith("#")) {
            event.preventDefault();
            const sectionId = href.substring(1);
            showSection(sectionId);
        }
    });
});

// Start button event listener jika ada
const startButton = getElement("startButton");
if (startButton) {
    startButton.addEventListener("click", startQuiz);
}

// Inisialisasi saat Halaman Dimuat
document.addEventListener("DOMContentLoaded", () => {
    loadHistory();

    const allSections = document.querySelectorAll(".section");
    allSections.forEach(section => {
        section.classList.add("hidden-section");
        section.classList.remove("active-section");
    });

    const home = getElement("home");
    if (home) {
        home.classList.remove("hidden-section");
        home.classList.add("active-section");
    }

    selectedTime = 1;
    const firstTime =
        document.querySelector('.time-card[data-time="1"]') ||
        document.querySelector(".time-card");

    if (firstTime) {
        firstTime.classList.add("selected");
    }

    updateStartButton();
});

// Hentikan timer jika window di-reload atau ditutup
window.addEventListener("beforeunload", event => {
    stopTimer();
    const quizSection = getElement("quiz");
    if (quizSection && quizSection.classList.contains("active-section")) {
        event.preventDefault();
        event.returnValue = "";
    }
});

/* =========================================================
   29. FUNGSI GLOBAL (WINDOW BINDING)
   ========================================================= */

window.selectOperation = selectOperation;
window.openOperation = openOperation;
window.scrollToOperations = scrollToOperations;
window.selectMode = selectMode;
window.selectNumber = selectNumber;
window.selectTime = selectTime;
window.startQuiz = startQuiz;
window.goHome = goHome;
window.backToOperations = backToOperations;
window.backFromSetup = backFromSetup;
window.retryQuiz = retryQuiz;
window.openHistory = openHistory;
window.openAbout = openAbout;
window.confirmQuit = confirmQuit;
window.closeQuitModal = closeQuitModal;
window.closeModal = closeQuitModal;
window.quitQuiz = quitQuiz;
window.showMessage = showMessage;
window.closeAlertModal = closeAlertModal;
window.showSection = showSection;
window.showResultDetails = showResultDetails;
window.closeMobileMenu = closeMobileMenu;