const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 400;
canvas.height = 300;

let player = { x: 50, y: 150, width: 20, height: 20, velocityY: 0, gravity: 0.5 };
let obstacle = { x: 400, y: 150, width: 20, height: 20, speed: 3 };
let score = 0;
let gameOver = false;
let gameStarted = false;
let gameTime = 0;
let floatingTexts = [];
let doubleJumpActive = false;
let canDoubleJump = false;
let mountainOffset = 0; // Controle do deslocamento das montanhas
let inverted = false;
let screenNarrow = false;
let powerUps = [];
let nextNarrowTrigger = Math.floor(Math.random() * 10) + 10;

document.addEventListener("mousedown", function () {

    if (gameOver) {
        resetGame();
        return;
    }

    if ((!inverted && player.y === 150) || (inverted && player.y === 150)) {
        player.velocityY = inverted ? 8 : -8;
        canDoubleJump = true;
    } else if (doubleJumpActive && canDoubleJump) {
        player.velocityY = inverted ? 8 : -8;
        canDoubleJump = false;
    }
});

// Mantém a opção de reiniciar o jogo ao clicar no canvas
canvas.addEventListener("click", function () {
    if (gameOver) {
        resetGame();
    }
});

// Função para desenhar a tela inicial
function drawStartScreen() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "white";
    ctx.font = "30px Impact";
    ctx.fillText("MOUSE PARA PULAR", canvas.width / 2 - 115, canvas.height / 4);

    ctx.font = "20px Trebuchet MS";
    ctx.fillText(">Insira um nome abaixo<", canvas.width / 2 - 110, canvas.height / 2.5 - 10);

    ctx.fillStyle = "rgba(255, 255, 0, 1";
    ctx.font = "13px Trebuchet MS";
    ctx.fillText("Pontos amarelos alteram a velocidade temporariamente", canvas.width / 2 - 160, canvas.height / 2 + 80);

    ctx.fillStyle = "rgba(0, 200, 255, 1";
    ctx.font = "13px Trebuchet MS";
    ctx.fillText("Pontos azuis dão pulo duplo temporariamente", canvas.width / 2 - 160, canvas.height / 2 + 100);
}

//grama frases
const phrases = [
    "Vai trabalhar, Thais!",
    "Cinema mudo, o olhar diz tudo.",
    "Calado vence.",
    "Não importa a casquinha, o recheio tem que ser bom.",
    "Vota com a legenda!",
    "Quem comeu, comeu.",
    "Eu não tenho microfone.",
    "Anuncie com a gente!",
    "Quem comanda a Seraphis?",
    "Tem que fazer o desenho do dia das bruxas, ela já tá chegando mesmo.",
    "E aí, como tá o jogo?",
    "Tá seguindo a NEDqueta?",
    "Oferecimento PUC Minas Presencial",
];

function spawnFloatingText() {
    const phrase = phrases[Math.floor(Math.random() * phrases.length)];
    const minY = canvas.height * 0.8; // Ajustado para evitar problemas
    const maxY = canvas.height - 50;
    const yPosition = Math.random() * (maxY - minY) + minY;

    floatingTexts.push({ x: canvas.width, y: yPosition, text: phrase });
}

function updateFloatingTexts() {
    for (let i = 0; i < floatingTexts.length; i++) {
        floatingTexts[i].x -= 2; // Velocidade de deslocamento
    }

    floatingTexts = floatingTexts.filter(text => text.x + ctx.measureText(text.text).width > -50); // Melhor remoção
}

function drawFloatingTexts() {
    ctx.fillStyle = "Black";
    ctx.font = "16px Consolas";
    for (let text of floatingTexts) {
        ctx.fillText(text.text, text.x, text.y);
    }
}

// Adiciona uma nova frase a cada 5 segundos
setInterval(spawnFloatingText, 5000);

// Atualiza o tempo continuamente
setInterval(() => {
    gameTime += 0.02; // Ajuste esse valor para alterar a velocidade da transição
}, 100);

// Função que calcula a cor do céu baseado no tempo do jogo
function getSkyColor() {
    let timeFactor = (Math.sin(gameTime) + 1) / 2; // Oscila entre 0 e 1

    let startColor = { r: 135, g: 206, b: 250 }; // Azul claro (dia)
    let endColor = { r: 25, g: 25, b: 112 }; // Azul escuro (noite)

    let r = Math.floor(startColor.r + (endColor.r - startColor.r) * timeFactor);
    let g = Math.floor(startColor.g + (endColor.g - startColor.g) * timeFactor);
    let b = Math.floor(startColor.b + (endColor.b - startColor.b) * timeFactor);

    return `rgb(${r},${g},${b})`;
}

const clouds = [];

function spawnCloud() {
    const cloud = {
        x: canvas.width,
        y: Math.random() * 80,
        width: 40 + Math.random() * 30,
        height: 20 + Math.random() * 10,
        speed: 0.5 + Math.random() * 1.5
    };
    clouds.push(cloud);
}

setInterval(spawnCloud, 3000);

function updateClouds() {
    clouds.forEach((cloud, index) => {
        cloud.x -= cloud.speed;
        if (cloud.x + cloud.width < 0) {
            clouds.splice(index, 1);
        }
    });
}

function drawClouds() {
    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
    clouds.forEach(cloud => {
        ctx.beginPath();
        ctx.arc(cloud.x, cloud.y, cloud.width / 3, 0, Math.PI * 2);
        ctx.arc(cloud.x + cloud.width / 3, cloud.y - 5, cloud.width / 3, 0, Math.PI * 2);
        ctx.arc(cloud.x + (2 * cloud.width) / 3, cloud.y, cloud.width / 3, 0, Math.PI * 2);
        ctx.fill();
    });
}

function drawSignature() {
    ctx.fillStyle = "black";
    ctx.font = "12px Consolas";
    ctx.fillText("Feito por H3yko", canvas.width - 180, canvas.height - 10);
}

const mountainSpeed = 1; // Velocidade do efeito de paralaxe

function drawMountains() {
    ctx.save();

    if (inverted) {
        ctx.translate(0, canvas.height);
        ctx.scale(1, -1);
    }

    ctx.fillStyle = "#8B4513"; // Cor marrom para as montanhas

    for (let i = -1; i < 3; i++) { // Desenhamos montanhas extras para cobrir toda a tela
        let xOffset = i * 200 + mountainOffset;

        // Montanha 1
        ctx.beginPath();
        ctx.moveTo(xOffset, 170);
        ctx.lineTo(xOffset + 100, 90);
        ctx.lineTo(xOffset + 200, 170);
        ctx.closePath();
        ctx.fill();

        // Montanha 2
        ctx.beginPath();
        ctx.moveTo(xOffset + 150, 170);
        ctx.lineTo(xOffset + 250, 70);
        ctx.lineTo(xOffset + 350, 170);
        ctx.closePath();
        ctx.fill();

        // Montanha 3
        ctx.beginPath();
        ctx.moveTo(xOffset + 300, 170);
        ctx.lineTo(xOffset + 400, 110);
        ctx.lineTo(xOffset + 500, 170);
        ctx.closePath();
        ctx.fill();
    }

    ctx.restore();
}

function updateMountains() {
    mountainOffset -= mountainSpeed; // Move as montanhas para a esquerda
    if (mountainOffset <= -200) {
        mountainOffset = 0; // Reseta quando a primeira montanha sair da tela
    }
}

function spawnPowerUp() {
    let y = Math.random() * 20 + (inverted ? 150 : 130);

    const powerUpType = Math.random() < 0.5 ? "boost" : "doubleJump"; // 50% chance de ser azul ou amarelo

    const powerUp = {
        x: canvas.width,
        y: y,
        width: 10,
        height: 10,
        type: powerUpType,
        duration: 10000, // Duração de x/1000 segundos
        speed: 3
    };
    powerUps.push(powerUp);
}

// Exemplo usando setInterval para spawnar a cada x/1000 segundos:
setInterval(() => {
    if (!gameOver) spawnPowerUp();
}, 30000);


function update() {
if (gameOver) {
    return;
}


    updateClouds(); // Atualiza o movimento das núvens
    updateMountains(); // Atualiza o movimento das montanhas

    updateFloatingTexts()

    // Atualiza o jogador
    player.velocityY += inverted ? -player.gravity : player.gravity;
    player.y += player.velocityY;

    if (!inverted && player.y > 150) {
        player.y = 150;
        player.velocityY = 0;
    }
    if (inverted && player.y < 150) {
        player.y = 150;
        player.velocityY = 0;
    }

    // Atualiza o obstáculo
    obstacle.x -= obstacle.speed;
    if (obstacle.x < -20) {
        obstacle.x = 400;
        score += 1;

        if (score % 5 === 0) {
            obstacle.speed += 0.5;
        }

        if (score % 10 === 0 && score >= nextNarrowTrigger && !screenNarrow) {
            screenNarrow = true;
            canvas.width = 250;
            setTimeout(() => {
                screenNarrow = false;
                canvas.width = 400;
                nextNarrowTrigger = score + Math.floor(Math.random() * 10) + 10;
            }, 5000);
        }
    }

    // Eventos de power-up: mover e detectar colisões
    powerUps.forEach((powerUp, index) => {
        // Mover o power-up para a esquerda (mesma lógica do obstáculo, por exemplo)
        powerUp.x -= powerUp.speed;

        // Remover se sair da tela
        if (powerUp.x < -powerUp.width) {
            powerUps.splice(index, 1);
        }

        // Detectar colisão com o jogador
        if (
            player.x < powerUp.x + powerUp.width &&
            player.x + player.width > powerUp.x &&
            player.y < powerUp.y + powerUp.height &&
            player.y + player.height > powerUp.y
        ) {
            // Ativa o efeito do power-up
            activatePowerUp(powerUp);
            // Remove o power-up coletado
            powerUps.splice(index, 1);
        }
    });

    // Outras lógicas (mudança de velocidades, inversão, etc.)
    if (score === 100) obstacle.speed = 2; //velocidade
    if (score === 120) obstacle.speed = 5;
    if (score === 50) inverted = true;  //inversão
    if (score === 60) inverted = false;
    if (score === 20) inverted = true; //inversão
    if (score === 25) inverted = false;
    if (score === 125) inverted = true; //inversão
    if (score === 135) inverted = false;
    if (score === 150) obstacle.speed = 2; //velocidade
    if (score === 165) obstacle.speed = 5;

    // Detecta colisão com o obstáculo
    if (
        player.x < obstacle.x + obstacle.width &&
        player.x + player.width > obstacle.x &&
        player.y < obstacle.y + obstacle.height &&
        player.y + player.height > obstacle.y
    ) {
        gameOver = true;
    }
}

function activatePowerUp(powerUp) {
    // Criação do indicador de texto
    const indicator = document.createElement("div");
    indicator.innerText = powerUp.type === "boost" ? "VELOCIDADE ALTERADA!" : "PULO DUPLO ATIVO!";
    indicator.style.position = "absolute";
    indicator.style.top = "50px";
    indicator.style.right = "10px";
    indicator.style.backgroundColor = powerUp.type === "boost" ? "rgba(255, 255, 0, 0.7)" : "rgba(0, 0, 255, 0.7)";
    indicator.style.color = "white";
    indicator.style.padding = "18px 22px";
    indicator.style.borderRadius = "4px";
    indicator.style.zIndex = "1000";

    document.body.appendChild(indicator);

    // Criação da barra de tempo
    let barContainer = document.createElement("div");
    let bar = document.createElement("div");

    // Estilização do contêiner da barra
    barContainer.style.position = "absolute";
    barContainer.style.top = "120px";
    barContainer.style.right = "10px";
    barContainer.style.width = "150px";
    barContainer.style.height = "10px";
    barContainer.style.backgroundColor = "rgba(255, 255, 255, 0.3)";
    barContainer.style.border = "1px solid white";
    barContainer.style.borderRadius = "5px";
    barContainer.style.overflow = "hidden";

    // Estilização da barra de progresso
    bar.style.width = "100%";
    bar.style.height = "100%";
    bar.style.backgroundColor = powerUp.type === "boost" ? "yellow" : "blue";

    barContainer.appendChild(bar);
    document.body.appendChild(barContainer);

    let duration = powerUp.duration;
    let startTime = Date.now();

    function updateBar() {
        let elapsedTime = Date.now() - startTime;
        let percentage = Math.max(0, 100 - (elapsedTime / duration) * 100);
        bar.style.width = percentage + "%";

        if (percentage > 0) {
            requestAnimationFrame(updateBar);
        } else {
            barContainer.remove(); // Remove a barra quando o tempo acabar
        }
    }

    requestAnimationFrame(updateBar);

    // Power-up específico
    if (powerUp.type === "boost") {
        const originalSpeed = obstacle.speed;
        const randomSpeed = Math.floor(Math.random() * (9 - 2 + 1)) + 2;
        obstacle.speed = randomSpeed;

        setTimeout(() => {
            obstacle.speed = originalSpeed;
            barContainer.remove();
            indicator.remove();  // Remove o indicador de texto após o power-up expirar
        }, powerUp.duration);
    } else if (powerUp.type === "doubleJump") {
        doubleJumpActive = true;
        canDoubleJump = true;

        setTimeout(() => {
            doubleJumpActive = false;
            canDoubleJump = false;
            barContainer.remove();
            indicator.remove();  // Remove o indicador de texto após o power-up expirar
        }, powerUp.duration);
    }
}

function draw() {
    ctx.fillStyle = getSkyColor();
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Desenha o fundo com as montanhas e núvens
    drawClouds();
    drawMountains();


    // Desenha o fundo da plataforma (terra ou grama)
    ctx.fillStyle = "green";
    if (inverted) {
        ctx.fillRect(0, 0, canvas.width, 150);

    } else {
        ctx.fillRect(0, 170, canvas.width, canvas.height - 170);

    }

    drawFloatingTexts();

    // Desenha o obstáculo como um triângulo com contorno vermelho
    ctx.fillStyle = "black"; // Cor de preenchimento do triângulo (você pode mudar se quiser)
    ctx.beginPath();

    if (inverted) {
        // Triângulo invertido (cabeça para baixo)
        ctx.moveTo(obstacle.x, obstacle.y); // Ponto do topo invertido (ajustado)
        ctx.lineTo(obstacle.x + obstacle.width, obstacle.y); // Base direita invertida
        ctx.lineTo(obstacle.x + obstacle.width / 2, obstacle.y + obstacle.height); // Ponto do topo invertido
    } else {
        // Triângulo normal (base para baixo)
        ctx.moveTo(obstacle.x, obstacle.y + obstacle.height); // Base esquerda do triângulo
        ctx.lineTo(obstacle.x + obstacle.width, obstacle.y + obstacle.height); // Base direita
        ctx.lineTo(obstacle.x + obstacle.width / 2, obstacle.y); // Ponto do topo
    }

    ctx.closePath();
    ctx.fill(); // Preenche o triângulo
    ctx.lineWidth = 2; // Define a espessura do contorno
    ctx.strokeStyle = "red"; // Cor do contorno
    ctx.stroke(); // Aplica o contorno vermelho


    // Desenha o jogador
    ctx.save();
    ctx.translate(player.x + player.width / 2, player.y + player.height / 2);
    ctx.fillStyle = "red";
    ctx.beginPath();
    ctx.arc(0, 0, player.width / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "black";
    ctx.stroke();
    ctx.restore();

    // Desenha o nickname
    if (nickname) {
        ctx.fillStyle = "gold";
        ctx.font = "12px Consolas";
        ctx.fillText(nickname, player.x - player.width / 2, player.y - player.height / 2 - 2); // Ajuste a posição conforme necessário
    }

    powerUps.forEach((powerUp) => {
        ctx.fillStyle = powerUp.type === "boost" ? "yellow" : "blue";
        ctx.fillRect(powerUp.x, powerUp.y, powerUp.width, powerUp.height);
    });

    // Define as cores de preenchimento e contorno
    ctx.fillStyle = "white";
    ctx.strokeStyle = "black";  // Cor do contorno
    ctx.lineWidth = 2;  // Largura do contorno

    // Define a fonte
    ctx.font = "20px Consolas";

    // Desenha o contorno
    ctx.strokeText(`Pontuação: ${score}`, 20, 30);
    ctx.strokeText(`Velocidade: ${obstacle.speed.toFixed(1)}`, 20, 60);

    // Desenha o preenchimento do texto
    ctx.fillText(`Pontuação: ${score}`, 20, 30);
    ctx.fillText(`Velocidade: ${obstacle.speed.toFixed(1)}`, 20, 60);

    drawSignature();

    if (gameOver) {
        drawGameOverScreen();
    }
}

// Variáveis para a imagem e áudio
const susImage = new Image();
susImage.src = "sus.png"; // Caminho da imagem
const toAudio = new Audio();
toAudio.src = "to.mp3"; // Caminho do áudio
const seFudeu = new Audio();
seFudeu.src = "se-fudeu-gta.mp3" //Caminho do áudio da morte
let seFudeuTocado = false;

function drawGameOverScreen() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "red";
    ctx.font = "40px Impact";
    ctx.fillText("SE FUDEU!!!!", canvas.width / 2 - 95, canvas.height / 2 - 20);
    if (!seFudeuTocado) {
        seFudeu.play()
        seFudeu.volume = 0.5
        seFudeuTocado = true; // Marca que o áudio já foi tocado
    }
    backgroundMusic.pause(); // Para a música ao morrer
    backgroundMusic.currentTime = 0; // Reinicia a música para o início




    ctx.fillStyle = "white";
    ctx.font = "20px Trebuchet MS";
    ctx.fillText("Clique para reiniciar", canvas.width / 2 - 95, canvas.height / 2 + 50);

    // Criar e exibir um aviso semelhante ao do power-up
    const scoreIndicator = document.createElement("div");
    scoreIndicator.innerText = `PONTUAÇÃO FINAL: ${score}`;
    scoreIndicator.style.position = "absolute";
    scoreIndicator.style.top = "10px";
    scoreIndicator.style.left = "50%";
    scoreIndicator.style.transform = "translateX(-50%)";
    scoreIndicator.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
    scoreIndicator.style.color = "white";
    scoreIndicator.style.padding = "18px 22px";
    scoreIndicator.style.borderRadius = "4px";
    scoreIndicator.style.zIndex = "1000"; // Mantém acima de outros elementos
    scoreIndicator.style.fontSize = "20px";
    scoreIndicator.style.fontWeight = "bold";

    // Adicionar à página
    document.body.appendChild(scoreIndicator);

    // Verificar se o jogador atingiu 100 pontos
    /*if (score >= 100) {
        // Tocar o áudio
        toAudio.play();

        // Desenhar a imagem de fundo
        ctx.drawImage(susImage, 0, 0, canvas.width, canvas.height);
    }*/
}

function resetGame() {
    player.y = 150;
    obstacle.x = 400;
    obstacle.speed = 3;
    score = 0;
    gameOver = false;
    inverted = false;
    screenNarrow = false;
    canvas.width = 400;
    nextNarrowTrigger = Math.floor(Math.random() * 10) + 10;
    seFudeuTocado = false;
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
    backgroundMusic.play();

}

// Criar um objeto de áudio para a música de fundo
const backgroundMusic = new Audio("musica.mp3"); // Caminho para o arquivo de música

backgroundMusic.volume = 0.005; // Define o volume (de 0 a 1)
backgroundMusic.loop = true;  // Ativa o loop infinito

// Tocar a música quando o jogo iniciar
backgroundMusic.play().catch(error => {
    console.log("A reprodução automática foi bloqueada pelo navegador. Clique na tela para ativar a música.");
});

document.addEventListener("click", function startMusic(event) {
    // Verifica se o clique não foi dentro do campo de input ou de elementos relacionados à interação com o jogo
    if (!document.getElementById('nickname').contains(event.target) && !gameStarted) {
        backgroundMusic.play();
        document.removeEventListener("click", startMusic); // Remove o evento após iniciar
    }
});

let nickname = ""; // Variável para armazenar o nickname

document.addEventListener("click", function startGame(event) {
    // Verifica se o clique não foi dentro do campo de input
    if (!document.getElementById('nickname').contains(event.target) && !gameStarted) {
        gameStarted = true;
        nickname = document.getElementById('nickname').value; // Pega o nickname digitado
        document.removeEventListener("click", startGame);
        document.getElementById('nickname').style.display = "none"; // Esconde o input depois que o jogo começa
        gameLoop();
    }
});

drawStartScreen(); // Inicia o jogo
