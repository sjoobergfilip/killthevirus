const socket = io();

const startPage = document.querySelector('#startPage');
const playerNickname = document.querySelector('#playerNickname-form');
const lobbyRoom = document.querySelector('#waitForConnect');
const playingField = document.querySelector('#playingField');
const gameBoard = document.querySelector('#gameBoard');
const virus = document.getElementById('virus');

const timer = document.querySelector('#countdown')

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

const gameOver = () => {
    // function to get the best reaction timte
    const minOne = Math.min(...allReactionTimePlayerOne)
    const minTwo = Math.min(...allReactionTimePlayerTwo)

    

    gameBoard.classList.add('hide')
    playingField.innerHTML = `
    <div class="game-over">
        <h2>Game Over</h2>
        <h3>Result:</h3>
        <p>${playersLob[0]}: ${playerScoreOne.score}</p>
        <p>${playersLob[0]} best reactiontime is: ${minOne}</p>
        <p>${playersLob[1]}: ${playerScoreTwo.score}</p>
        <p>${playersLob[1]} best reactiontime is: ${minTwo}</p>
    </div>
    `

}
const lobby = () => {
    lobbyRoom.classList.add('hide');
    playingField.classList.remove('hide');

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
            <h3>Player One</h3>
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
            <h3>Player Two</h3>
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


const randomVirusPosition = (target) => {
    virus.classList.add('hide')
    setTimeout(() => {
        virus.style.top = target.width + "px";
        virus.style.left = target.height + "px";
        virus.classList.remove('hide')
        startTime = Date.now();
    }, 1000)
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
const startRound = (clickVirusPosition) => {

    randomVirusPosition(clickVirusPosition);
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
});

socket.on('new-round', (clickVirusPosition, gameData) => {
    scoreBoard(gameData)
    startRound(clickVirusPosition)
});

socket.on('game-over', (gameData) => {
    scoreBoard(gameData)
    gameOver()
})

socket.on('create-game-page', lobby);