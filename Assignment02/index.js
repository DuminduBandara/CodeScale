import express from "express";
import mongoose from "mongoose";
import dotenv from 'dotenv';

// import router
import userRouter from './Routes/userRouter.js';

dotenv.config();

// mongodb connection
mongoose.connect(process.env.MONGODB_URI).then(() =>{
    console.log("Connect to Mongoose Database");
}).catch((err) => {
    console.log("Error",err.message);
}) 

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// generate Rest API
app.use('/api/users', userRouter);


app.use((err, req, res, next) => {
    res.status(500).send({message:err.message});
})


const port = process.env.PORT || 4000;
app.listen(port, () => {
    console.log(`listening on port ${port}`)
});