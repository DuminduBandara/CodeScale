import express from "express";
const router = express.Router();
import User from "../Models/user.js";
import nodeMailer from "nodemailer";
import cron from "node-cron";
import axios from "axios";
import moment from "moment-timezone";


//save new user
router.post("/saveUser", async (req, res) => {
  try {
    const newUser = new User({
      email: req.body.email,
      location: req.body.location,
    });
    const user = await newUser.save();
    res.send({
      _id: user._id,
      email: user.email,
      location: user.location,
    });
  } catch (error) {
    res.status(500).json({
      error: "User Registration Failed!...",
    });
  }
});

// update user location
router.put("/updateUser/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { location } = req.body;
    const user = await User.findByIdAndUpdate(
      userId,
      { location },
      { new: true }
    );
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Could not update location." });
  }
});


const API_KEY = "6b118f3c4f9a96fd5fc0e4555331566e";

// retrieve weather data from openweather api
async function getWeather(location) {
  try {
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${location}&units=imperial&appid=${API_KEY}`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
}

// schedule send emails to users with weather updates in every 3 hours
cron.schedule("* * * * *", async () => {
  try {
    const users = await User.find({});

    if (Object.keys(users).length > 0) {
      for (const user of users) {
        const weatherData = await getWeather(user.location);
        const convertDate = moment(new Date()).utcOffset(weatherData.timezone / 60);
        user.data.push({date: convertDate, weatherData:weatherData});
        await user.save();
  
        user.data.forEach((u) => {
          console.log(u.date);
          u.weatherData.forEach((wd) => {
            var t = wd.main?.temp;
            if (t !== undefined) {
              console.log(t);
            }
          })
        });
  
        let tableRows = "";
  
        user.data.forEach((u) => {
          u.weatherData.forEach((wd) => {
            if(wd.name.toLowerCase() === user.location.toLowerCase()) {
              let temp = wd.main?.temp;
              let weatherMain = wd.weather && wd.weather[0] ? wd.weather[0].main : 'N/A';
              let humidity = wd.main?.humidity;
              let windSpeed = wd.wind?.speed;
              tableRows += `
                <tr>
                  <td>${(moment(u.date).utcOffset(wd.timezone / 60)).format('YYYY-MM-DD') || 'N/A'}</td>
                  <td>${(moment(u.date).utcOffset(wd.timezone / 60)).format('HH:mm:ss') || 'N/A'}</td>
                  <td>${temp !== undefined ? ((temp - 32.0) * 5/9).toFixed(2) : 'N/A'} &deg;C</td>
                  <td>${weatherMain || 'N/A'}</td>
                  <td>${humidity !== undefined ? `${humidity}%` : 'N/A'}</td>
                  <td>${windSpeed !== undefined ? `${windSpeed} MPH` : 'N/A'}</td>
                </tr>`;
            }
          })
        });
  

        // weather Report
        const table = `
          <h1>Location: ${user.location}</h1>
          <hr>
          <table style="border-collapse: separate; border-spacing: 10px;">
            <tr>
              <th>Date</th>
              <th>Time</th>
              <th>Temperature (&deg;C)</th>
              <th>Description</th>
              <th>Humidity</th>
              <th>Wind (MPH)</th>
            </tr>         
            ${tableRows}
          </table>
        `;
  
        mailManager(user.email, table);
        console.log("Successfully updated");
      }
    }else{
      console.log("No users found");
    }

  } catch (err) {
    console.log(err);
  }
});


// generate Email 
async function mailManager(email, table) {
  const transporter = nodeMailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: "twodemo83@gmail.com",
      pass: "ppcbghnyqmxmlznj",
    },
  });

  const info = await transporter.sendMail({
    from: "twodemo83@gmail.com",
    to: email,
    subject: "Updated Weather Report",
    // text: `The weather in your location is: Colombo`,
    html: table,
  });

  console.log("Message sent: " + info.messageId);
}

export default router;
