import mongoose from 'mongoose'


const weatherDataSchema = new mongoose.Schema(
    {
      date: { type: Date, default: Date.now },
      weatherData: [],
    },
    { _id: false }
  );

const userSchema = new mongoose.Schema(
    {
        email: {type: String, required: true, unique: true},
        location: {type: String, required: true},
        data: [weatherDataSchema],
    },
    {
        timestamps: true
    }
)


const User = mongoose.model('User', userSchema);
export default User