require("dotenv").config();

const mongoose = require("mongoose");

var inventorySchema = new mongoose.Schema({
  botId: String,
  orderId: String,
  side: String,
  lastTradedPrice: Number,
  price: Number,
  state: String,
  timestamp: { type: Date }
});

mongoose.connect(
  process.env.DBURL,
  { useNewUrlParser: true },
  err => {
    if (err) {
      console.log(err);
    } else {
      console.log("db connected");
    }
  }
);

module.exports = mongoose.model("Inventory", inventorySchema);
