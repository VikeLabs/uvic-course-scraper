import mongoose from 'mongoose';
import express from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';

dotenv.config();

const app = express();

app.use(bodyParser.json());

// Middlewares
const coursesRoute = require('./routes/courses');

app.use('/courses', coursesRoute);

// Routes
app.get('/', (req: any, res: { send: (arg0: string) => void; }) => {
    res.send('Hello world');
});

app.get('/courses', (req: any, res: { send: (arg0: string) => void; }) => {
    res.send('Courses');
});

// Connect to DB
mongoose.connect(
    process.env.DB_CONNECTION as string,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    },
    () => console.log('connected to DB')
);

// Listen on server
app.listen(3000);