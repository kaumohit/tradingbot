const axios = require('axios');
const PAIR_ID = require('../LATOKEN_PAIR_ID').PAIRS;
let PAIR = null; 

class LATOKEN {
  constructor(apiKey, secret, pair) {
    try {
      console.log('PAIR: ', pair )
      this.apiKey = apiKey;
      this.secret = secret;
      this.pair = pair;
      PAIR = pair;
    } catch (error) {
      console.log(error);
    }
  }

/* DONE */
  async fetchBalance() {
    try {
      const response = await this.laTOKEN_APIConstruct('GET', 'trading/balance');
      // const data = {
      //   used: response.used,
      //   total: response.total
      // };
      return response;
    } catch (error) {
      throw error;
    }
  }

/* DONE */
  async fetchTicker() {
    try {
      // console.log('PAIR INSIDE LA:', PAIR);
      let pairID = this.pair == 'got/eth' ? 285 : 1135;
      const data = await this.laTOKEN_APIConstruct('GET', `trading/depth?tradingPairId=${pairID}`);
      let record = {
        timestamp: Date.now(),
        highBid: Number(data.bestBid),
        lowAsk: Number(data.bestAsk)
      };
      // console.log('PAIR-ID: ', pairID);
      console.log('BID AND ASK: ', record);
      return record;
      // data = JSON.parse(data);

      
    } catch (error) {
      throw error;
    }
  }

  /* UNDISCOVERED AS OF NOW FOR LA-TOKEN */
  async fetchTrades(count = null) {
    let data = null;
    let records = [];
    try {
      data = await this.exchange.fetchTrades(
        this.pair,
        Date.now() - 15 * 60 * 60 * 1000,
        50
      );
    } catch (error) {
      return error;
    }
    if (count == null) {
      count = data.length;
    }

    for (let i = data.length - 1; i > data.length - count; i--) {
      let entry = data[i];
      if (entry != undefined && entry != null) {
        let record = {
          id: entry.id,
          timestamp: entry.timestamp,
          pair: entry.symbol,
          side: entry.side,
          price: Number(entry.price).toFixed(7),
          amount: entry.amount
        };
        records.push(record);
      }
    }
    return records;
  }

/* DONE */
  async createOrder(obj) {
    // let pairID;
    // const resp = await this.laTOKEN_APIConstruct('GET', 'trading/tradingPairs');
    // resp.find(elem => {
    //   if (elem == this.pair.toUpperCase().trim()) pairID = elem.id;
    // });
    const pairID = this.pair.toLowerCase().trim() == 'got/btc' ? 1135 : 285;    
    const data = {
			tradingPairId: pairID,
			side: obj.side.toLowerCase(),
			type: obj.type.toLowerCase(),
			amount: Number(obj.amount),
			price: Number(obj.price),
		};
    return this.laTOKEN_APIConstruct('POST', 'trading/order', data).then(response => {
      return response;
    }).catch(e => {
      console.log('Inside CATCH in createOrder: ', e);
      throw e;
    });
}

/* DONE */
  async cancelOrder(id) {
    let record = null;
    // try {
    return this.laTOKEN_APIConstruct('DELETE', `trading/order?orderId=${id}`).then(data => {
      if (data.result && data.data === 'OK') record = true;
      else record = false;
      return record;
    }).catch(err => {
      console.log('Inside CATCH in cancelOrder: ', err);
      throw err;
    });
    // } catch (error) {
    //   throw error;
    // }
  }

  async fetchOrderStatus(id) {
    let data = null;
    try {
      data = await this.exchange.fetchOrderStatus(id, this.pair, {
        type: "BUY"
      });
    } catch (error) {
      try {
        data = await this.exchange.fetchOrderStatus(id, this.pair, {
          type: "SELL"
        });
      } catch (err) {
        data = err;
      }
    }
    return data;
  }

  async fetchOPENOrders() {
    // try {
      return this.laTOKEN_APIConstruct('GET', 'trading/orders?status=open').then(async openOrders => {
        console.log('OPEN ORDERS: '); 
        console.log(openOrders);
        for (let order of openOrders) {
          try {
            const isCancelled = await this.cancelOrder(order.id);
              if (isCancelled) continue;
              else console.log(`COULD NOT CANCEL LA_TOKEN ORDER ID: ${order.id}`);
            } catch(e) {
               console.log('Inside CATCH in fetchOpenOrders 1: ', e);
               throw e;
            }
          }
          return this.laTOKEN_APIConstruct('GET', 'trading/orders?status=open').then(leftOvers => {
            console.log('LEFT OVER ORDERS: '); console.log(leftOvers);
            if (leftOvers.length === 0) {
              console.log(`ALL PENDING TRADES CANCELLED SUCCESSFULLY!`);
              return true;
            } else {
              console.log(`${leftOvers} PENDING ORDERS LEFT. Trying again...`);
              this.fetchOPENOrders();
              // return false;
            }
          }).catch(err => {
            console.log('Inside CATCH in fetchOpenOrders 2: ', err);
            throw err;
          })
      
            
          // }
          // catch (e) {
          //   console.log(`INSIDE CATCH of latoken/fetchOpenOrders, ${e}`);
          // }
        }).catch(err => {
          console.log('Inside CATCH in fetchOpenOrders 3: ', err);
        })
      // openOrders = JSON.parse(openOrders)
      
      
    // } catch (e) {
    //   console.log('Error thrown in fetchOpenOrders: ', e);
    // }
  }
  
  
async laTOKEN_APIConstruct (type, apiName, data) {
  // debug('REQ: ', {req: req, data: data, type: type, apiName: apiName, KEY: apiKey});
	// console.log(`API_KEY: ${this.apiKey} || SECRET: ${this.secret}`)
	return new Promise((resolve, reject) => {
    // console.log("API KEY: ", apiKey);
    // console.log("API KEY: ", apiKey);
    axios({
      method: type,
      url: `https://latoken.com/api/v1/${apiName}`,
      headers: {
        "X-Api-Key": this.apiKey,
        "key" : this.secret
      },
      data: data
    }).then(resp => {
        // console.log('RESPONSE: ', resp.data.bestAsk, resp.data.bestBid);
        if (resp.data) {
          // console.log('2');
          resolve (resp.data);
        }
        else reject (null);
      })
      .catch(err => {
        if (err.response.status == 500) console.log(`Internal Server Error while hitting, ${apiName}, API`);
        else console.log('ERROR in LATOKEN CONSTRUCT: ', err.response.data);
        reject (err);
      });
  });
};	
}
module.exports = LATOKEN;
