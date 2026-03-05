const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name:          { type: String, required: true, trim: true },
  email:         { type: String, required: true, unique: true, lowercase: true },
  password:      { type: String, required: true, minlength: 6 },
  role:          { type: String, enum: ['customer', 'shopowner', 'admin'], default: 'customer' },
  avatar:        { type: String, default: '' },
  phone:         { type: String, default: '' },
  address: {
    street:  { type: String, default: '' },
    city:    { type: String, default: '' },
    state:   { type: String, default: '' },
    country: { type: String, default: '' },
    zip:     { type: String, default: '' },
  },
  language:        { type: String, enum: ['en', 'ar', 'hi', 'gu'], default: 'en' },
  loyaltyPoints:   { type: Number, default: 0 },
  isActive:        { type: Boolean, default: true },
  isBanned:        { type: Boolean, default: false },
  banReason:       { type: String, default: '' },
  recentlyViewed:  [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  pushSubscription:{ type: Object, default: null },
  emailVerified:   { type: Boolean, default: false },
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.matchPassword = async function (entered) {
  return await bcrypt.compare(entered, this.password);
};

module.exports = mongoose.model('User', userSchema);
