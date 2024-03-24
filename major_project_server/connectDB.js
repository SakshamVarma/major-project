const mongoose = require('mongoose')

const mongooseURI="mongodb+srv://sakshamvarma02:shaktimaan@cluster0.e63rvig.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const connectToMongoose =()=>{
    //mongoose.connect(mongooseURI,{keepAlive:true});
    mongoose.connect(mongooseURI);
    const db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', function() {
        console.log("Connected to MongoDB");
    });


}

module.exports =connectToMongoose;