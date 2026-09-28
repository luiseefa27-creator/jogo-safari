// --- ESTADO GLOBAL ---
let score = 0;

// --- NAVEGAÇÃO DE ABAS ---
function switchTab(tabName, btnElement) {
  document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));

  document.getElementById(`tab-${tabName}`).classList.add('active');
  btnElement.classList.add('active');

  if (tabName === 'pintar') initCanvas();
}

// --- PONTUAÇÃO & MEDALHAS ---
function addPoints(amount) {
  score += amount;
  document.getElementById('score-display').innerText = score;
  checkBadges();
}

// Fala o nome do bichinho ao clicar
function speakAnimal(name) {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(`Este é o ${name}!`);
    utterance.lang = 'pt-BR';
    speechSynthesis.speak(utterance);
  }
}

// --- JOGO 1: MEMÓRIA ---
const memoryIcons = ['🦁', '🦒', '🐘', '🐒'];
let memoryCards = [];
let flippedCards = [];
let matchedPairs = 0;

function initMemoryGame() {
  const board = document.getElementById('memory-board');
  board.innerHTML = '';
  flippedCards = [];
  matchedPairs = 0;

  memoryCards = [...memoryIcons, ...memoryIcons].sort(() => Math.random() - 0.5);

  memoryCards.forEach((icon, index) => {
    const card = document.createElement('div');
    card.classList.add('memory-card');
    card.dataset.icon = icon;
    card.dataset.index = index;
    card.innerText = '❓';
    card.onclick = flipCard;
    board.appendChild(card);
  });
}

function flipCard() {
  if (flippedCards.length < 2 && !this.classList.contains('flipped')) {
    this.classList.add('flipped');
    this.innerText = this.dataset.icon;
    flippedCards.push(this);

    if (flippedCards.length === 2) {
      setTimeout(checkMemoryMatch, 600);
    }
  }
}

function checkMemoryMatch() {
  const [card1, card2] = flippedCards;

  if (card1.dataset.icon === card2.dataset.icon) {
    matchedPairs++;
    flippedCards = [];
    addPoints(10);

    if (matchedPairs === memoryIcons.length) {
      triggerCongrats('Você achou todos os pares safari! +40 pontos!');
    }
  } else {
    card1.classList.remove('flipped');
    card2.classList.remove('flipped');
    card1.innerText = '❓';
    card2.innerText = '❓';
    flippedCards = [];
  }
}

// --- JOGO 2: QUIZ ---
const quizData = [
  { question: "Qual animal tem o pescoço comprido?", options: ["🦁 Leão", "🦒 Girafa", "🐘 Elefante"], correct: 1 },
  { question: "Quem é conhecido como o Rei da Selva?", options: ["🦁 Leão", "🐒 Macaco", "🦒 Girafa"], correct: 0 },
  { question: "Qual bicho ama comer bananas?", options: ["🐘 Elefante", "🐒 Macaco", "🦁 Leão"], correct: 1 }
];
let currentQuiz = 0;

function loadQuiz() {
  const q = quizData[currentQuiz];
  document.getElementById('quiz-question').innerText = q.question;
  const optionsDiv = document.getElementById('quiz-options');
  optionsDiv.innerHTML = '';

  q.options.forEach((opt, idx) => {
    const btn = document.createElement('button');
    btn.className = 'quiz-opt-btn';
    btn.innerText = opt;
    btn.onclick = () => {
      if (idx === q.correct) {
        addPoints(20);
        triggerCongrats("Acertou em cheio! +20 pontos!");
        currentQuiz = (currentQuiz + 1) % quizData.length;
        loadQuiz();
      } else {
        alert("Quase! Tente outro bichinho! 🐾");
      }
    };
    optionsDiv.appendChild(btn);
  });
}

// --- JOGO 3: QUEM FAZ ESSE SOM? ---
const soundQuestions = [
  { hint: "Rrrrroaarrr! Eu tenho uma juba linda!", correct: "🦁 Leão", options: ["🐘 Elefante", "🦁 Leão", "🐒 Macaco"] },
  { hint: "Uu-uu-aa-aa! Adoro pular nos galhos!", correct: "🐒 Macaco", options: ["🐒 Macaco", "🦒 Girafa", "🦁 Leão"] },
  { hint: "Fuuu-uuu! Eu tenho uma tromba gigante!", correct: "🐘 Elefante", options: ["🦒 Girafa", "🐘 Elefante", "🐒 Macaco"] }
];
let currentSoundIdx = 0;

function playSoundHint() {
  const hintText = soundQuestions[currentSoundIdx].hint;
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(hintText);
    utterance.lang = 'pt-BR';
    speechSynthesis.speak(utterance);
  } else {
    alert(hintText);
  }
}

function loadSoundGame() {
  const q = soundQuestions[currentSoundIdx];
  const container = document.getElementById('sound-options');
  container.innerHTML = '';

  q.options.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'btn-sound-opt';
    btn.innerText = opt;
    btn.onclick = () => {
      if (opt === q.correct) {
        addPoints(15);
        triggerCongrats("Incrível! Você reconheceu o bicho! +15 pts");
        currentSoundIdx = (currentSoundIdx + 1) % soundQuestions.length;
        loadSoundGame();
      } else {
        alert("Esse som não é desse bicho! Tente de novo! 🎧");
      }
    };
    container.appendChild(btn);
  });
}

// --- CANVAS DE DESENHAR ---
let canvas, ctx, isDrawing = false, currentColor = '#4a3f35';

function initCanvas() {
  canvas = document.getElementById('paint-canvas');
  ctx = canvas.getContext('2d');
  
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';

  canvas.onmousedown = startDraw;
  canvas.onmousemove = draw;
  canvas.onmouseup = stopDraw;

  canvas.ontouchstart = (e) => { startDraw(e.touches[0]); };
  canvas.ontouchmove = (e) => { draw(e.touches[0]); e.preventDefault(); };
  canvas.ontouchend = stopDraw;
}

function setCanvasColor(color, el) {
  currentColor = color;
  document.querySelectorAll('.color-dot').forEach(dot => dot.classList.remove('active'));
  el.classList.add('active');
}

function startDraw(e) {
  isDrawing = true;
  ctx.beginPath();
  const rect = canvas.getBoundingClientRect();
  ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
}

function draw(e) {
  if (!isDrawing) return;
  const rect = canvas.getBoundingClientRect();
  ctx.strokeStyle = currentColor;
  ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
  ctx.stroke();
}

function stopDraw() { isDrawing = false; }
function clearCanvas() { ctx.clearRect(0, 0, canvas.width, canvas.height); }

// --- TAREFAS DIÁRIAS ---
const tasks = [
  { id: 1, text: "Beber um copo de água 💧", pts: 10, done: false },
  { id: 2, text: "Guardar os brinquedos 🧸", pts: 15, done: false },
  { id: 3, text: "Comer uma fruta bem gostosa 🍎", pts: 10, done: false },
  { id: 4, text: "Escovar os dentes 🪥", pts: 10, done: false }
];

function renderTasks() {
  const list = document.getElementById('task-list');
  list.innerHTML = '';
  let completedCount = 0;

  tasks.forEach(t => {
    if (t.done) completedCount++;
    const li = document.createElement('li');
    li.className = `task-item ${t.done ? 'completed' : ''}`;
    li.innerHTML = `
      <span>${t.text} (+${t.pts} pts)</span>
      <button class="btn-primary" ${t.done ? 'disabled' : ''} onclick="completeTask(${t.id})">
        ${t.done ? 'Concluído! ✔️' : 'Fiz! ✨'}
      </button>
    `;
    list.appendChild(li);
  });

  const percent = Math.round((completedCount / tasks.length) * 100);
  const fill = document.getElementById('task-progress-fill');
  fill.style.width = `${percent}%`;
  fill.innerText = `${percent}%`;
}

function completeTask(id) {
  const task = tasks.find(t => t.id === id);
  if (task && !task.done) {
    task.done = true;
    addPoints(task.pts);
    renderTasks();
    triggerCongrats(`Incrível! Você cumpriu a missão: "${task.text}"!`);
  }
}

// --- SELOS & RECOMPENSAS ---
const badges = [
  { minPoints: 20, icon: "🌱", title: "Explorador Iniciante" },
  { minPoints: 50, icon: "🦁", title: "Amigo do Leão" },
  { minPoints: 100, icon: "🦒", title: "Super Observador" },
  { minPoints: 150, icon: "👑", title: "Mestre do Safari" }
];

function checkBadges() {
  const container = document.getElementById('badges-grid');
  container.innerHTML = '';

  badges.forEach(b => {
    const isUnlocked = score >= b.minPoints;
    const card = document.createElement('div');
    card.className = `badge-card ${isUnlocked ? 'unlocked' : ''}`;
    card.innerHTML = `
      <div class="badge-icon">${b.icon}</div>
      <div class="badge-title">${b.title}</div>
      <small>${isUnlocked ? 'Desbloqueado!' : `${b.minPoints} pts`}</small>
    `;
    container.appendChild(card);
  });
}

// --- EFEITO DE CONFETES & MODAL ---
function triggerCongrats(msg) {
  document.getElementById('modal-message').innerText = msg;
  document.getElementById('congrats-modal').style.display = 'flex';
  launchConfetti();
}

function closeModal() {
  document.getElementById('congrats-modal').style.display = 'none';
}

function launchConfetti() {
  const canvas = document.getElementById('confetti-canvas');
  const cCtx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const pieces = Array.from({ length: 40 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height - canvas.height,
    size: Math.random() * 10 + 5,
    color: ['#ffb3ba', '#bae1ff', '#baffc9', '#ffffba', '#ffdfba'][Math.floor(Math.random() * 5)],
    speed: Math.random() * 3 + 2
  }));

  let frame = 0;
  function animate() {
    cCtx.clearRect(0, 0, canvas.width, canvas.height);
    pieces.forEach(p => {
      p.y += p.speed;
      cCtx.fillStyle = p.color;
      cCtx.beginPath();
      cCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      cCtx.fill();
    });

    if (frame++ < 100) requestAnimationFrame(animate);
    else cCtx.clearRect(0, 0, canvas.width, canvas.height);
  }
  animate();
}

// --- INICIALIZAÇÃO ---
window.onload = () => {
  initMemoryGame();
  loadQuiz();
  loadSoundGame();
  renderTasks();
  checkBadges();
};