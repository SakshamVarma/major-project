// const mongoose = require('mongoose')

// const mongooseURI=process.env.ATLAS;

// const connectToMongoose =()=>{
//     //mongoose.connect(mongooseURI,{keepAlive:true});
//     mongoose.connect(mongooseURI);
//     const db = mongoose.connection;
//     db.on('error', console.error.bind(console, 'connection error:'));
//     db.once('open', function() {
//         console.log("Connected to MongoDB");
//     });


// }

// module.exports =connectToMongoose;