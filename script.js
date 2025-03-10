const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const restartBtn = document.getElementById("restartBtn");
const scoreDisplay = document.getElementById("score");

canvas.width = 400;
canvas.height = 600;

// تحميل الصور
const birdImg = new Image();
birdImg.src = "face.png"; 

const bgImg = new Image();
bgImg.src = "BG.png"; 

const pipeImg = new Image();
pipeImg.src = "Wall.png"; 

// تحميل الأصوات
const jumpSound = new Audio("maro-jump.mp3");
const hitSound = new Audio("deth.mp3"); // صوت خفيف عند الاصطدام
const laughSound = new Audio("bahgat-laugh.mp3");
const backgroundMusic = new Audio("song.mp3");
const passSound = new Audio("helw.mp3"); // صوت عند تجاوز أي جدار

backgroundMusic.loop = true; 
backgroundMusic.volume = 0.2; 
jumpSound.volume = 0.1; 
hitSound.volume = 0.3; 
passSound.volume = 0.3; 

let bird = { x: 50, y: 150, width: 40, height: 40, velocityY: 0 };
let gravity = 0.5;
let jumpPower = -8;
let pipes = [];
let pipeWidth = 90; // تكبير الحائط
let pipeGap = 160; // زيادة الفجوة قليلاً
let pipeSpeed = 2;
let gameActive = true;
let score = 0;

// رسم الخلفية
function drawBackground() {
    ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
}

// رسم اللاعب
function drawBird() {
    ctx.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
}

// رسم الحواجز
function drawPipes() {
    pipes.forEach(pipe => {
        ctx.drawImage(pipeImg, pipe.x, pipe.top - pipeImg.height, pipeWidth, pipeImg.height);
        ctx.drawImage(pipeImg, pipe.x, pipe.top + pipeGap, pipeWidth, pipeImg.height);
    });
}

// تحديث حركة اللاعب
function updateBird() {
    if (!gameActive) return;
    bird.velocityY += gravity;
    bird.y += bird.velocityY;
    if (bird.y + bird.height >= canvas.height || bird.y <= 0) {
        endGame();
    }
}

// تحديث حركة الحواجز
function updatePipes() {
    if (!gameActive) return;

    pipes.forEach(pipe => {
        pipe.x -= pipeSpeed;
    });

    if (pipes.length === 0 || pipes[pipes.length - 1].x < canvas.width - 200) {
        let pipeTop = Math.floor(Math.random() * (canvas.height - pipeGap - 50)) + 30;
        pipes.push({ x: canvas.width, top: pipeTop });
    }

    if (pipes.length > 0 && pipes[0].x + pipeWidth < 0) {
        pipes.shift();
        score++;
        scoreDisplay.textContent = score;

        // تشغيل صوت عند تجاوز الجدار
        passSound.currentTime = 0;
        passSound.play();

        // تشغيل صوت الضحك عند 5 نقاط
        if (score === 5) {
            laughSound.currentTime = 0;
            laughSound.play();
        }
    }

    pipes.forEach(pipe => {
        if (checkCollision(bird, pipe)) {
            endGame();
        }
    });
}

// التحقق من الاصطدام عند لمس الحائط مباشرة
function checkCollision(bird, pipe) {
    let birdRight = bird.x + bird.width;
    let birdLeft = bird.x;
    let birdTop = bird.y;
    let birdBottom = bird.y + bird.height;

    let pipeRight = pipe.x + pipeWidth;
    let pipeLeft = pipe.x;
    let pipeTop = pipe.top;
    let pipeBottom = pipe.top + pipeGap;

    return (
        birdRight > pipeLeft &&
        birdLeft < pipeRight &&
        (birdTop < pipeTop || birdBottom > pipeBottom)
    );
}

// إنهاء اللعبة
function endGame() {
    gameActive = false;
    hitSound.currentTime = 0;
    hitSound.play(); // تشغيل صوت الاصطدام
    stopBackgroundMusic(); // إيقاف صوت الخلفية
    restartBtn.style.display = "block";
}

// تشغيل صوت الخلفية عند بدء اللعبة
function startBackgroundMusic() {
    backgroundMusic.play().catch(error => console.log("خطأ في تشغيل الصوت:", error));
}

// إيقاف صوت الخلفية عند الخسارة
function stopBackgroundMusic() {
    backgroundMusic.pause();
    backgroundMusic.currentTime = 0;
}

// إعادة تشغيل اللعبة
function restartGame() {
    bird.y = 150;
    bird.velocityY = 0;
    pipes = [];
    score = 0;
    scoreDisplay.textContent = score;
    gameActive = true;
    restartBtn.style.display = "none";

    jumpSound.pause();
    jumpSound.currentTime = 0;
    hitSound.pause();
    hitSound.currentTime = 0;
    laughSound.pause();
    laughSound.currentTime = 0;
    passSound.pause();
    passSound.currentTime = 0;

    // تشغيل صوت الخلفية
    startBackgroundMusic();
}

// التحكم باللعبة عبر اللمس
canvas.addEventListener("click", () => {
    if (gameActive) {
        bird.velocityY = jumpPower;
        jumpSound.currentTime = 0;
        jumpSound.play();
    }
});

// التحكم باللعبة عبر لوحة المفاتيح
document.addEventListener("keydown", (event) => {
    if ((event.code === "Space" || event.code === "ArrowUp") && gameActive) {
        bird.velocityY = jumpPower;
        jumpSound.currentTime = 0;
        jumpSound.play();
    }
});

restartBtn.addEventListener("click", restartGame);

// التأكد من تشغيل الصوت عند أول تفاعل مع المستخدم
document.addEventListener("click", startBackgroundMusic, { once: true });
document.addEventListener("keydown", startBackgroundMusic, { once: true });

// تشغيل اللعبة
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();
    drawBird();
    drawPipes();
    updateBird();
    updatePipes();
    requestAnimationFrame(gameLoop);
}

gameLoop();