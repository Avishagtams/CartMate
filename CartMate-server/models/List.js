const mongoose = require("mongoose");

const listSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    trim: true 
  }, // שם הרשימה

  items: [
    {
      name: { type: String, required: true },   // שם המוצר
      quantity: { type: Number, default: 1 },   // כמות
      done: { type: Boolean, default: false }   // האם נקנה
    }
  ],

  owner: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  }, // מי יצר את הרשימה

  sharedWith: [
    { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  ], // משתמשים נוספים שיש להם גישה

}, { timestamps: true });

module.exports = mongoose.model("List", listSchema);
