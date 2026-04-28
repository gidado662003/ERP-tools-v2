const mongoose = require("mongoose");
const { Schema } = mongoose;
const categorySchema = new Schema({
  name: {
    type: String,
    required: [true, "Category name is required."],
    trim: true,
    unique: true,
    minlength: [2, "Category name must be at least 2 characters."],
    set: (value) => value.toLowerCase(),
  },
  description: {
    type: String,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("requestCategory", categorySchema);
