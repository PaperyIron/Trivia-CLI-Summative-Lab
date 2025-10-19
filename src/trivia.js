const readline = require('readline'); 
const questionsArray = require('./questions.json');
const QUESTION_COUNT = questionsArray.length;
const TIME_PER_QUESTIONS = 15000; // 15 seconds per question
const GAME_TIME_LIMIT = QUESTION_COUNT * TIME_PER_QUESTIONS;

function shuffle(arr) {  //Shuffle questions around randomly
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function chooseRandomQuestion(arr, n) { //selects a random question
    return shuffle(arr).slice(0, n);
}

function formatChoices(options) {   //formats the choices to be readable
    return options.map((choice, index) => `${index + 1}. ${choice}`).join('\n');
}

async function runGame() {  //function that runs the cli program.
    console.log('Welcome to the Javascript Trivia Game!');
    const selectedQuestions = chooseRandomQuestion(questionsArray, questionsArray.length); //Selects the questions
    const results = [];//log results to an array

    const gameStartTime = Date.now();  //set the game start
    const gameDeadline = gameStartTime + GAME_TIME_LIMIT; 

    for (let i = 0; i < selectedQuestions.length; i++) {
        const question = selectedQuestions[i];
        const now = Date.now();
        const timeLeftMS = gameDeadline - now;
        if (timeLeftMS <= 0) {
            console.log("Time's up! The game has ended."); //iterate through questions and stop game if time has run out
            break;
        }

        const perMS = Math.min(TIME_PER_QUESTIONS, timeLeftMS);
        console.log(`You have ${Math.round(perMS / 1000)} seconds to answer this question.`); //convert ms to seconds and tell the user tiime left
        console.log(question.question);
        console.log(formatChoices(question.options));

        await handleQuestion(question, results);  //wait for handlequestion to resolve
    }
    await endGame(results); //wait for endgame function to resolve
}

function getUserInput() { //funtion to handle user inputs
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    return new Promise((resolve, reject) => {
        rl.question('Press the correct number to answer): ', (answer) => { //instruct the user to press numbers to answer
            if (!Number.isInteger(Number(answer))) {
                rl.close();
                reject('Answer must be a number.'); //rejects if answer is not number
                return;
            }
            rl.close();
            resolve(Number(answer)); 
        });
    });
}

async function handleQuestion(question, results) {
    const now = Date.now() //set time
    const userAnswer = await getUserInput(); //wait for user input to resolve

    results[question.index] = { //add results information
        userAnswer,
        correct: userAnswer == question.answerIndex, 
        timeTaken: (Date.now() - now) / 1000,
    };
}


async function endGame(results) {
    console.log('Game over! Here are your results:', results);
    console.log('Question Answers:');
    results.forEach((result, index) => {
        console.log(`Question ${index + 1}: ${result.userAnswer} (Correct: ${result.correct})`);
        console.log('Time taken: ' + result.timeTaken + ' seconds');
    });
    console.log('Thanks for playing!'); //after game has finished log results and goodby message
}

runGame(); //call function to run the whole thing