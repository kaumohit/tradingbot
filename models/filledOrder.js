const mongoose = require("mongoose");

const filledOrderSchema = new mongoose.Schema({
  date: String,
  orders: { 
      COSS_ETH: { type: Array, default: [] },
      COSS_BTC: { type: Array, default: [] }
   },
   updatedAt: Date 
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

module.exports = mongoose.model("Order_Record", filledOrderSchema);
