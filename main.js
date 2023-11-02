const Symbols = ["spades.png", "heart.png", "diamonds.png", "club.png"];
const GAME_STATE = {
  FirstCardAwaits: "FirstCardAwaits",
  SecondCardAwaits: "SecondCardAwaits",
  MatchFail: "MatchFail",
  MatchSuccess: "MatchSuccess",
  GameFinished: "GameFinished",
};

const view = {
  getCardElement(index) {
    return `<div class="card back" data-index="${index}"></div>`;
  },
  getCardContent(index) {
    const number = this.transformNumber((index % 13) + 1);
    const symbol = Symbols[Math.floor(index / 13)];
    return `<p>${number}</p>
        <img src="${symbol}" alt="img" />
        <p>${number}</p>`;
  },
  displayCards(indexes) {
    const rootElement = document.querySelector("#cards");
    rootElement.innerHTML = indexes
      .map((index) => this.getCardElement(index))
      .join("");
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
  flipCards(...card) {
    card.map((card) => {
      // 如果是反面，讓他翻正面
      if (card.classList.contains("back")) {
        card.classList.remove("back");
        card.innerHTML = this.getCardContent(Number(card.dataset.index));
        return;
      }
      // 如果是正面，翻回反面
      card.classList.add("back");
      card.innerHTML = null;
    });
  },
  pairCards(...card) {
    card.map((card) => card.classList.add("paired"));
  },
  renderScore(score) {
    document.querySelector(".score").textContent = `Score: ${score}`;
  },
  renderTriedTimes(times) {
    document.querySelector(
      ".tried"
    ).textContent = `You have tried ${times} times.`;
  },
  appendWrongCardAnimation(...card) {
    card.map((card) => {
      card.classList.add("wrong");
      card.addEventListener(
        "animationend",
        (event) => event.target.classList.remove("wrong"),
        {
          once: true,
        }
      );
    });
  },
  winText() {
    const compelete = document.createElement("div");
    compelete.classList.add("compelete");
    document
      .querySelector(".card-container")
      .insertAdjacentElement("beforeend", compelete);
    compelete.innerHTML = `
        <h2>Congratulation!Compelete!</h2>
        <p>Score:${model.score}</p>
        <p>You have tried ${model.triedTimes} times</p> `;
  },
};

const model = {
  revealedCards: [],
  score: 0,
  triedTimes: 0,
  isRevealedCardsMatched() {
    return (
      this.revealedCards[0].dataset.index % 13 ===
      this.revealedCards[1].dataset.index % 13
    );
  },
};

const controller = {
  currentState: GAME_STATE.FirstCardAwaits,
  generateCards() {
    view.displayCards(utility.getRandomNumberArray(52));
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
        // 判斷配對是否成功
        if (model.isRevealedCardsMatched()) {
          view.renderScore((model.score += 10));
          this.currentState = GAME_STATE.MatchSuccess;
          view.pairCards(...model.revealedCards);
          model.revealedCards = [];
          if (model.score === 260) {
            this.currentState = GAME_STATE.GameFinished;
            view.winText();
            return;
          }
          this.currentState = GAME_STATE.FirstCardAwaits;
        } else {
          this.currentState = GAME_STATE.MatchFail;
          view.appendWrongCardAnimation(...model.revealedCards);
          setTimeout(this.resetCards, 1000);
        }
        break;
    }
  },
  resetCards() {
    view.flipCards(...model.revealedCards);
    model.revealedCards = [];
    controller.currentState = GAME_STATE.FirstCardAwaits;
  },
};

const utility = {
  getRandomNumberArray(count) {
    const number = Array.from(Array(count).keys());
    for (let index = number.length - 1; index > 0; index--) {
      const randomNumber = Math.floor(Math.random() * count);
      [number[index], number[randomNumber]] = [
        number[randomNumber],
        number[index],
      ];
    }
    return number;
  },
};
controller.generateCards();
// 監聽器
document.querySelectorAll(".card").forEach((card) => {
  card.addEventListener("click", function () {
    controller.dispatchCardAction(card);
  });
});
