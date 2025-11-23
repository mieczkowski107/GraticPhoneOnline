import express, { Request, Response, NextFunction } from 'express';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import morgan from 'morgan';
import usersRouter from './users/user.routes.ts'
import { errorHandler } from './middlewares/errorHandler.middleware.ts';
import { SeedRoles } from './db/index.ts';
import { initializeChat } from './chat/chat.service.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT: number = 8000;
const app = express();
const server = createServer(app);
const io = new Server(server);

//Database seeding
SeedRoles();

//Config
app.use(morgan("dev")); // Logger
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Mockup front for testing chat - serving from ./public
app.use(express.static(path.join(__dirname, '..', 'public')));

// Connecting chat with a socket.
initializeChat(io);

//Routes
app.use('/api/users', usersRouter);


//Middlewares

app.use((_req, res) => {
    res.status(404).send("404 - Not Found");
});

app.use(errorHandler);


server.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
