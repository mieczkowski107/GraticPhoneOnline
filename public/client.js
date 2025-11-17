const socket = io();

const roomSelectionContainer = document.getElementById('room-selection');
const roomInput = document.getElementById('room-input');
const joinRoomBtn = document.getElementById('join-room-btn');
const createRoomBtn = document.getElementById('create-room-btn');

const chatContainer = document.getElementById('chat-container');
const roomDisplay = document.getElementById('room-display');
const form = document.getElementById('form');
const input = document.getElementById('input');
const messages = document.getElementById('messages');

let currentRoom = '';

joinRoomBtn.addEventListener('click', () => {
    const room = roomInput.value;
    if (room) {
        socket.emit('join room', room);
    }
});

roomInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        joinRoomBtn.click();
    }
});

createRoomBtn.addEventListener('click', () => {
    socket.emit('create room');
});

form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (input.value && currentRoom) {
        socket.emit('chat message', { room: currentRoom, msg: input.value });
        input.value = '';
    }
});

socket.on('join success', (room) => {
    currentRoom = room;
    roomSelectionContainer.classList.add('hidden');
    chatContainer.classList.remove('hidden');
    roomDisplay.textContent = `Room code: ${room}`;
    messages.innerHTML = '';
    addSystemMessage(`You joined room ${room}`);
});

socket.on('room created', (room) => {
    socket.emit('join room', room);
});

socket.on('chat message', (data) => {
    const { msg, from } = data;
    const item = document.createElement('li');
    item.textContent = msg;
    if (from == socket.id) {
        item.style.fontWeight = 'bold';
    }
    messages.appendChild(item);
});

socket.on('user joined', (userId) => {
    addSystemMessage('A user has joined the room.');
});

socket.on('user left', (userId) => {
    addSystemMessage('A user has left the room.');
});

socket.on('error', (msg) => {
    alert(msg);
});

function addSystemMessage(msg) {
    const item = document.createElement('li');
    item.textContent = msg;
    item.style.fontStyle = 'italic';
    item.style.color = '777';
    messages.appendChild(item);
}