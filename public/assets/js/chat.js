const socket = io();

const startEl = document.querySelector('#start');
const chatWrapperEl = document.querySelector('#chat-wrapper');
const usernameForm = document.querySelector('#username-form');
const messageForm = document.querySelector('#message-form');
const messageWrapper = document.querySelector('#gameboard');
const startGame = document.querySelector('#start-game')


const img = document.createElement('img');

function getRandomPosition(element) {
	const x = document.querySelector("#gameboard").offsetHeight-element.clientHeight;
	const y = document.querySelector("#gameboard").offsetWidth-element.clientWidth;
	const randomX = Math.floor(Math.random()* x);
	const randomY = Math.floor(Math.random()* y);
	return [randomX,randomY];
}


function addvirus(){ 
	const img = document.createElement('img');
	img.setAttribute("style", "position:absolute;");
	img.setAttribute("src", "../assets/img/virus.png");
	document.querySelector("#gameboard").appendChild(img);
	const xy = getRandomPosition(img);
	img.style.top = xy[0] + 'px';
	img.style.left = xy[1] + 'px';
};

//function to ruond a number
function roundToTwo(num) {    
    return +(Math.round(num + "e+2")  + "e-2");
}

const updateOnlineUsers = (users) => {
	document.querySelector('#online-users').innerHTML = users.map(user => `<li class="user">${user}</li>`).join("");
}

// get username from form and emit `register-user`-event to server
usernameForm.addEventListener('submit', e => {
	e.preventDefault();

	username = document.querySelector('#username').value;
	socket.emit('register-user', username, (status) => {
		console.log("Server acknowledged the registration :D", status);

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



// create rection time
let startTime;
let endTime;
let reactionTime;



// click to start a new game
startGame.addEventListener('click', e =>{
	e.target.remove()
	setTimeout(function() {
		addvirus();
		//start timer
		startTime = Date.now();
	}, Math.floor(Math.random() * 5000) + 3000 );
})


// evry time you click on a virus
messageWrapper.addEventListener('click', e => { 	
	gameImg = document.querySelector("img")
	const virus = e.target.tagName;

	// if you cklick on the IMG and kill the virus
	if(virus === 'IMG' ){
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
		},  Math.floor(Math.random() * 5000) + 3000 );

	}else{
		console.log("NOT A VIRUS")
	}
	console.log()

});

