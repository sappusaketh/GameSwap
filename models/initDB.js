const mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);
const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/mydb', {
      useUnifiedTopology: true,
      useNewUrlParser: true,
      useCreateIndex: true,
    });
    console.log('Connected to MongoDB');
  } catch (err) {
    console.log(err.message);
    // Exit process incase of Failure
    process.exit(1);
  }
};

module.exports = connectDB;
