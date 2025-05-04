import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String }, // Optional
  profilePic: {
    data: Buffer,
    contentType: String,
  },
  favorites: [
    {
      code: { type: String, required: true },
      name: String,
      flag: String,
    }
  ],
  recentlyViewed: [
    {
      countryCode: { type: String },
      viewedAt: { type: Date, default: Date.now },
    },
  ],
}, { timestamps: true });

export default mongoose.model("User", userSchema);
//module.exports = mongoose.model('User', userSchema);