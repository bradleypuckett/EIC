var mongoose = require("mongoose");

const baseOptions = {
  discriminatorKey: "itemtype", // our discriminator key, could be anything
  collection: "users" // the name of our collection
};

// Our Base schema: these properties will be shared with our "real" schemas
const userSchema = mongoose.model(
  "User",
  new mongoose.Schema(
    {
      userName: { type: String, required: true, max: 100 },
      userProfileImageId: { type: String, required: false, max: 200 },
      contact: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        match: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
      }
    },
    baseOptions
  )
);

module.exports = mongoose.model("User");
