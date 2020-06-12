const socket = io();

const startEl = document.querySelector('#start');
const chatWrapperEl = document.querySelector('#chat-wrapper');
const usernameForm = document.querySelector('#username-form');
const messageForm = document.querySelector('#message-form');
const messageWrapper = document.querySelector('#gameboard');


const img = document.createElement('img');

function getRandomPosition(element) {
	const x = document.querySelector("#gameboard").offsetHeight-element.clientHeight;
	const y = document.querySelector("#gameboard").offsetWidth-element.clientWidth;
	const randomX = Math.floor(Math.random()* x);
	const randomY = Math.floor(Math.random()* y);
	return [randomX,randomY];
}


function addvirus(){ 
	//randomize a img that will show
	let virusImg = `../assets/img/virus${Math.floor(Math.random() * 7) + 1}.png`

	//randomize a size that will show
	let virusAtribute = `position:absolute; width: ${Math.floor(Math.random() * 50) + 40}px;`

	const img = document.createElement('img');
	img.setAttribute("style", virusAtribute);
	img.setAttribute("src", virusImg);
	document.querySelector("#gameboard").appendChild(img);
	const xy = getRandomPosition(img);
	img.style.top = xy[0] + 'px';
	img.style.left = xy[1] + 'px';
};

//function to ruond a number
function roundToTwo(num) {    
    return +(Math.round(num + "e+2")  + "e-2");
}

// create rection time
let startTime;
let endTime;
let reactionTime;



// start a new game
 function startNewGame() {
	setTimeout(function() {
		addvirus();
		//start timer
		startTime = Date.now();
	}, Math.floor(Math.random() * 5000) + 1000 );
}

const updateOnlineUsers = (users) => {
	document.querySelector('#online-users').innerHTML = users.map(user => `<li class="user">${user}</li>`).join("");
}

// get username from form and emit `register-user`-event to server
usernameForm.addEventListener('submit', e => {
	e.preventDefault();

	waiting = document.querySelector('#wating')

	username = document.querySelector('#username').value;
	socket.emit('register-user', username, (status) => {
		console.log("Server acknowledged the registration :D", status);

		
		//waiting for 2 player to conect
		if(status.onlineUsers.length === 2){
			startNewGame()
		} else {
			waiting.innerHTML = `<h2>wating for opponent</h2>`
		}

		
		if (status.joinChat) {
			startEl.classList.add('hide');
			chatWrapperEl.classList.remove('hide');

			updateOnlineUsers(status.onlineUsers);
		}
	});

});
socket.on('reconnect', () => {
	if (username) {
		socket.emit('register-user', username, () => {
			console.log("The server acknowledged our reconnect.");
		});
	}
});

socket.on('online-users', (users) => {
	updateOnlineUsers(users);
});


// evry time you click on a virus
messageWrapper.addEventListener('click', e => { 	
	gameImg = document.querySelector("img")

	// if you cklick on the IMG and kill the virus
	if(e.target.tagName === 'IMG' ){
		const score = document.querySelector('#sek')

		//stop the timer
		endTime = Date.now()
		//reaction time
		reactionTime = (endTime - startTime)/1000;

		// set reaction time on webpage
		score.innerHTML += `<div><h4>${roundToTwo(reactionTime)} sek</h4></div>`
		
		console.log('it took you:',reactionTime, 'sek, to kill the virus')
		e.target.remove();
		setTimeout(function() {
			addvirus();
			//start timer
			startTime = Date.now();
		},  Math.floor(Math.random() * 5000) + 1000 );

	}else{
		console.log("NOT A VIRUS")
	}
	console.log()

});

