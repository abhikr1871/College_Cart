const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  collegeName: { type: String, required: true },
  user_id:{type:Number,required:true,unique: true},
  profilePic: { type: String, default: '' }, // S3 URL for profile picture
  
  
}, { timestamps: true });

// Hash the password before saving the user model
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

module.exports = mongoose.model('User', userSchema);
