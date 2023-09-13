
import express from "express";
const router = express.Router();
import User from "../Models/user.js";
import nodeMailer from 'nodemailer';



// Store user details
router.post('/saveUser', async (req, res) => {
  try {
    const newUser = new User({ 
        email: req.body.email, 
        location: req.body.location
     });
    const user = await newUser.save();
    res.send({
        _id: user._id,
        email: user.email,
        location: user.location,
    })

  } catch (error) {
    res.status(500).json({ 
        error: 'User Registration Failed!...' 
    });
  }
});

router.put('/updateUser/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const { location } = req.body;
      const user = await User.findByIdAndUpdate(userId, { location }, { new: true });
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: 'Could not update location.' });
    }
  });





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

  // const tesk = () => {
  //   console.log("Hello")
  // }

  // cron.schedule("* * * * *", tesk)

  let mailTrans = nodeMailer.createTransport({
    service: 'gmail',
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: 'twodemo83@gmail.com',
      pass: 'ppcbghnyqmxmlznj'
  }
})

  let details = {
    from: 'twodemo83@gmail.com',
    to: 'one298591@gmail.com',
    subject: 'Daily Weather Report',
    text: `The weather in your location is: `,
  }

  // mailTrans.sendMail(details, (err)=>{
  //   if(err){
  //       console.error(err)
  //   }else{
  //       console.log("send")
  //   }
  // })

  const sendMail = async (details, mailTrans) => {
    try{
      await mailTrans.sendMail(details);
      console.log("send")
    }catch(err){
      console.log(err)
    }
  }

  sendMail(details, mailTrans);

export default router;
