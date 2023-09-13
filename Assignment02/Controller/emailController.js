import express from "express";
const router = express.Router();
import User from "../Models/user.js";
import axios from 'axios';
import cron from 'node-cron'
import nodeMailer from 'nodemailer';

const API_KEY = '6b118f3c4f9a96fd5fc0e4555331566e';

async function getWeather(location) {
  try {
    const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${location}&units=imperial&appid=${API_KEY}`);
    return response.data;
  } catch (error) {
    throw error;
  }
}

router.get('/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found.' });
      }
      const weatherData = await getWeather(user.location);
      user.weatherData.push(weatherData);
      await user.save();
      res.json(user.weatherData);
    } catch (error) {
      res.status(500).json({ error: 'Could not fetch weather data.' });
    }
  });


  let mailTrans = nodeMailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'one298591@gmail.com',
        pass: '1o1o1o1o1o'
    }
})

  let details = {
    from: 'one298591@gmail.com',
    to: 'twodemo83@gmail.com',
    subject: 'Daily Weather Report',
    text: `The weather in your location is: `,
  }

  mailTrans.sendMail(details, (err)=>{
    if(err){
        console.error(err)
    }else{
        console.log("send")
    }
  })

//   async function sendHourlyWeatherReport() {
//     const mailOptions = {
//       from: 'YOUR_EMAIL@gmail.com',
//       to: userEmail,
//       subject: 'Hourly Weather Report',
//       text: `The weather in your location is: ${weatherData}`,
//     };
  
//     transporter.sendMail(mailOptions, (error, info) => {
//       if (error) {
//         console.error('Error sending email:', error);
//       } else {
//         console.log('Email sent:', info.response);
//       }
//     });
//   }