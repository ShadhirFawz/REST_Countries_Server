import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  countryCode: { type: String, required: true }, // e.g., "FRA", "IND"
  rating: { type: Number, min: 1, max: 5 },
  review: String,
  note: String,
  createdAt: { type: Date, default: Date.now },
});

const Review = mongoose.model('Review', reviewSchema);
export default Review;