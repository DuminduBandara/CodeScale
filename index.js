import express from "express";
import mongoose from "mongoose";
import dotenv from 'dotenv';
import cors from 'cors';

const app = express();
app.use(cors());
dotenv.config();

// import router
import userRouter from './Routes/userRouter.js';


// mongodb connection
mongoose.connect(process.env.MONGODB_URI).then(() =>{
    console.log("Connect to Mongoose Database");
}).catch((err) => {
    console.log("Error",err.message);
}) 

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// generate Rest API
app.use('./api', userRouter);

app.get("/", (req, res) => {
    res.send("Main page Go!");
  });


const port = process.env.PORT || 8000;
app.listen(port, () => {
    console.log(`listening on port ${port}`)
});