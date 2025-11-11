import express, { Request, Response, NextFunction } from 'express';
import morgan from 'morgan';
import usersRouter from './users/user.routes.js'
import { errorHandler } from './middlewares/errorHandler.middleware.ts';
import { SeedRoles } from './db/index.ts';

const PORT: number = 8000;
const app = express();

//Database seeding
SeedRoles();

//Config
app.use(morgan("dev")); // Logger
app.use(express.urlencoded({ extended: false }));
app.use(express.json());


//Routes
app.use('/api/users', usersRouter);


//Middlewares

app.use((_req, res) => {
    res.status(404).send("404 - Not Found");
});

app.use(errorHandler);


app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
