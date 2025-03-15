const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect('mongodb+srv://tranquocdong102:uIFYTUJ9naAOZEKe@cluster0.s51on.mongodb.net/ecommerce', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');
  } catch (err) {
    console.error(err);
  }
};

module.exports = connectDB;