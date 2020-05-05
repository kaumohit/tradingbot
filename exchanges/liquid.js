let ccxt = require("ccxt");

class Liquid {
  constructor(apiKey, secret, pair) {
    try {
      this.pair = pair;

      this.exchange = new ccxt.liquid({ apiKey: apiKey, secret: secret });
    } catch (error) {
      console.log(error);
    }
  }

  async fetchBalance() {
    try {
      let data = await this.exchange.fetchBalance();
      let record = { free: data.free, used: data.used, total: data.total };
      return record;
    } catch (error) {
      return error;
    }
  }

  async fetchTicker() {
    try {
      let data = await this.exchange.fetchTicker(this.pair);

      let record = {
        timestamp: Date.now(),
        highBid: Number(data.info.market_bid).toFixed(8),
        lowAsk: Number(data.info.market_ask).toFixed(8),
        volume: data.info.volume_24h,
        lastTradedPrice: data.info.last_traded_price,
        lastTradedQuantity: data.info.last_traded_quantity
      };
      return record;
    } catch (error) {
      return error;
    }
  }

  async fetchTrades(count = null) {
    let data = null;
    let records = [];
    try {
      data = await this.exchange.fetchTrades(this.pair);
    } catch (error) {
      return error;
    }
    if (count == null) {
      count = data.length;
    }

    for (let i = data.length - 1; i > data.length - count; i--) {
      let entry = data[i];
      let record = {
        id: entry.id,
        timestamp: entry.timestamp,
        pair: entry.symbol,
        side: entry.side,
        price: Number(entry.price).toFixed(8),
        amount: entry.amount
      };
      records.push(record);
    }
    return records;
  }

  async createOrder(type, side, amount, price) {
    let record = null;
    let data = null;
    side = side.toLowerCase();
    try {
      data = await this.exchange.createOrder(
        this.pair,
        type,
        side,
        amount,
        price
      );
    } catch (error) {
      return error;
    }

    record = {
      id: data.id,
      amount: data.amount,
      price: data.price,
      side: data.side,
      status: data.status
    };

    return record;
  }

  async cancelOrder(id) {
    let record = null;
    let data = null;
    try {
      console.log(id);
      data = await this.exchange.cancelOrder(id, this.params);
      record = {
        id: data.id,
        status: data.status
      };
    } catch (error) {
      return error;
    }
    return record;
  }

  async fetchOrderStatus(id) {
    let data = null;
    try {
      data = await this.exchange.fetchOrderStatus(id, this.pair);
    } catch (error) {
      return error;
    }
    return data;
  }
}

module.exports = Liquid;
