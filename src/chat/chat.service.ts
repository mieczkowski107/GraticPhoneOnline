import { Server, Socket } from 'socket.io'

// TODO: create entity
const activeRooms = new Set<string>();

interface SocketWithRoom extends Socket {
    room?: string;
}

const generateRoomCode = (): string => {
    let code: string;
    do {
        code = Math.floor(1000 + Math.random() * 9000).toString();
    } while (activeRooms.has(code)); // Didn't feel like doing more. 
    return code;
}

export const initializeChat = (io: Server) => {
    io.on('connection', (socket: SocketWithRoom) => {
        console.log(`a user connected: ${socket.id}`);

        socket.on('create room', () => {
            const roomCode = generateRoomCode();
            activeRooms.add(roomCode);
            socket.emit('room created', roomCode);
            console.log(`Room created: ${roomCode}`);
        });

        socket.on('join room', (room: string) => {
            if (!activeRooms.has(room)) {
                return socket.emit('error', 'Room does not exist.');
            }

            if (socket.room) {
                socket.leave(socket.room);
            }

            socket.join(room);
            socket.room = room;
            socket.emit('join success', room);
            socket.to(room).emit('user joined', socket.id);
            console.log(`User ${socket.id} joined room ${room}`);
        });

        socket.on('chat message', (data: { room: string, msg: string }) => {
            const { room, msg } = data;
            io.to(room).emit('chat message', { msg, from: socket.id });
            console.log(`Message in room ${room} from ${socket.id}: ${msg}`);
        });

        socket.on('disconnect', () => {
            console.log(`user disconnected: ${socket.id}`);
            if (socket.room) {
                socket.to(socket.room).emit('user left', socket.id);

                const roomSockets = io.sockets.adapter.rooms.get(socket.room);
                if (!roomSockets || roomSockets.size == 0) {
                    activeRooms.delete(socket.room);
                    console.log(`Room ${socket.room} is now empty and has been deleted.`);
                }
            }
        });
    });
};