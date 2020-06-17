const socket = io();

//queryselectors

const startPage = document.querySelector('#startPage');
const playerNickname = document.querySelector('#playerNickname-form');
const lobbyRoom = document.querySelector('#waitForConnect');
const playingField = document.querySelector('#playingField');
const gameBoard = document.querySelector('#gameBoard');
const virus = document.getElementById('virus');
const timer = document.querySelector('#countdown')
const players = document.querySelector('#players')

// doms for game over 
const gameOverShow = document.querySelector('#gameOverShow')
const gameOverText = document.querySelector('#gameOverText')
const resetButton = document.querySelector('#reset-btn')


// variables
let nickname = null;
let playersLob = []
let playerScoreOne = {
    score: 0,
}
let playerScoreTwo = {
    score: 0,
}
let startTime;
let endTime;
let reactionTime;
let score = 1;


// create an arrey fore P1 and P2 to se the best reactiontime
let allReactionTimePlayerOne = [];
let allReactionTimePlayerTwo = [];


// GENERAL FUNCTIONS

//a text when someone winns
const winnerText = (winner) =>{
    // function to get the best reaction timte
    const minOne = Math.min(...allReactionTimePlayerOne)
    const minTwo = Math.min(...allReactionTimePlayerTwo)

    gameOverShow.classList.remove('hide')

    gameOverText.innerHTML = `
    <div class="game-over">
        <h2>Game Over</h2>
        <div class="winner-end">
            <img src="./assets/img/trophy.png" alt="virus">
            <h4>${winner}</h4>
        </div>
        <h2>Congratulations ${winner}, you are the best to kill the virus</h2>
        <h2>Result:</h3>
        <h4>${playersLob[0]}</h4>
        <p>${playerScoreOne.score} points</p>
        <p>you best reactiontime was: ${minOne}</p>
        <h4>${playersLob[1]}</h4>
        <p>${playerScoreTwo.score} points</p>
        <p>you best reactiontime was: ${minTwo}</p>
    </div>
    `
}

//a text when it's draw
const drawText = () =>{
    // function to get the best reaction timte
    const minOne = Math.min(...allReactionTimePlayerOne)
    const minTwo = Math.min(...allReactionTimePlayerTwo)

    gameOverShow.classList.remove('hide')

    gameOverText.innerHTML = `
    <div class="game-over">
        <h2>Game Over</h2>
        <h2>It's a draw, you both are the best to kill the virus</h2>
        <h2>Result:</h2>
        <h4>${playersLob[0]}</h4>
        <p>${playerScoreOne.score} points</p>
        <p>you best reactiontime was: ${minOne}</p>
        <h4>${playersLob[1]}</h4>
        <p>${playerScoreTwo.score} points</p>
        <p>you best reactiontime was: ${minTwo}</p>
        
    </div>
    `
}

// when the game is over and declair a winner
const gameOver = () => {
    let winner

    //check who has most points
    if (playerScoreOne.score > playerScoreTwo.score){
        winner = playersLob[0]
        winnerText(winner);
    } else if (playerScoreOne.score < playerScoreTwo.score) {
        winner = playersLob[1]
        winnerText(winner);
    } else {
        drawText();
    }
    // remove gamebord
    gameBoard.classList.add('hide')
    players.classList.add('hide')
}


const lobby = () => {

    lobbyRoom.classList.add('hide');
    playingField.classList.remove('hide');
    document.querySelector('#playerOneName').innerText = playersLob[0]
    document.querySelector('#playerTwoName').innerText = playersLob[1]
    //call on function countdown to start the coutdown
    countDown();
}

const updatePlayersOnline = (players) => {
    console.log(players)
    playersLob = players;
    console.log('playersLob', playersLob)
	document.querySelector('#players-online').innerHTML = players.map(player => `<li class="player">${player}</li>`).join("");
}

const scoreBoard = (gameData) => {
    if (gameData.nickname === playersLob[0]) {

        //This is PlayerOne
        playerScoreOne.score ++;

        //push all reactiontime to an arry to find the best reactiontime
        allReactionTimePlayerOne.push(gameData.reaction)
 
        const playerOneScore = document.querySelector('#playerOne');
        playerOneScore.innerHTML = 
        `<div>
            <h3>${gameData.nickname}</h3>
            <p>Score: ${gameData.score}</p>
            <p>Reactiontime: ${gameData.reaction}</p>
        </div>`
    } else if (gameData.nickname === playersLob[1]){

        //This is PlayerTwo
         playerScoreTwo.score ++;

        //push all reactiontime to an arry to find the best reactiontime
        allReactionTimePlayerTwo.push(gameData.reaction)

        const playerTwoScore = document.querySelector('#playerTwo');
        playerTwoScore.innerHTML = 
        `<div>
            <h3>${gameData.nickname}</h3>
            <p>Score: ${gameData.score}</p>
            <p>Reactiontime: ${gameData.reaction}</p>
        </div>`
    }
}


// countdown when two player is joing
const countDown = () =>{

    let timeleft = 3;
    let downloadTimer = setInterval(function(){
    if(timeleft <= 0){
        document.getElementById("countdown").classList.add('hide')
        clearInterval(downloadTimer);
        virus.classList.remove('hide')
        startTime = Date.now();
    } else {
        document.getElementById("countdown").innerHTML = timeleft;
     }
    timeleft -= 1;
    }, 1000);
}


const randomVirusPosition = (target, delay) => {
    virus.classList.add('hide')
    setTimeout(() => {
        virus.style.top = target.width + "px";
        virus.style.left = target.height + "px";
        virus.classList.remove('hide')
        startTime = Date.now();
    }, delay)
}

const clickedVirus = (e) => {
    if(e.target.tagName === 'IMG' ){
        const score = document.querySelector('#sek')
 
        //stop the timer
        endTime = Date.now()
        //reaction time
        reactionTime = (endTime - startTime)/1000;
 
        // set reaction time on webpage
        // score.innerHTML = `<div><h4>${reactionTime} sek</h4></div>`
    }
}

/* Start new round */
const startRound = (clickVirusPosition ,delay) => {
    randomVirusPosition(clickVirusPosition, delay);
}


// EVENT FUNCTIONS
virus.addEventListener('click', e => {
    clickedVirus(e);
    const data = {
        name: nickname,
        reaction: reactionTime,
        score: score++
    }

	socket.emit('player-click', data)
})


playerNickname.addEventListener('submit', e => {
	e.preventDefault();

	nickname = document.querySelector('#nickname').value;
	socket.emit('register-player', nickname, (status) => {

        if (status.joinGame) {
			startPage.classList.add('hide');
			lobbyRoom.classList.remove('hide');

			updatePlayersOnline(status.onlinePlayers);
		}
	});

});

// SOCKET FUNCTIONS
socket.on('reconnect', () => {
	if (nickname) {
		socket.emit('register-player', nickname, () => {
		});
	}
});

socket.on('players-online', (players) => {
    updatePlayersOnline(players);
    document.querySelector('#playerOneName').innerText = playersLob[0]
    document.querySelector('#playerTwoName').innerText = playersLob[1]
});

socket.on('new-round', (clickVirusPosition, gameData, delay) => {
    scoreBoard(gameData)
    startRound(clickVirusPosition, delay)
});

socket.on('game-over', (gameData) => {
    scoreBoard(gameData)
    gameOver(gameData)
})

socket.on('create-game-page', lobby);