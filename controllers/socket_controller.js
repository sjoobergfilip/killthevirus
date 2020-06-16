/**
 * Socket Controller
 */

const debug = require('debug')('game:socket_controller');

let io = null;
const users = {};

let roundsPlayed = 0
let maxRounds = 3
let players = []
let score = {}
let reaction = {}



// Get nicknames of online users
 
function getPlayersOnline() {
	return Object.values(users);
}


function randomPosition (range) {
	return Math.floor(Math.random() * range)
};

function handlePlayerClick(data) {
	
	roundsPlayed ++;

	console.log("games played", roundsPlayed);
	
	const gameData = {
		nickname: data.name,
		score: data.score,
		reaction: data.reaction,
	}

	console.log('this is gameData', gameData)
	
	const clickVirusPosition = {
		width: randomPosition(500),
		height: randomPosition(700)
	}

	if (roundsPlayed < maxRounds) {		
		// Emit new image
		io.emit('player-click', clickVirusPosition, gameData);
	} else {
		roundsPlayed = 0;
		io.emit('game-over')
	}
}

function checkPlayersOnline(socket) {
    if (Object.keys(users).length === 2) {

        io.emit('create-game-page');
     
        console.log('players of the game: ', players);

    } else {
        return;
    }
}

/**
 * Handle player disconnecting
 */
function handlePlayerDisconnect() {
	debug(`Socket ${this.id} left the chat :(`);

	// broadcast to all connected sockets that this user has left the chat
	if (users[this.id]) {
		this.broadcast.emit('user-disconnected', users[this.id]);
	}

	// remove user from list of connected users
	delete users[this.id];
}

/**
 * Handle a new player connecting
 */
function handlePlayerRegistration(nickname, callback) {
	debug("Player: '%s' connected to the lobby", nickname);
	users[this.id] = nickname;
	callback({
		joinGame: true,
		nicknameInUse: false,
		onlinePlayers: getPlayersOnline(),
	});

	checkPlayersOnline(this);

	// broadcast to all connected sockets EXCEPT ourselves
	this.broadcast.emit('new-user-connected', nickname);

	// broadcast online users to all connected sockets EXCEPT ourselves
	this.broadcast.emit('players-online', getPlayersOnline());
}


module.exports = function(socket) {
	// this = io
	io = this;
	debug(`Client ${socket.id} connected!`);

	
	socket.on('disconnect', handlePlayerDisconnect);
	socket.on('player-click', handlePlayerClick);
	socket.on('register-player', handlePlayerRegistration);
}