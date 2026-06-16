
const mongoose = require('mongoose');

const connectDB = async () =>{
    try{
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB is locked in');
    } catch(error){
        console.error('MongoDB is sellin us', error.message);
        process.exit(1);
    }
};
module.exports = connectDB;
