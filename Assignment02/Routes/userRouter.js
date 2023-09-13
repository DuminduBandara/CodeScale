import express from "express";
const router = express.Router();
import User from "../Models/user.js";
import nodeMailer from "nodemailer";
import cron from "node-cron";
import axios from "axios";
import { DateTime } from "luxon";

// Store user details
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

router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }
    const weatherData = await getWeather(user.location);
    user.weatherData.push(weatherData);
    await user.save();
    res.json(user.weatherData);
  } catch (error) {
    res.status(500).json({ error: "Could not fetch weather data." });
  }
});


const API_KEY = "6b118f3c4f9a96fd5fc0e4555331566e";

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

// cron.schedule("* * * * *", mailManager)
cron.schedule("* * * * *", async () => {
  try {
    const users = await User.find({});

    for (const user of users) {
      const weatherData = await getWeather(user.location);
      user.weatherData.push(weatherData);
      await user.save();

      // console.log(user);
      console.log(user.location);
      user.weatherData.forEach(u => {
        console.log(u.main.temp);
      });

      let tableRows = '';

      user.weatherData.forEach(u => {
        tableRows += `
          <tr>
            <td>${((u.main.temp - 32.0) * 5/9).toFixed(2)} &deg;C</td>
            <td>${u.weather[0].main}</td>
            <td>${u.main.humidity}%</td>
            <td>${u.wind.speed} MPH</td>
          </tr>`;
      });

      let setDateTime = DateTime.now().setZone('UTC').plus({ seconds:  user.weatherData[0].timezone})
      let localDateTime = setDateTime.toLocaleString(DateTime.DATETIME_FULL)

      const table = `
        <h1>Location: ${user.weatherData[0].name}</h1>
        <h2>${localDateTime}</h2>
        <hr>
        <table style="border-collapse: separate; border-spacing: 10px;">
          <tr>
            <th>Temperature (&deg;C)</th>
            <th>Description</th>
            <th>Humidity</th>
            <th>Wind (MPH)</th>
          </tr>         
          ${tableRows}
        </table>
      `
      
      mailManager(user.email, table)
      console.log("Successfully updated");


    }
  } catch (err) {
    console.log(err);
  }
});


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
    // to: "one298591@gmail.com",
    to: email,
    subject: "Daily Weather Report",
    text: `The weather in your location is: Colombo`,
    html: table,
  });

  console.log("Message sent: " + info.messageId);
}

export default router;
