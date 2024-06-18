import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import userRoutes from './routes/user.route.js'
import refreshroutes from './routes/refresh.route.js'
export const app = express();
const allowedOrigins = ['http://127.0.0.1:5500'];
app.use(cors({
    origin: 'http://localhost:5173', // Allow requests from this origin
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type','Authorization'],
}));
app.use(cookieParser());
app.use(bodyParser.json());
app.use('/api/media',userRoutes);
app.use('/api/media',refreshroutes);
app.use((err,req,res,next)=>{
    console.error(err.stack);
    res.status(500).send('something went wrong');
})
