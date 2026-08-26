/* =======================================================
   SCRIPT.JS
   Toda a lógica do site: vaga-lumes, sequência de introdução,
   montagem do "chat" a partir dos dados em data.js, e a
   animação de revelar cada mensagem ao rolar a página.

   Este arquivo espera que "data.js" já tenha sido carregado
   antes dele (ele usa a variável global `messages`).
   ======================================================= */


/* -------------------------------------------------------
   1) VAGA-LUMES DE FUNDO
   Cria vários "pontinhos" (divs .firefly) em posições e
   velocidades aleatórias, só pra dar ambiente. Se a pessoa
   tiver "reduzir movimento" ativado no sistema, não cria
   nenhum (fCount = 0).
   ------------------------------------------------------- */
const fCount = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 22;
const fContainer = document.getElementById('fireflies');

for (let i = 0; i < fCount; i++) {
  const d = document.createElement('div');
  d.className = 'firefly';
  d.style.left = Math.random() * 100 + 'vw';           // posição horizontal aleatória
  d.style.top = 20 + Math.random() * 70 + 'vh';          // posição vertical aleatória
  d.style.animationDelay = (Math.random() * 9) + 's';    // começa a "piscar" em momentos diferentes
  d.style.animationDuration = (7 + Math.random() * 6) + 's'; // velocidade um pouco diferente pra cada um
  fContainer.appendChild(d);
}


/* -------------------------------------------------------
   2) TELA INICIAL — BOTÃO DE TELA CHEIA
   É a primeira coisa que a pessoa vê. Ao tocar no botão:
     a) tenta colocar o site em modo tela cheia (esconde a
        barra de endereço do navegador no celular);
     b) esconde a tela inicial;
     c) só então começa a sequência de frases da introdução.

   Pedir tela cheia só funciona como resposta direta a um
   clique/toque (por isso está dentro do listener do botão),
   e alguns navegadores (principalmente Safari no iPhone) não
   suportam tela cheia pra página inteira — nesses casos o
   pedido é simplesmente ignorado e o site continua normal.
   ------------------------------------------------------- */
const startScreen = document.getElementById('start-screen');
const fullscreenBtn = document.getElementById('fullscreen-btn');

function requestSiteFullscreen() {
  const el = document.documentElement; // a página inteira
  const request =
    el.requestFullscreen ||
    el.webkitRequestFullscreen ||   // Safari/iOS mais antigos
    el.msRequestFullscreen;         // navegadores antigos baseados em Edge/IE
  if (request) {
    request.call(el).catch(() => {
      /* Se o navegador recusar (comum no iOS), apenas ignora
         e segue com o site em modo normal. */
    });
  }
}

fullscreenBtn.addEventListener('click', () => {
  requestSiteFullscreen();
  startScreen.classList.add('hide');
  setTimeout(stepIntro, 400); // pequena espera antes de começar as frases
});


/* -------------------------------------------------------
   3) SEQUÊNCIA DE INTRODUÇÃO
   Mostra cada frase do array `phrases`, uma de cada vez,
   com fade-in e fade-out, e no final esconde a tela de
   introdução (revelando o chat atrás dela).

   Pra mudar as frases ou o tempo que cada uma fica na tela,
   mexa aqui:
   ------------------------------------------------------- */
const phrases = [
  "Falaa Janaaa",
  "parabéns, hoje é seu dia 🎂",
  "vamos relembrar alguns momentos?"
];

const introText = document.getElementById('intro-text');
const introEl = document.getElementById('intro');
let idx = 0;

function stepIntro() {
  // Quando acabaram as frases, esconde a tela de introdução de vez
  if (idx >= phrases.length) {
    introEl.classList.add('hide');
    return;
  }

  introText.textContent = phrases[idx];

  // requestAnimationFrame garante que o navegador "perceba" a mudança
  // de texto antes de começar a transição de opacidade (senão não anima)
  requestAnimationFrame(() => introText.classList.add('show'));

  setTimeout(() => {
    introText.classList.remove('show'); // começa o fade-out
    setTimeout(() => {
      idx++;
      stepIntro(); // chama a próxima frase
    }, 700); // tempo do fade-out antes de trocar o texto
  }, 1700); // tempo que a frase fica visível na tela

}
// (a sequência só começa quando o botão de tela cheia é tocado — ver acima)


/* -------------------------------------------------------
   4) MONTAGEM DO CHAT
   Percorre o array `messages` (definido em data.js) e cria,
   pra cada item, uma "pílula" de data (quando muda de dia) e
   uma linha de mensagem com a foto + legenda + horário.
   ------------------------------------------------------- */
const chat = document.getElementById('chat');
let lastDate = null;

messages.forEach(m => {
  // Se a data mudou desde a última mensagem, insere uma pílula nova
  if (m.date !== lastDate) {
    const pill = document.createElement('div');
    pill.className = 'date-pill';
    pill.textContent = m.date;
    chat.appendChild(pill);
    lastDate = m.date;
  }

  // m.side deve ser "me" (direita) ou "them" (esquerda)
  const row = document.createElement('div');
  row.className = 'msg-row ' + m.side;
  row.innerHTML = `
    <div class="bubble">
      <div class="photo-wrap"><img src="${m.img}" loading="lazy" alt=""></div>
      <div class="caption">${m.caption}</div>
      <div class="timestamp">${m.time}</div>
    </div>`;
  chat.appendChild(row);
});


/* -------------------------------------------------------
   5) REVELAR AO ROLAR (scroll reveal)
   Usa IntersectionObserver pra detectar quando cada mensagem
   entra na área visível da tela, e só então adiciona a classe
   ".in" (que faz o fade-in + subida definidos no CSS).
   Depois de aparecer uma vez, para de observar aquele elemento
   (unobserve) pra não gastar processamento à toa.
   ------------------------------------------------------- */
const obs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('in');
      obs.unobserve(e.target);
    }
  });
}, { threshold: 0.15 }); // dispara quando 15% do elemento já apareceu

document.querySelectorAll('.msg-row').forEach(r => obs.observe(r));
