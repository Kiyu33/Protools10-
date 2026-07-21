// ===========================
// Pro Tools 四択問題集
// 初級・中級・技術問題対応版
// ===========================

// ---------- 画面 ----------
const homeScreen = document.getElementById("home-screen");
const beginnerMenu = document.getElementById("beginner-menu");
const intermediateMenu = document.getElementById("intermediate-menu");
const quizScreen = document.getElementById("quiz-screen");

// ---------- ホームボタン ----------
const beginnerBtn = document.getElementById("beginner-btn");
const intermediateBtn = document.getElementById("intermediate-btn");
const technikBtn = document.getElementById("technik-btn");
const allBtn = document.getElementById("all-btn");
const randomBtn = document.getElementById("random-btn");
const backBtn = document.getElementById("back-btn");
const intermediateBackBtn = document.getElementById("intermediate-back-btn");

// ---------- 初級 A～D ----------
const beginnerCategoryButtons = {
	A1: document.getElementById("a1-btn"),
	A2: document.getElementById("a2-btn"),
	B1: document.getElementById("b1-btn"),
	B2: document.getElementById("b2-btn"),
	C1: document.getElementById("c1-btn"),
	C2: document.getElementById("c2-btn"),
	C3: document.getElementById("c3-btn"),
	C4: document.getElementById("c4-btn"),
	D1: document.getElementById("d1-btn"),
	D2: document.getElementById("d2-btn"),
	D3: document.getElementById("d3-btn"),
	D4: document.getElementById("d4-btn")
};

// ---------- 中級 A～D ----------
const intermediateCategoryButtons = {
	A1: document.getElementById("intermediate-a1-btn"),
	A2: document.getElementById("intermediate-a2-btn"),
	B1: document.getElementById("intermediate-b1-btn"),
	B2: document.getElementById("intermediate-b2-btn"),
	C1: document.getElementById("intermediate-c1-btn"),
	C2: document.getElementById("intermediate-c2-btn"),
	C3: document.getElementById("intermediate-c3-btn"),
	C4: document.getElementById("intermediate-c4-btn"),
	D1: document.getElementById("intermediate-d1-btn"),
	D2: document.getElementById("intermediate-d2-btn"),
	D3: document.getElementById("intermediate-d3-btn"),
	D4: document.getElementById("intermediate-d4-btn")
};

// ---------- 問題画面 ----------
const questionNumber = document.getElementById("question-number");
const questionText = document.getElementById("question");
const questionImage = document.getElementById("question-image");
const choicesDiv = document.getElementById("choices");
const progressBar = document.getElementById("progress-bar");
const finishBox = document.getElementById("finish");
const finalScore = document.getElementById("final-score");
const finalRate = document.getElementById("final-rate");
const retryBtn = document.getElementById("retry-btn");
const resultHomeBtn = document.getElementById("result-home-btn");

// ===========================
// 変数
// ===========================
let quizQuestions = [];
let currentQuestion = 0;
let score = 0;
let totalPoints = 0;
let userAnswers = [];
let randomMode = false;
let answerLocked = false;

// ===========================
// 共通関数
// ===========================
function hideAllMenus() {
	homeScreen.classList.add("hidden");
	beginnerMenu.classList.add("hidden");
	intermediateMenu.classList.add("hidden");
}

function returnHome() {
	quizScreen.classList.add("hidden");
	beginnerMenu.classList.add("hidden");
	intermediateMenu.classList.add("hidden");
	finishBox.classList.add("hidden");
	homeScreen.classList.remove("hidden");
}

function isTechnikQuestion(question) {
	return Array.isArray(question.subQuestions) && question.subQuestions.length > 0;
}

function countQuestionPoints(question) {
	return isTechnikQuestion(question) ? question.subQuestions.length : 1;
}

function shuffleArray(array) {
	const copied = [...array];
	for (let i = copied.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[copied[i], copied[j]] = [copied[j], copied[i]];
	}
	return copied;
}

function shuffleSingleQuestion(question) {
	const choices = [...question.choices];
	const correctChoice = choices[question.answer];
	const shuffledChoices = shuffleArray(choices);

	return {
		...question,
		choices: shuffledChoices,
		answer: shuffledChoices.indexOf(correctChoice)
	};
}

function shuffleTechnikQuestion(question) {
	return {
		...question,
		subQuestions: question.subQuestions.map(subQuestion => {
			const choices = [...subQuestion.choices];
			const correctChoice = choices[subQuestion.answer];
			const shuffledChoices = shuffleArray(choices);

			return {
				...subQuestion,
				choices: shuffledChoices,
				answer: shuffledChoices.indexOf(correctChoice)
			};
		})
	};
}

function prepareQuestions(sourceQuestions) {
	let prepared = sourceQuestions.map(question => ({
		...question,
		choices: question.choices ? [...question.choices] : undefined,
		subQuestions: question.subQuestions
			? question.subQuestions.map(subQuestion => ({
				...subQuestion,
				choices: [...subQuestion.choices]
			}))
			: undefined
	}));

	if (randomMode) {
		prepared = shuffleArray(prepared).map(question =>
			isTechnikQuestion(question)
				? shuffleTechnikQuestion(question)
				: shuffleSingleQuestion(question)
		);
	}

	return prepared;
}

// ===========================
// ホーム画面イベント
// ===========================
beginnerBtn.addEventListener("click", () => {
	homeScreen.classList.add("hidden");
	beginnerMenu.classList.remove("hidden");
});

intermediateBtn.addEventListener("click", () => {
	homeScreen.classList.add("hidden");
	intermediateMenu.classList.remove("hidden");
});

backBtn.addEventListener("click", returnHome);
intermediateBackBtn.addEventListener("click", returnHome);

technikBtn.addEventListener("click", () => {
	randomMode = false;
	quizQuestions = prepareQuestions(
		questions.filter(question =>
			question.level === "technik" || question.category === "Technik"
		)
	);
	startQuiz();
});

allBtn.addEventListener("click", () => {
	randomMode = false;
	quizQuestions = prepareQuestions(questions);
	startQuiz();
});

randomBtn.addEventListener("click", () => {
	randomMode = true;
	quizQuestions = prepareQuestions(questions);
	startQuiz();
});

// ===========================
// カテゴリ別出題
// ===========================
function startCategoryQuiz(level, category) {
	randomMode = false;
	quizQuestions = prepareQuestions(
		questions.filter(question =>
			question.level === level && question.category === category
		)
	);
	startQuiz();
}

Object.entries(beginnerCategoryButtons).forEach(([category, button]) => {
	button.addEventListener("click", () => startCategoryQuiz("beginner", category));
});

Object.entries(intermediateCategoryButtons).forEach(([category, button]) => {
	button.addEventListener("click", () => startCategoryQuiz("intermediate", category));
});

// ===========================
// クイズ開始
// ===========================
function startQuiz() {
	if (quizQuestions.length === 0) {
		alert("このモードの問題が見つかりません。questions.jsを確認してください。");
		returnHome();
		return;
	}

	currentQuestion = 0;
	score = 0;
	userAnswers = [];
	answerLocked = false;
	totalPoints = quizQuestions.reduce(
		(total, question) => total + countQuestionPoints(question),
		0
	);

	hideAllMenus();
	quizScreen.classList.remove("hidden");
	finishBox.classList.add("hidden");
	document.querySelector(".quiz-box").classList.remove("hidden");
	progressBar.style.width = "0%";

	const oldList = document.getElementById("result-list");
	if (oldList) oldList.remove();

	showQuestion();
}

// ===========================
// 問題表示
// ===========================
function showQuestion() {
	answerLocked = false;
	const question = quizQuestions[currentQuestion];

	const displayNumber = question.questionNumber || currentQuestion + 1;
	questionNumber.textContent = `問題 ${displayNumber}（${currentQuestion + 1} / ${quizQuestions.length}）`;
	progressBar.style.width = `${((currentQuestion + 1) / quizQuestions.length) * 100}%`;

	questionImage.src = "";
	questionImage.classList.add("hidden");
	if (question.image) {
		questionImage.src = question.image;
		questionImage.classList.remove("hidden");
	}

	questionText.textContent = question.question;
	choicesDiv.innerHTML = "";

	if (isTechnikQuestion(question)) {
		showTechnikChoices(question);
	} else {
		showNormalChoices(question);
	}
}

function showNormalChoices(question) {
	choicesDiv.classList.remove("technik-choices");

	question.choices.forEach((choice, index) => {
		const button = document.createElement("button");
		button.type = "button";
		button.textContent = choice;
		button.classList.add("choice-btn");
		button.dataset.index = index;
		choicesDiv.appendChild(button);
	});
}

function showTechnikChoices(question) {
	choicesDiv.classList.add("technik-choices");

	question.subQuestions.forEach((subQuestion, subIndex) => {
		const group = document.createElement("section");
		group.classList.add("sub-question-group");
		group.dataset.subIndex = subIndex;

		const label = document.createElement("h3");
		label.classList.add("sub-question-label");
		label.textContent = subQuestion.label;
		group.appendChild(label);

		const choiceGrid = document.createElement("div");
		choiceGrid.classList.add("sub-choice-grid");

		subQuestion.choices.forEach((choice, choiceIndex) => {
			const choiceLabel = document.createElement("label");
			choiceLabel.classList.add("sub-choice-label");

			const radio = document.createElement("input");
			radio.type = "radio";
			radio.name = `sub-question-${subIndex}`;
			radio.value = choiceIndex;

			const text = document.createElement("span");
			text.textContent = `${choiceIndex + 1}. ${choice}`;

			choiceLabel.appendChild(radio);
			choiceLabel.appendChild(text);
			choiceGrid.appendChild(choiceLabel);
		});

		group.appendChild(choiceGrid);
		choicesDiv.appendChild(group);
	});

	const submitButton = document.createElement("button");
	submitButton.type = "button";
	submitButton.id = "technik-submit-btn";
	submitButton.classList.add("mode-btn", "technik-submit-btn");
	submitButton.textContent = "回答する";
	submitButton.addEventListener("click", submitTechnikAnswer);
	choicesDiv.appendChild(submitButton);
}

// ===========================
// 通常問題の回答処理
// ===========================
choicesDiv.addEventListener("click", event => {
	const clickedButton = event.target.closest(".choice-btn");
	if (!clickedButton || answerLocked) return;

	const question = quizQuestions[currentQuestion];
	if (isTechnikQuestion(question)) return;

	answerLocked = true;
	const buttons = [...choicesDiv.querySelectorAll(".choice-btn")];
	buttons.forEach(button => {
		button.disabled = true;
	});

	const selected = Number(clickedButton.dataset.index);
	const correctAnswer = question.answer;
	const isCorrect = selected === correctAnswer;

	userAnswers[currentQuestion] = {
		type: "normal",
		selected
	};

	if (isCorrect) {
		score++;
		clickedButton.classList.add("correct-flash");
	} else {
		clickedButton.classList.add("incorrect-flash");
		buttons[correctAnswer].classList.add("correct-flash");
	}

	setTimeout(nextQuestion, isCorrect ? 400 : 2000);
});

// ===========================
// 技術問題の回答処理
// ===========================
function submitTechnikAnswer() {
	if (answerLocked) return;

	const question = quizQuestions[currentQuestion];
	const selectedAnswers = [];

	for (let subIndex = 0; subIndex < question.subQuestions.length; subIndex++) {
		const selectedRadio = choicesDiv.querySelector(
			`input[name="sub-question-${subIndex}"]:checked`
		);

		if (!selectedRadio) {
			alert(`${question.subQuestions[subIndex].label} の答えを選択してください。`);
			return;
		}

		selectedAnswers.push(Number(selectedRadio.value));
	}

	answerLocked = true;
	userAnswers[currentQuestion] = {
		type: "technik",
		selected: selectedAnswers
	};

	let allCorrect = true;

	question.subQuestions.forEach((subQuestion, subIndex) => {
		const group = choicesDiv.querySelector(`[data-sub-index="${subIndex}"]`);
		const labels = [...group.querySelectorAll(".sub-choice-label")];
		const selected = selectedAnswers[subIndex];
		const correct = subQuestion.answer;

		group.querySelectorAll("input").forEach(input => {
			input.disabled = true;
		});

		if (selected === correct) {
			score++;
			labels[selected].classList.add("correct-choice");
		} else {
			allCorrect = false;
			labels[selected].classList.add("incorrect-choice");
			labels[correct].classList.add("correct-choice");
		}
	});

	const submitButton = document.getElementById("technik-submit-btn");
	submitButton.disabled = true;

	setTimeout(nextQuestion, allCorrect ? 700 : 2500);
}

function nextQuestion() {
	currentQuestion++;
	if (currentQuestion < quizQuestions.length) {
		showQuestion();
	} else {
		showResult();
	}
}

// ===========================
// 結果画面
// ===========================
function showResult() {
	document.querySelector(".quiz-box").classList.add("hidden");
	finishBox.classList.remove("hidden");

	finalScore.textContent = `正答数：${score} / ${totalPoints}`;
	const rate = totalPoints > 0 ? Math.round((score / totalPoints) * 100) : 0;
	finalRate.textContent = `正答率：${rate}%`;

	const oldRank = finishBox.querySelector(".rank");
	if (oldRank) oldRank.remove();

	const rank = document.createElement("h2");
	rank.classList.add("rank");

	if (rate === 100) {
		rank.textContent = "🏆 Sランク（パーフェクト！）";
		rank.style.color = "gold";
	} else if (rate >= 90) {
		rank.textContent = "🥇 Aランク（優秀です！）";
		rank.style.color = "#00ff88";
	} else if (rate >= 80) {
		rank.textContent = "🥈 Bランク（合格ライン突破！）";
		rank.style.color = "#00bfff";
	} else if (rate >= 70) {
		rank.textContent = "🥉 Cランク（もう少し頑張りましょう）";
		rank.style.color = "orange";
	} else {
		rank.textContent = "📚 不合格（もう一度挑戦！）";
		rank.style.color = "#ff5555";
	}

	finalRate.insertAdjacentElement("afterend", rank);
	createResultList();
}

function createResultList() {
	const oldList = document.getElementById("result-list");
	if (oldList) oldList.remove();

	const resultList = document.createElement("div");
	resultList.id = "result-list";

	const title = document.createElement("h3");
	title.textContent = "答え合わせ";
	resultList.appendChild(title);

	quizQuestions.forEach((question, index) => {
		const item = document.createElement("div");
		item.classList.add("answer-item");

		const heading = document.createElement("h4");
		heading.textContent = `問題 ${question.questionNumber || index + 1}`;
		item.appendChild(heading);

		if (question.image) {
			const image = document.createElement("img");
			image.src = question.image;
			image.alt = `問題 ${question.questionNumber || index + 1} の画像`;
			item.appendChild(image);
		}

		const text = document.createElement("p");
		text.textContent = question.question;
		item.appendChild(text);

		if (isTechnikQuestion(question)) {
			appendTechnikResult(item, question, userAnswers[index]);
		} else {
			appendNormalResult(item, question, userAnswers[index]);
		}

		resultList.appendChild(item);
	});

	finishBox.appendChild(resultList);
}

function appendNormalResult(item, question, answerData) {
	const selected = answerData?.selected;
	const correct = selected === question.answer;

	const userAnswer = document.createElement("p");
	userAnswer.innerHTML = `あなたの回答：<strong class="${correct ? "result-correct" : "result-incorrect"}">${selected !== undefined ? question.choices[selected] : "未回答"}</strong>`;
	item.appendChild(userAnswer);

	const correctAnswer = document.createElement("p");
	correctAnswer.innerHTML = `正解：<strong class="result-correct">${question.choices[question.answer]}</strong>`;
	item.appendChild(correctAnswer);

	const judgment = document.createElement("p");
	judgment.classList.add("result-judgment", correct ? "result-correct" : "result-incorrect");
	judgment.textContent = correct ? "⭕ 正解" : "❌ 不正解";
	item.appendChild(judgment);
}

function appendTechnikResult(item, question, answerData) {
	const selectedAnswers = answerData?.selected || [];

	question.subQuestions.forEach((subQuestion, subIndex) => {
		const selected = selectedAnswers[subIndex];
		const correct = selected === subQuestion.answer;

		const subResult = document.createElement("div");
		subResult.classList.add("sub-result");

		const label = document.createElement("h5");
		label.textContent = subQuestion.label;
		subResult.appendChild(label);

		const userAnswer = document.createElement("p");
		userAnswer.innerHTML = `あなたの回答：<strong class="${correct ? "result-correct" : "result-incorrect"}">${selected !== undefined ? subQuestion.choices[selected] : "未回答"}</strong>`;
		subResult.appendChild(userAnswer);

		const correctAnswer = document.createElement("p");
		correctAnswer.innerHTML = `正解：<strong class="result-correct">${subQuestion.choices[subQuestion.answer]}</strong>`;
		subResult.appendChild(correctAnswer);

		const judgment = document.createElement("p");
		judgment.classList.add("result-judgment", correct ? "result-correct" : "result-incorrect");
		judgment.textContent = correct ? "⭕ 正解" : "❌ 不正解";
		subResult.appendChild(judgment);

		item.appendChild(subResult);
	});
}

retryBtn.addEventListener("click", () => {
	quizQuestions = prepareQuestions(quizQuestions);
	startQuiz();
});

resultHomeBtn.addEventListener("click", returnHome);
