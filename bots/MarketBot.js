let Inventory = require("../models/inventory");
let filledOrder = require("../models/filledOrder");

class MarketBot {
  constructor(id1, id2, params) {
    this.id1 = id1;
    this.numberOfBands = params.numberOfBands;
    this.fixedVolume = params.fixedVolume;
    this.primaryBandOffset = params.primaryBandOffset;
    this.secondaryBandOffset = params.secondaryBandOffset;
    this.lastTradedPrice = null;
    this.initialPrice = null;
    this.checking = false;
    this.ordersByID1 = [];
    this.counterOrdersByID1 = [];
    this.closedOrdersByID1 = [];
  }

  async start() {
    console.log("started");
    this.runner();
  }

  async runner() {
    this.lastTrades = await this.id1.fetchTrades();
    console.log(this.lastTrades);
    this.lastTradedPrice = this.lastTrades[0].price;
    this.initialPrice = this.lastTradedPrice;
    console.log("Initial Base Price : ", this.initialPrice);
    let offsetcodes = [-1, 0, 1];
    for (let primary = 0; primary < this.numberOfBands * 2; primary++) {
      for (let secondary = 0; secondary < 3; secondary++) {
        if (primary < this.numberOfBands) {
          let price =
            (this.lastTradedPrice *
              (100 +
                (primary + 1) * this.primaryBandOffset +
                offsetcodes[secondary] * this.secondaryBandOffset)) /
            100;
          console.log("Sell Price ", primary + 1, " : ", price);
          console.log("*****************************");
          let sellOrder = await this.id1.createOrder(
            "limit",
            "sell",
            this.fixedVolume,
            price
          );
          let data = {
            orderId: sellOrder.id,
            side: sellOrder.side,
            price: sellOrder.price,
            state: sellOrder.status,
            timestamp: Date.now()
          };
          Inventory.create(data);
          this.ordersByID1.push(sellOrder.id);
          console.log("sell Order 1 posted from id1: ", sellOrder.id);
          console.log(sellOrder);
          console.log("*****************************");
        } else {
          let price =
            (this.lastTradedPrice *
              (100 -
                (primary - this.numberOfBands + 1) * this.primaryBandOffset +
                offsetcodes[secondary] * this.secondaryBandOffset)) /
            100;
          console.log(
            "Buy Price ",
            primary - this.numberOfBands + 1,
            " : ",
            price
          );
          console.log("*****************************");
          let buyOrder = await this.id1.createOrder(
            "limit",
            "buy",
            this.fixedVolume,
            price
          );
          let data = {
            orderId: buyOrder.id,
            side: buyOrder.side,
            price: buyOrder.price,
            state: buyOrder.status,
            timestamp: Date.now()
          };
          Inventory.create(data);
          this.ordersByID1.push(buyOrder.id);
          console.log("buy Order 1 posted from id1: ", buyOrder.id);
          console.log(buyOrder);
          console.log("*****************************");
        }
      }
    }
    await this.checkOrders();
  }

  async checkOrders() {
    console.log(this.ordersByID1);
    let alreadyClosed;
    let checkit = async () => {
      console.log("called");
      for (let j = 0; j < this.ordersByID1.length; j++) {
        alreadyClosed = false;
        let status = await this.id1.fetchOrderStatus(this.ordersByID1[j]);
        console.log(this.ordersByID1[j], status);
        if (status == "closed") {
          for (let i = 0; i < this.closedOrdersByID1.length; i++) {
            if (this.ordersByID1[j] == this.closedOrdersByID1[i]) {
              alreadyClosed = true;
            }
          }
          if (!alreadyClosed) {
            this.closedOrdersByID1.push(this.ordersByID1[j]);
            this.updateDatabase(this.ordersByID1[j], true);
          }
        }
      }
      for (let k = 0; k < this.closedOrdersByID1.length; k++) {
        let data = await Inventory.findOne({
          orderId: this.closedOrdersByID1[k]
        });
        if (data.state != "closed") {
          let status = await this.id1.fetchOrderStatus(
            this.closedOrdersByID1[k]
          );
          if (status == closed) {
            this.updateDatabase(this.closedOrdersByID1[k], false);
          }
        }
      }
      this.checking = false;
    };
    let checker = async () => {
      if (this.checking == false) {
        this.checking = true;
        await checkit();
      }
    };
    this.checkingIt = setInterval(checker, 60000);
  }

  updateDatabase(orderId, flag) {
    console.log("update Database callled");
    Inventory.findOneAndUpdate(
      { orderId: orderId },
      { state: "closed" },
      async (err, updatedOrder) => {
        let data = {
          orderId: updatedOrder.orderId,
          side: updatedOrder.side,
          price: updatedOrder.price,
          filledAt: Date.now()
        };
        console.log("Filled Order");
        console.log(data);
        filledOrder.create(data);
        if (flag) {
          let movement = data.price - this.lastTradedPrice;
          this.lastTradedPrice = data.price;
          console.log("Updated Base Price : ", this.lastTradedPrice);
          await this.counterTrades(movement);
        }
      }
    );
  }

  async counterTrades(movement) {
    let sellPrice;
    let buyPrice;
    if (movement > 0) {
      sellPrice =
        this.lastTradedPrice +
        (this.numberOfBands * this.primaryBandOffset * this.initialPrice) / 100;
      buyPrice =
        this.lastTradedPrice -
        (this.primaryBandOffset * this.initialPrice) / 100;
    } else {
      sellPrice =
        this.lastTradedPrice +
        (this.primaryBandOffset * this.initialPrice) / 100;
      buyPrice =
        this.lastTradedPrice -
        (this.numberOfBands * this.primaryBandOffset * this.initialPrice) / 100;
    }

    console.log("Counter Sell : ", sellPrice);
    console.log("Counter Buy : ", buyPrice);
    console.log(this.initialPrice);
    let buyPriceInLimit = buyPrice > 0.46 * this.initialPrice;
    let sellPriceInLimit = sellPrice < 1.54 * this.initialPrice;
    console.log(buyPriceInLimit, sellPriceInLimit);
    if (buyPriceInLimit && sellPriceInLimit) {
      console.log("*****************************");
      let sellOrder = await this.id1.createOrder(
        "limit",
        "sell",
        this.fixedVolume,
        sellPrice
      );
      let data = {
        orderId: sellOrder.id,
        side: sellOrder.side,
        price: sellOrder.price,
        state: sellOrder.status,
        timestamp: Date.now()
      };
      try {
        Inventory.create(data);        
      } catch (e) {
        console.log(e);
      }
      this.counterOrdersByID1.push(sellOrder.id);
      console.log("Counter sell Order : ", sellOrder.id);
      console.log(sellOrder);
      let buyOrder = await this.id1.createOrder(
        "limit",
        "buy",
        this.fixedVolume,
        buyPrice
      );
      let data1 = {
        orderId: buyOrder.id,
        side: buyOrder.side,
        price: buyOrder.price,
        state: buyOrder.status,
        timestamp: Date.now()
      };
      try {
        Inventory.create(data1);
      } catch (e) {
        console.log(e);
      }
      this.counterOrdersByID1.push(buyOrder.id);
      console.log("Counter buy Order : ", buyOrder.id);
      console.log(buyOrder);
      console.log("*****************************");
      return true;
    } else {
      await this.reset();
      return false;
    }
  }

  async reset(botId) {
    clearInterval(this.checkingIt);
    console.log("Resetting Bot...");
    this.ordersByID1 = [];
    let orders = await Inventory.find({ botId: botId });

    for (let order of orders) {
      if (order.state !== "closed") {
        try {
          await this.id1.cancelOrder(order.OrderId);
          console.log(`Cancelled order: ${order.OrderId}`);
        } catch (err) {
          console.log(err);
        }
      }
      try {
        let status = await this.id1.fetchOrderStatus(order.OrderId);
        if (status != "closed") {
          await Inventory.findByIdAndRemove(order.OrderId);
        }
        console.log(`Removed from Database: ${order.OrderId}`);
      } catch (err) {
        console.log(err);
      }
    }
    return true;
  }

  async stop(id) {
    await this.reset(id);
    this.status = "stopped";
  }
}

module.exports = MarketBot;
