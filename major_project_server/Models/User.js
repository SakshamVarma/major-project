const mongoose=require('mongoose');
const { Schema } = mongoose;

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    docIds: [{ type: String, required: false }],
  });

const User=mongoose.model('User', UserSchema);
// User.createIndexes();
module.exports = User