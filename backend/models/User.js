// models/User.js

const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    phoneNumber: {
      type: String,
      required: true,
    },
    location: {
      city: {
        type: String,
        required: true,
      },
      state: {
        type: String,
        required: true,
      },
      pincode: {
        type: String,
        required: true,
      },
    },
    // Add other fields as necessary
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
