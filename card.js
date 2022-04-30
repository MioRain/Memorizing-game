const GAME_STATE = {
  FirstCardAwaits: "firstCardAwaits",
  SecondCardAwaits: "SecondCardAwaits",
  CardsMatchFailed: "CardsMatchFailed",
  CardsMatched: "CardsMatched",
  GameFinished: "GameFinished"
};

const Symbols = [
  "https://assets-lighthouse.alphacamp.co/uploads/image/file/17989/__.png", // 黑桃
  "https://assets-lighthouse.alphacamp.co/uploads/image/file/17992/heart.png", // 愛心
  "https://assets-lighthouse.alphacamp.co/uploads/image/file/17991/diamonds.png", // 方塊
  "https://assets-lighthouse.alphacamp.co/uploads/image/file/17988/__.png" // 梅花
];

const view = {
  getCardContent(index) {
    const number = this.transformNumber((index % 13) + 1);
    const symbol = Symbols[Math.floor(index / 13)];

    return `<p>${number}</p>
      <img src="${symbol}">
      <p>${number}</p>       
      `;
  },

  getCardElement(index) {
    return `<div data-index="${index}" class="card back hidden"></div>`;
  },

  transformNumber(number) {
    switch (number) {
      case 1:
        return "A";
      case 11:
        return "J";
      case 12:
        return "Q";
      case 13:
        return "K";
      default:
        return number;
    }
  },

  displayCards(indexes) {
    const rootElement = document.querySelector("#cards");
    rootElement.innerHTML = indexes
      .map((index) => this.getCardElement(index))
      .join("");
  },

  flipCards(...cards) {
    cards.map((card) => {
      if (card.classList.contains("back")) {
        card.classList.remove("back");
        card.innerHTML = this.getCardContent(card.dataset.index);
        return;
      }
      card.classList.add("back");
      card.innerHTML = null;
    });
  },

  pairCards(...cards) {
    cards.map((card) => {
      card.classList.add("paired");
    });
  },

  renderScore(score) {
    document.querySelector(".score").textContent = `Score: ${score}`;
  },

  renderTriedTimes(times) {
    document.querySelector(
      ".tried"
    ).textContent = `You've tried: ${times} times`;
  },

  appendWrongAnimation(...card) {
    card.map((card) => {
      card.classList.add("wrong");
      card.addEventListener("animationend", (event) => {
        card.classList.remove("wrong"), { once: true };
      });
    });
  },

  showGameFinished() {
    const div = document.createElement("div");
    div.classList.add("completed");
    div.innerHTML = `
      <p>Complete!</p>
      <p>Score: ${model.score}</p>
      <p>You've tried: ${model.triedTimes} times</p>
    `;
    const header = document.querySelector("#header");
    header.before(div);
  },

  moveCardsToStartingPoint(cards) {
    const offsetX = cards[0].clientWidth + 8;
    const offsetY = cards[0].clientHeight + 8;
    for (let i = 0; i < cards.length; i++) {
      cards[i].style.bottom = `${offsetY * (Math.floor(i / 13) + 1)}px`;
      cards[i].style.right = `${offsetX * (i % 13)}px`;
    }
  },

  dealCards(cards) {
    for (let i = 0; i < cards.length; i++) {
      setTimeout(() => {
        cards[i].classList.add("dealCards");
        cards[i].addEventListener("animationend", (event) => {
          cards[i].style.bottom = "";
          cards[i].style.right = "";
          cards[i].classList.remove("dealCards");
        });
      }, 75 * (i + 1));

      setTimeout(() => {
        cards[i].classList.remove("hidden");
      }, 75 * cards.length + 500);
    }
  },

  flyCards(cards) {
    const randomArr = utility.getRandomNumberArray(52);
    for (let i = 0; i < cards.length; i++) {
      setTimeout(() => {
        cards[randomArr[i]].animate(
          [
            // keyframes
            { transform: "translateY(0px)" },
            { transform: "translateY(-800px)" }
          ],
          {
            // timing options
            duration: Math.random() * 1200 + 200,
            iterations: Infinity
          }
        );
      }, 50 * i);
    }
  }
};

const utility = {
  getRandomNumberArray(count) {
    const number = Array.from(Array(count).keys());
    for (let index = number.length - 1; index > 0; index--) {
      let randomIndex = Math.floor(Math.random() * (index + 1));
      [number[index], number[randomIndex]] = [
        number[randomIndex],
        number[index]
      ];
    }
    return number;
  }
};

const model = {
  revealedCards: [],

  isRevealedCardsMatched() {
    return (
      this.revealedCards[0].dataset.index % 13 ===
      this.revealedCards[1].dataset.index % 13
    );
  },

  score: 0,

  triedTimes: 0
};

const controller = {
  currentState: GAME_STATE.FirstCardAwaits,

  generateCards() {
    view.displayCards(utility.getRandomNumberArray(52));
    view.moveCardsToStartingPoint(document.querySelectorAll(".card"));
    view.dealCards(document.querySelectorAll(".card"));
  },

  dispatchCardAction(card) {
    if (!card.classList.contains("back")) return;

    switch (this.currentState) {
      case GAME_STATE.FirstCardAwaits:
        view.flipCards(card);
        model.revealedCards.push(card);
        this.currentState = GAME_STATE.SecondCardAwaits;
        break;

      case GAME_STATE.SecondCardAwaits:
        view.renderTriedTimes(++model.triedTimes);
        view.flipCards(card);
        model.revealedCards.push(card);

        if (model.isRevealedCardsMatched()) {
          view.renderScore((model.score += 10));
          this.currentState = GAME_STATE.CardsMatched;
          view.pairCards(...model.revealedCards);
          model.revealedCards = [];
          if (model.score === 260) {
            console.log("showGameFinished");
            this.currentState = GAME_STATE.GameFinished;
            view.showGameFinished();
            view.flyCards(document.querySelectorAll(".card"));
            return;
          }
          this.currentState = GAME_STATE.FirstCardAwaits;
        } else {
          this.currentState = GAME_STATE.CardsMatchFailed;
          view.appendWrongAnimation(...model.revealedCards);
          setTimeout(this.resetCards, 1000);
        }
        break;
    }
  },
  resetCards() {
    view.flipCards(...model.revealedCards);
    model.revealedCards = [];
    controller.currentState = GAME_STATE.FirstCardAwaits;
  }
};

controller.generateCards();

document.querySelectorAll(".card").forEach((card) => {
  card.addEventListener("click", (event) => {
    controller.dispatchCardAction(card);
  });
});
