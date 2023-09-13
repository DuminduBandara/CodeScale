import express from "express";
import mongoose from "mongoose";
import dotenv from 'dotenv';
import userRouter from './Routes/userRouter.js';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI).then(() =>{
    console.log("Connect to Mongoose Database");
}).catch((err) => {
    console.log("Error",err.message);
}) 

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));




app.use('/api/users', userRouter);



// const __dirname = path.resolve();
// app.use(express.static(path.join(__dirname, '/frontend/build')));
// app.get('*', (req, res) =>
//   res.sendFile(path.join(__dirname, '/frontend/build/index.html'))
// );

app.use((err, req, res, next) => {
    res.status(500).send({message:err.message});
})


const port = process.env.PORT || 4000;
app.listen(port, () => {
    console.log(`listening on port ${port}`)
});