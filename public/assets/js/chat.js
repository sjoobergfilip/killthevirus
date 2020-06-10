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
function roundToOne(num) {    
    return +(Math.round(num + "e+1")  + "e-1");
}


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
	}, 1500);
})


// evry time you click on a virus
messageWrapper.addEventListener('click', e => { 	
	gameImg = document.querySelector("img")
	const virus = e.target.tagName;
	const score = document.querySelector('#sek')

	// if you cklick on the IMG and kill the virus
	if(virus === 'IMG' ){
		const score = document.querySelector('#sek')

		//stop the timer
		endTime = Date.now()
		//reaction time
		reactionTime = (endTime - startTime)/1000;

		// round the result to one dec
		const time = roundToOne(reactionTime)
		// set reaction time on webpage
		score.innerHTML += `<div><h4>${time} sek</h4></div>`
		
		console.log('it took you:',reactionTime, 'sek, to kill the virus')
		e.target.remove();
		setTimeout(function() {
			addvirus();
			//start timer
			startTime = Date.now();
		}, 1500);

	}else{
		console.log("NOT A VIRUS")
	}
	console.log()

});

let username = null;

const addNoticeToChat = (notice) => {
	const noticeEl = document.createElement('li');
	noticeEl.classList.add('list-group-item', 'list-group-item-light', 'notice');

	noticeEl.innerHTML = notice;

	document.querySelector('#messages').appendChild(noticeEl);
}

const addMessageToChat = (msg, ownMsg = false) => {
	const msgEl = document.createElement('li');
	msgEl.classList.add('list-group-item', 'message');
	msgEl.classList.add(ownMsg ? 'list-group-item-primary' : 'list-group-item-secondary');

	const username = ownMsg ? 'You' : msg.username;
	msgEl.innerHTML = `<span class="user">${username}</span>: ${msg.content}`;

	document.querySelector('#messages').appendChild(msgEl);
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

messageForm.addEventListener('submit', e => {
	e.preventDefault();

	const messageEl = document.querySelector('#message');
	const msg = {
		content: messageEl.value,
		username: document.querySelector('#username').value,
	}

	socket.emit('chatmsg', msg);
	addMessageToChat(msg, true);

	messageEl.value = '';
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

socket.on('new-user-connected', (username) => {
	addNoticeToChat(`${username} connected to the chat 🥳!`);
});

socket.on('user-disconnected', (username) => {
	addNoticeToChat(`${username} left the chat 😢...`);
});

socket.on('chatmsg', (msg) => {
	addMessageToChat(msg);
});
