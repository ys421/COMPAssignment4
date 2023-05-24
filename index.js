 document.addEventListener('DOMContentLoaded', function() {
  const setup = async () => {
    const container = document.querySelector("#game_grid");
    let difficulty;
    let numpairs;
    const difficultyGroup = document.getElementById("difficulty");
    const startButton = document.querySelector("#start");
    const stepcontainer = document.querySelector("#step");
    const totalpairscontainer = document.querySelector("#total_pair");
    const matchcontainer = document.querySelector("#match");
    const unmatchcontainer = document.querySelector("#unmatch");
    const timerContainer = document.querySelector("#timer");
    const resetButton = document.querySelector("#reset");
    const powerupButton = document.querySelector("#powerup");
    let numclicks = 0;
    let nummatched = 0;
    let numunmatched = 0;
    let seconds = 0;
    let timerInterval = null;
    let isTimerRunning = false;
    let firstCard = undefined;
    let secondCard = undefined;
    let isCardClickable = true;
  
    startButton.addEventListener("click", async () => {
      const checkedBox = difficultyGroup.querySelector(
        "input[type='checkbox']:checked"
      );
  
      if (checkedBox) {
        difficulty = checkedBox.value;
        console.log("Difficulty:", difficulty);
        switch (difficulty) {
          case "easy":
            numpairs = 4;
            break;
          case "medium":
            numpairs = 8;
            break;
          case "hard":
            numpairs = 12;
            break;
        }
  
        container.innerHTML = "";
        for (let i = 0; i < numpairs * 2; i++) {
          const card = document.createElement("div");
          card.classList.add("card");
          const frontFace = document.createElement("img");
          frontFace.classList.add("front_face");
          frontFace.id = `img${i + 1}`;
          frontFace.src = "";
          const backFace = document.createElement("img");
          backFace.classList.add("back_face");
          backFace.src = "back.webp";
          card.appendChild(frontFace);
          card.appendChild(backFace);
          container.appendChild(card);
        }
  
        const response = await fetch(
          "https://pokeapi.co/api/v2/pokemon?limit=810"
        );
        const data = await response.json();
        randomPokemonUrls = [];
        for (let k = 0; k < numpairs; k++) {
          const randomPokemon =
            data.results[Math.floor(Math.random() * data.results.length)];
          const randomPokemonResponse = await fetch(randomPokemon.url);
          const randomPokemonData = await randomPokemonResponse.json();
          const randomPokemonImageUrl = randomPokemonData.sprites.front_default;
          randomPokemonUrls.push(randomPokemonImageUrl);
        }
        const usedIndices = [];
  
        for (let j = 0; j < numpairs; j++) {
          let randomIndex1 = getRandomIndex();
          while (usedIndices.includes(randomIndex1)) {
            randomIndex1 = getRandomIndex();
          }
          usedIndices.push(randomIndex1);
  
          let randomIndex2 = getRandomIndex();
          while (
            usedIndices.includes(randomIndex2) ||
            randomIndex2 === randomIndex1
          ) {
            randomIndex2 = getRandomIndex();
          }
          usedIndices.push(randomIndex2);
  
          container.children[randomIndex1].children[0].src = randomPokemonUrls[j];
          container.children[randomIndex2].children[0].src = randomPokemonUrls[j];
        }
  
        function getRandomIndex() {
          return Math.floor(Math.random() * (numpairs * 2));
        }
  
        // Reset the number of clicks
        numclicks = 0;
        stepcontainer.innerHTML = `Number of clicks: ${numclicks}`;
  
        // Reset the number of matched pairs
        nummatched = 0;
        matchcontainer.innerHTML = `Matched pairs of card: ${nummatched}`;
  
        totalpairscontainer.innerHTML = `Total pairs of cards: ${numpairs}`;
  
        // Reset the number of unmatched pairs
        numunmatched = numpairs;
        unmatchcontainer.innerHTML = `Unmatched pairs of cards: ${numunmatched}`;
  
        // Reset the timer
        clearInterval(timerInterval);
        seconds = 0;
        timerContainer.innerHTML = `Time: ${seconds} seconds`;
  
        // Reset the cards
        $(".card").removeClass("flip");
        $(".card").off("click");
        isTimerRunning = false;
        firstCard = undefined;
        secondCard = undefined;
        isCardClickable = true;
      }
    });
  
    function startTimer() {
      isTimerRunning = true;
      timerInterval = setInterval(() => {
        seconds++;
        timerContainer.innerHTML = `Time: ${seconds} seconds`;
      }, 1000);
    }
  
    function stopTimer() {
      clearInterval(timerInterval);
      setTimeout(() => {
        alert(`You won in ${seconds} seconds!`);
      }, 1000);
    }
  
    resetButton.addEventListener("click", () => {
      clearInterval(timerInterval);
      seconds = 0;
      timerContainer.innerHTML = `Time: ${seconds} seconds`;
  
      // Reset the number of clicks
      numclicks = 0;
      stepcontainer.innerHTML = `Number of clicks: ${numclicks}`;
  
      // Reset the number of matched pairs
      nummatched = 0;
      matchcontainer.innerHTML = `Matched pairs of card: ${nummatched}`;
  
      // Reset the number of unmatched pairs
      numunmatched = numpairs;
      unmatchcontainer.innerHTML = `Unmatched pairs of cards: ${numunmatched}`;
  
      // Reset the number of pairs
      numpairs = 3;
  
      // Reset the cards
      $(".card").removeClass("flip");
      $(".card").on("click");
    });
  
    powerupButton.addEventListener("click", () => {
      $(".card").addClass("flip");
      setTimeout(() => {
        $(".card").removeClass("flip");
      }, 1500);
    });
  
    // Flip the card when clicked
    $("#game_grid").on("click", ".card", function () {
      if (!isTimerRunning) startTimer();
      if (!isCardClickable || $(this).hasClass("matched")) return;
      numclicks += 1;
      stepcontainer.innerHTML = `Number of clicks: ${numclicks}`; // Update the number of clicks
      $(this).toggleClass("flip");
      if (!firstCard) firstCard = $(this).find(".front_face")[0];
      else {
        secondCard = $(this).find(".front_face")[0];
        if (firstCard === secondCard) {
          firstCard = undefined;
          secondCard = undefined;
          return; // Exit the function without making the card unclickable
        }
        if (firstCard.src == secondCard.src) {
          nummatched += 1;
          numunmatched -= 1;
          matchcontainer.innerHTML = `Matched pairs of card: ${nummatched}`;
          unmatchcontainer.innerHTML = `Unmatched pairs of cards: ${numunmatched}`;
          $(`#${firstCard.id}`).parent().addClass("matched");
          $(`#${secondCard.id}`).parent().addClass("matched");
          firstCard = undefined;
          secondCard = undefined;
        } else {
          isCardClickable = false;
          setTimeout(() => {
            $(`#${firstCard.id}`).parent().toggleClass("flip");
            $(`#${secondCard.id}`).parent().toggleClass("flip");
            firstCard = undefined;
            secondCard = undefined;
            isCardClickable = true;
          }, 1000);
        }
        if (nummatched === numpairs) {
          stopTimer();
        }
      }
    });
  };

  document.getElementById('themeButton').addEventListener('click', function() {
    toggleTheme();
  });

function toggleTheme() {
    var body = document.querySelector('body');
  
    // Check if the body has the theme classes and toggle them
    if (body.classList.contains('theme-light')) {
      body.classList.remove('theme-light');
      body.classList.add('theme-dark');
    } else {
      body.classList.remove('theme-dark');
      body.classList.add('theme-light');
    }
  }
  

  // Check for initial theme preference
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    // Dark mode preference detected
    toggleTheme(); // Switch to dark theme
  }

  $(document).ready(setup);
});
