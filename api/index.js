import express from 'express'
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import userRouter from './routes/userRoute.js'
dotenv.config();

mongoose.connect(process.env.MONGODB_URI)
.then(()=>{
    console.log("Connected to Database successfully");
})
.catch((err)=>{
    console.log(err);
})

const app = express();

app.listen(3333, ()=> {
    console.log('Server is running on port 3333');
})

app.use('/api/user',userRouter);