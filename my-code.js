const ANSWER_LENGTH = 5;
const ROUNDS = 6;
const letters = document.querySelectorAll('.scoreboard-letter');
const loadingDiv = document.querySelector('.separation-bar');

// Esqueleto do código (deves fazer isto 1º e dps tratar das funções que crias)
async function init () {
    let currentRow = 0; 
    let currentGuess = "";
    let done = false;
    let isLoading = true;
  
// Buscar a palavra do dia ao API
    const res = await fetch ("https://words.dev-apis.com/word-of-the-day");
    const { word: wordRes } = await res.json ();
    const word = wordRes.toUpperCase();
    const wordParts = word.split (""); // correct answer
    isLoading = false;
    setLoading (isLoading);

// User adds a letter to the current guess;
    function addLetter (letter) {
        if (currentGuess.length < ANSWER_LENGTH) {
            currentGuess += letter;
        } else {
            // p/ substituir a última letra:
            current = currentGuess.substring (0, currentGuess.length - 1) + letter;
        }

        letters[currentRow * ANSWER_LENGTH + currentGuess.length - 1].innerText =
         letter; //lembra-te que as coisas em programação começam em 0
    }

// User tries to enter a guess
    async function commit () {
        if (currentGuess.length !== ANSWER_LENGTH) {
            // do nothing
            return; 
        }

    // check the API to see if it's a valid word
    // skip this step if you're not checking for valid words
        isLoading = true;
        setLoading(isLoading);

        const res = await fetch ("https://words.dev-apis.com/validate-word", {
            method: "POST",
            body: JSON.stringify({ word : currentGuess })
        });
        const { validWord } = await res.json ();
        
        isLoading = false;
        setLoading (isLoading);

    // Se não for válido
        if (!validWord) {
          markInvalidWord();
          return;  
        }
        
        const guessParts = currentGuess.split("");
        const map = makeMap (wordParts);
        let allRight = true;

    // First pass just finds correct letters so we can mark those as correct first   
        for (let i = 0; i < ANSWER_LENGTH; i++) {
                if (guessParts[i] === wordParts [i] ) {
                    //mark as correct
                    letters[currentRow * ANSWER_LENGTH + i].classList.add("correct");
                    map [guessParts[i]]--;
                }
            }
    // Second pass finds close and wrong letters
    // we use the map to make sure we mark the correct amount of close letters
        for (let i = 0; i < ANSWER_LENGTH; i++) {
            if (guessParts[i] === wordParts [i]) {
            // do nothing, we already did it
            } else if (map[guessParts[i]] && map[guessParts[i]] > 0) {
                // mark it as close
                allRight = false;
                letters [currentRow * ANSWER_LENGTH + i].classList.add("close");
                map[guessParts[i]]--;
            } else {
                //wrong
                allRight = false;
                letters[currentRow * ANSWER_LENGTH + i].classList.add("wrong");
          }
        }

        
        
        
        currentRow++; 
        currentGuess = "";
        if (allRight) {
            // win
            alert("Congratulations. You win!");
            document.querySelector(".title").classList.add("winner");
            done = true;
          } else if (currentRow === ROUNDS) {
            // lose
            alert(`You lost. The word was ${word}`);
            done = true;
          }
        }

// para adicionar o delete
    function backspace () {
        currentGuess = currentGuess.substring (0, currentGuess.length-1);
        letters[currentRow * ANSWER_LENGTH + currentGuess.length ].innerText = ""; 
        }

// let the user know that their guess wasn't a real word
// skip this if you're not doing guess validation
    function markInvalidWord () {
       for (let i = 0; i < ANSWER_LENGTH; i++) {
        letters[currentRow * ANSWER_LENGTH + i].classList.remove("invalid");

// long enough for the browser to repaint without the "invalid class" 
// so we can then add it again
        setTimeout(
            () => letters[currentRow * ANSWER_LENGTH + i].classList.add("invalid"),
            10
            );
       }
    }

// listening for event keys and routing to the right function
// we listen on keydown so we can catch "Enter" and "Backspace"
 document.addEventListener ('keydown', function handleKeyPress (event) {
    if (done || isLoading) {
        //do nothing
        return; 
    }

   const action = event.key;

   if (action === "Enter") {
    commit();
  } else if (action === "Backspace") {
    backspace();
  } else if (isLetter(action)) {
    addLetter(action.toUpperCase());
  } else {
    // do nothing
  }
});
}

// a little function to check to see if a character is alphabet letter
function isLetter(letter) {
    return /^[a-zA-Z]$/.test(letter);
  }

// para mostrar o indicador quando for preciso
  function setLoading (isLoading) {
    loadingDiv.classList.toggle('show', isLoading);
  }

// It takes an array of letters (like ['E', 'L', 'I', 'T', 'E']) and creates
// an object out of it (like {E: 2, L: 1, T: 1}) so we can use that to
// make sure we get the correct amount of letters marked close instead
// of just wrong or correct

  function makeMap  (array) {
    const obj = {};
    for (let i = 0; i < array.length; i++) {
        if (obj[array[i]]) {
            obj[array[i]]++;
        } else {
            obj[array[i]] = 1; 
        }
    }

    return obj;
  }

init ();