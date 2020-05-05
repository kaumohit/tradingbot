let delay = require("delay");
const dbETH = require("../config/level").ETH_GOT_DB;
const dbBTC = require("../config/level").BTC_GOT_DB;
const axios = require("axios");
const Orders = require("../models/filledOrder");
const TRADE_FREQUENCY = Number(process.env.TRADE_FREQ);
const TOTAL_ORDERS_COUNT = Number(process.env.ORDERS_COUNT);

class VolumeBot {
	constructor(id1, id2, params) {
		// this.averageFactor = params.averageFactor;
		this.tradeCount = params.tradeCount;
		this.spreadUpperLimit = params.spreadUpperLimit;
		this.spreadLowerLimit = params.spreadLowerLimit;
		this.i = 0;
		this.id1 = id1;
		this.id2 = id2;
		this.id1orders = [];
		this.id2orders = [];
		this.ordersByID1 = [];
		this.ordersByID2 = [];
		this.averageFactorApplied = false;
		// this.tradesAmountPercentage = params.tradesAmountPercentage;
		this.tradeNotHappenBefore = Number(params.tradeNotHappenBefore);
		this.volumeUpperLimit = params.volumeUpperLimit;
		this.volumeLowerLimit = params.volumeLowerLimit;
		this.status = "Running";
		this.totalTradeCount = 0;
		this.tradeAvg = null;
		this.levelDB = null;
		this.running = 0;
		this.startTime = Date.now();
		this.isStopCalled = 0;
	}

	async start() {
		let errArr = new Array();
		// this.id1.pair = 
		this.levelDB = this.id1.pair == 'got/eth' ? dbETH : dbBTC;
		console.log('TIME: ', this.tradeNotHappenBefore);
		// console.log({ID1: this.id1, ID2: this.id2})
		this.botInterval = setInterval(async () => {
			// const sprd = await this.checkSpread();
			// console.log(`Market Spread ${sprd}.`)
			// let data = await this.id1.fetchTrades(2);
				// if (data[0] == undefined) {
				// 	data = await this.id1.fetchTrades(2);
				// }
				if (this.running == 0) {
					console.log("\n------------Starting BOT-------------\n");

					if (Date.now() > this.startTime - 60 * 60 * 1000) {
						this.deleteOPENOrders().then(async a => {
							console.log('DLT OPEN ORDERS: ', a);
							if (a) {
								console.log('Executing...\n')
								// if (
								//   data[0].timestamp <
								//   Date.now() - this.tradeNotHappenBefore * 60 * 1000
								// ) {
								this.i = 0;
								this.running = 1;
								await this.runner();
								this.startTime = Date.now();
								// } else {
								//   console.log(
								//     `Some Trade happened within past ${
								//       this.tradeNotHappenBefore
								//     } minutes.`
								//   );
								// }
							} else {
								console.log(`deleteOPENOrders didn't return true.... Could not start bot.`, a);
							}
						}).catch(err => {
							console.log('ERROR Occurred in deleteOPENOrders...', err);
							errArr.push(err);
							this.levelDB.put("Errors", errArr).then(async (res) => {
								this.running = 1;
								await this.runner();
								this.startTime = Date.now();
							}).catch(err => {
								console.log("ERROR OCCURRED IN ERROR LOGGING LEVEL!! Exiting...");
								console.log(err);
								process.exit(1);
							});
						});
					}
				}
			
		}, 20 * 1000);
	}

	async updateMongoDBOrderData(pair, data) {
		// console.log('Saving in MONGO-DB.......');
		if (data.length == 4) {
			if (pair == 'got/eth') {
				this.levelDB = dbETH;
				return Promise.all(
					data.map(o => Orders.update(
						{ date: new Date().toDateString(), 'orders.GOT_ETH.ORDER_ID': { $ne: o.ORDER_ID } },
						{ updatedAt: new Date(), $push: { 'orders.GOT_ETH': o } }, { upsert: true }))).then(async result => {
							return result;
						}).catch(err => {
							console.log('Error inside MongoDB Updated Function ETH');
							return new Error(err);
						});
			} else {
				this.levelDB = dbBTC;
				return Promise.all(
					data.map(o => Orders.update(
						{ date: new Date().toDateString(), 'orders.GOT_BTC.ORDER_ID': { $ne: o.ORDER_ID } },
						{ updatedAt: new Date(), $push: { 'orders.GOT_BTC': o } }, { upsert: true }))).then(async result => {
							return result;
						}).catch(err => {
							console.log('Error inside MongoDB Updated Function BTC');
							return new Error(err);
						});
			}
		} else {
			console.log('SOMETHING"S WRONG!!!!!!!!!');
			console.log(data);
		}
	}

	// async checkSpread() {
	// 	let tkerData = await this.id1.fetchTicker();
	// 	console.log(`LOW ASK: ${tkerData.lowAsk}, HIGH BID: ${tkerData.highBid}`);
	// 	const decimals = tkerData.lowAsk.toString().split('.')[1].length;
	// 	const mkt_spread = Math.floor(Math.abs(Number(tkerData.lowAsk).toFixed(decimals) - Number(tkerData.highBid).toFixed(decimals)) * 10 ** decimals);
	// 	if (mkt_spread <= 200) return true;
	// 	else return new Error(false);
	// }
	
	async runner() {

		// console.log('PAIR INFO: ', this.id1.pair, this.id2.pair);
		let tradesAmount = null;
		let tradesPrice = null;
		let lastVolumeGOT = null;
		let isSpreadOk

		if (this.i < this.tradeCount) {
			// for  (let i = 0; i < this.tradeCount; i++) {
			// const tradeData = await this.levelDB.get('trades');
			// console.log('inside runner 2...')
			console.log(`# of trades to be Pushed: ${this.id1orders.concat(this.id2orders).length}`);
			// console.log('ID1 Orders: '+this.id1orders+'\n ID2 Orders: '+this.id2orders);
			// console.log(this.id1orders.concat(this.id2orders));
			this.updateMongoDBOrderData(this.id1.pair, this.id1orders.concat(this.id2orders)).then(async (mongoRes) => {
				console.log('MongoDB Updated 1: ', mongoRes);
				this.totalTradeCount += this.id1orders.length + this.id1orders.length;
				this.id1orders = [];
				this.id2orders = [];
				// const sp = await this.checkSpread();
				if (this.isStopCalled === 0) {
					// while (i < 2) {
					// console.log("trades");
					tradesPrice = await this.getPrice();
					let tkerData = await this.id1.fetchTicker();
					// const decimals = tkerData.lowAsk.toString().split('.')[1].length;
					// console.log(`\nChecking Spread...\n`);
					// // let mkt_spread = 90;
					// let mkt_spread = Math.floor(Math.abs(Number(tkerData.lowAsk).toFixed(decimals) - Number(tkerData.highBid).toFixed(decimals)) * 10 ** decimals);
					// console.log(`Market Spread: ${mkt_spread}.`);
					// if (mkt_spread <= 100) {
					// 	console.log(`Market Spread very slim.`);
					// 	break;
					// } else {
					lastVolumeGOT = await this.levelDB.get("volumeGOT");
					tradesAmount = await this.getRandomVolume();
					// Promise.all([this.getPrice(), this.getRandomVolume(), this.levelDB.get("volumeGOT")]).then(async promRes1 => {
					console.log('Number of Trades since last start: \n', this.totalTradeCount);
					console.log(`\n\n////////////////////FIRST ROUND (GOT VOLUME BOT: ${this.id1.pair})/////////////////////////\n\n`);
					console.log('SELL 1: \n');
					console.log({ TRADE_PRICE: tradesPrice, TRADE_AMOUNT: tradesAmount });
					console.log("*****************************\n");
					let sellOrder1 = null;
					const a = {
						type: "limit",
						side: "sell",
						// amount: Math.random() * 10000,
						// price: Math.random().toFixed(8),
						amount: Number(tradesAmount),
						price: Number(tradesPrice).toFixed(8)
					};
					try {
						// a.ORDER_ID = 'AAAAabcddefg12345678';
						// a.lowAsk = Math.random().toFixed(8);
						// a.highBid = Math.random().toFixed(8);
						sellOrder1 = await this.id1.createOrder(a);
						a.ID = 'ID 1';
						a.lowAsk = tkerData.lowAsk;
						a.highBid = tkerData.highBid;
						a.ORDER_ID = sellOrder1;
						a.Date = new Date().toLocaleDateString() + ' @ ' + new Date().toLocaleTimeString();
						this.id1orders.push(a);
						// console.log("********** ORDERS ARRAY ID 1 ***********\n");
						// console.log(this.id1orders);
						// console.log("********** ORDERS ARRAY ID 1 ***********\n");
						this.ordersByID1.push(sellOrder1);
					} catch (err) {
						console.log(`Error in Creating Order 1: ${err}`);
						this.status = err.message;
					}
					console.log(`SELL ORDER posted from ID 1: `); console.log(sellOrder1);
					console.log("*****************************\n");
					console.log('BUY 1: \n');
					console.log({ TRADE_PRICE: tradesPrice, TRADE_AMOUNT: tradesAmount });

					let buyOrder1;
					const b = {
						type: "limit",
						side: "buy",
						// amount: Math.random() * 10000,
						// price: Math.random().toFixed(8),
						amount: Number(tradesAmount),
						price: Number(tradesPrice).toFixed(8)
					};
					try {
						// b.lowAsk = Math.random().toFixed(8);
						// b.highBid = Math.random().toFixed(8);
						// b.ORDER_ID = 'BBBBabcddefg12345678';
						buyOrder1 = await this.id2.createOrder(b);
						b.ID = 'ID 2';
						b.lowAsk = tkerData.lowAsk;
						b.highBid = tkerData.highBid;				
						b.ORDER_ID = buyOrder1;
						b.Date = new Date().toLocaleDateString() + ' @ ' + new Date().toLocaleTimeString();
						this.id2orders.push(b);
						this.ordersByID2.push(buyOrder1);
						// console.log("********** ORDERS ARRAY ID 2 ***********\n");
						// console.log(this.id2orders);
						// console.log("********** ORDERS ARRAY ID 2 ***********\n");
					} catch (err) {
						console.log(`Error in Creating Order 2: ${err}`);
						this.status = err.message;
					}
					console.log(`BUY ORDER posted from ID 2: `); console.log(buyOrder1);
					console.log("*****************************\n");
					let date = new Date().toDateString();
					let time = new Date().toLocaleTimeString();
					let newVolumeGOTVal = Number(lastVolumeGOT) + Number(tradesPrice) * Number(tradesAmount);
					if (isNaN(Number(tradesPrice) * Number(tradesAmount))) {
						newVolumeGOTVal = Number(lastVolumeGOT) + 0;
						console.log('\n******** NaN in volumeGOT *********\n');
					}
					await this.levelDB.put("volumeGOT", newVolumeGOTVal);
					await this.levelDB.put("volumeLastUpdatedAt", `${date} ${time}`);
					// i++;
					let randomTime = Math.random() * TRADE_FREQUENCY;
					await delay(randomTime * 1000);

					tradesPrice = await this.getPrice();
					tkerData = await this.id1.fetchTicker();
					// console.log(`\nChecking Spread...\n`);
					// // let mkt_spread = 90;
					// mkt_spread = Math.floor(Math.abs(Number(tkerData.lowAsk).toFixed(decimals) - Number(tkerData.highBid).toFixed(decimals)) * 10 ** decimals);
					// console.log(`Market Spread: ${mkt_spread}.`);
					// if (mkt_spread <= 100) {
					// 	console.log(`Market Spread very slim.`);
					// 	break;
					// } else {
					tradesAmount = await this.getRandomVolume();
					lastVolumeGOT = await this.levelDB.get("volumeGOT");
					// Promise.all([this.getPrice(), this.getRandomVolume(), this.levelDB.get("volumeGOT")]).then(async promRes3 => {

					console.log(`\n\n////////////////////SECOND ROUND (GOT VOLUME BOT: ${this.id1.pair})/////////////////////////\n\n`);
					console.log('SELL 2: \n');
					console.log({ TRADE_PRICE: tradesPrice, TRADE_AMOUNT: tradesAmount });

					let sellOrder2;
					const c = {
						type: "limit",
						side: "sell",
						// amount: Math.random() * 10000,
						// price: Math.random().toFixed(8),
						amount: Number(tradesAmount),
						price: Number(tradesPrice).toFixed(8)
					};
					try {
						// c.lowAsk = Math.random().toFixed(8);
						// c.highBid = Math.random().toFixed(8);
						// c.ORDER_ID = 'CCCCabcddefg12345678';
						sellOrder2 = await this.id2.createOrder(c);
						c.ID = 'ID 2';
						c.Date = new Date().toLocaleDateString() + ' @ ' + new Date().toLocaleTimeString();
						c.ORDER_ID = sellOrder2;
						c.lowAsk = tkerData.lowAsk;
						c.highBid = tkerData.highBid;				
						this.id2orders.push(c);
						this.ordersByID2.push(sellOrder2);
						// console.log("********** ORDERS ARRAY ID 2 ***********\n");
						// console.log(this.id2orders);
						// console.log("********** ORDERS ARRAY ID 2 ***********\n");
					} catch (err) {
						console.log(`Error in Creating Order 3: ${err}`);
						this.status = err.message;
					}
					console.log(`SELL ORDER posted from ID 2:`); console.log(sellOrder2);
					console.log("*****************************");
					console.log('BUY 2: \n');
					console.log({ TRADE_PRICE: tradesPrice, TRADE_AMOUNT: tradesAmount });
					let buyOrder2;
					const d = {
						type: "limit",
						side: "buy",
						// amount: Math.random() * 10000,
						// price: Math.random().toFixed(8),
						amount: Number(tradesAmount),
						price: Number(tradesPrice).toFixed(8)
					};
					try {
						// d.ORDER_ID = 'DDDDabcddefg12345678';
						// d.lowAsk = Math.random().toFixed(8);
						// d.highBid = Math.random().toFixed(8);
						buyOrder2 = await this.id1.createOrder(d);
						d.ID = 'ID 1';
						d.Date = new Date().toLocaleDateString() + ' @ ' + new Date().toLocaleTimeString();
						d.ORDER_ID = buyOrder2;
						d.lowAsk = tkerData.lowAsk;
						d.highBid = tkerData.highBid;
						this.id1orders.push(d);
						this.ordersByID1.push(buyOrder2);
						// console.log("********** ORDERS ARRAY ID 1 ***********\n");
						// console.log(this.id1orders);
						// console.log("********** ORDERS ARRAY ID 1 ***********\n");
					} catch (err) {
						console.log(`Error in Creating Order 4: ${err}`);
						this.status = err.message;
					}
					console.log(`BUY ORDER posted from ID 1:`); console.log(buyOrder2);
					console.log("*****************************\n");

					date = new Date().toDateString();
					time = new Date().toLocaleTimeString();
					newVolumeGOTVal = Number(lastVolumeGOT) + Number(tradesPrice) * Number(tradesAmount);
					if (isNaN(Number(tradesPrice) * Number(tradesAmount))) {
						newVolumeGOTVal = Number(lastVolumeGOT) + 0;
						console.log('\n******** NaN in volumeGOT *********\n');
					}
					await this.levelDB.put("volumeGOT", newVolumeGOTVal);
					await this.levelDB.put("volumeLastUpdatedAt", `${date} ${time}`);


					console.log(`# of Orders By ID1: ${this.id1orders.length} || # of Orders By ID2: ${this.id2orders.length}`);
					try {
						if (this.id1orders.length == 10 && this.id2orders.length == 10)
							await delay(this.tradeNotHappenBefore * 60 * 1000);
						if (this.status === "stopped" || this.isStopCalled === 1) {
							console.log('Deleting Orders Done, Bot has been stopped!');
						} else {
							const deletePartOrders = await this.deletePARTOpenOrders();
							if (deletePartOrders) console.log('Successfully Cancelled Part-Filled Orders');
							// else console.log('SWW in cancelling Part-Filled Orders');
						}
					} catch (e) {
						console.log('Error Occured in LEVEL/DELETE PART Section ', e);
						process.exit(1);
					}
					this.i += 1;
					randomTime = Math.random() * TRADE_FREQUENCY;
					await delay(randomTime * 1000);
					this.runner();

				} else {
					console.log('\n+-+-+- Terminating Trading Processes -+-+-+\n');
					if (this.id1orders.length > 0 && this.id1orders.length > 0 ){
						console.log('Saving Last Executed Trades in Mongo before termination...');
						this.updateMongoDBOrderData(this.id1.pair, this.id1orders.concat(this.id2orders)).then(async (mongoRes2) => {
							console.log('Saved Last Trades!', mongoRes2);
							this.totalTradeCount += this.id1orders.length + this.id1orders.length;
							this.id1orders = [];
							this.id2orders = [];
							this.isStopCalled = 2;
							if (this.id1orders.concat(this.id2orders).length == 10) 
							await delay(this.tradeNotHappenBefore * 60 * 1000);
						}).catch(err => {
							console.log('Error in saving Last Trades!', err);
							process.exit(1);
						});
					} else {
						this.isStopCalled = 2;
					}
				}
			}).catch(err => {
				console.log('Error in MONGO-DB: ', err);
				process.exit(1);
			});
		} else {
			/* Saves all executed orders when this.tradeCount loop has finished */
			this.updateMongoDBOrderData(this.id1.pair, this.id1orders.concat(this.id2orders)).then(async (mongoRes) => {
				console.log('Saved Last Trades NEXT ITER!', mongoRes);
				this.totalTradeCount += this.id1orders.length + this.id1orders.length;
				this.id1orders = [];
				this.id2orders = [];
				this.isStopCalled = this.isStopCalled == 1 ? 2 : 0;
				this.running = 0;
				await delay(this.tradeNotHappenBefore * 60 * 1000);
			}).catch(err => {
				console.log('Error in saving Last Trades!', err);
				process.exit(1);
			});
		}
	}

	async laTOKEN_APIConstruct(apiKey, secret, id) {
		// debug('REQ: ', {req: req, data: data, type: type, apiName: apiName, KEY: apiKey});
		// console.log(`API_KEY: ${this.apiKey} || SECRET: ${this.secret}`)
		return new Promise((resolve, reject) => {
			// console.log("API KEY: ", apiKey);
			// console.log("API KEY: ", apiKey);
			axios({
				method: 'GET',
				url: `https://latoken.com/api/v1/trading/order?orderId=${id}`,
				headers: {
					"X-Api-Key": apiKey,
					"key": secret
					//"X-Api-Key": 'api-v1-7559123e991ac353bb7d22c5ab50b283',
					//"key" : 'api-v1-secret-1ccc7c1b8325f6716e3b0279ab9acf1d'
				},
				// data: data
			}).then(resp => {
				// console.log('RESPONSE: ', resp.data.bestAsk, resp.data.bestBid);
				if (resp.data) {
					// console.log('2');
					resolve(resp.data);
				}
				else reject(null);
			})
				.catch(err => {
					if (err.response.status == 429 || err.response.status == 500)
						console.log(`${err.response.status} CODE returned.`);
					else console.log('ERROR in volumeBOTGOT/LATOKEN CONSTRUCT: ', err);
					reject(err);
				});
		});
	};

	async getRandomVolume() {
		const random = Math.random();
		console.log(`\n----------------AMOUNT---------------------`);
		// console.log(`RANDOM: , ${random}`);
		const diff = this.volumeUpperLimit - this.volumeLowerLimit;
		// console.log(`DIFFERENCE: , ${diff}`);    
		const amount = Math.floor(random * diff + Number(this.volumeLowerLimit));
		console.log(`Trade Amount: ${amount}`);
		console.log(`----------------AMOUNT---------------------\n`);

		return amount;
	}

	async getPrice() {
		const tickerData = await this.id1.fetchTicker();
		if (tickerData.lowAsk === 0 || tickerData.highBid === 0) {
			console.log(`BID OR ASK COMING OUT TO BE ZERO...: ${tickerData}. Retrying`);
			await this.getPrice();
		} else {
			console.log(`\n*******************PRICE*********************`)
			console.log(`TICKER DATA: `); console.log(tickerData);
			let spread = Number(tickerData.lowAsk) - Number(tickerData.highBid);
			console.log(`Spread: ${spread}`);
			let randomValue = Math.floor(
				Math.random() * Number(this.spreadUpperLimit - this.spreadLowerLimit) +
				Number(this.spreadLowerLimit) + 1);
			let tradesPrice =
				Number(tickerData.highBid) + Number((randomValue / 100) * spread);
			// if (tradesPrice == Number(tickerData.lowAsk) || tradesPrice == Number(tickerData.highBid)){
			// 	console.log(`Price computed equal to eiher lowAsk or highBid. Recomputing...`);
			// 	await this.getPrice();
			// } else {
			console.log(`Trade Price: ${tradesPrice}`);
			console.log(`*******************PRICE*********************\n`)
			return tradesPrice;
			// }
		}
	}

	async deleteOPENOrders() {
		return Promise.all([this.id1.fetchOPENOrders(), this.id2.fetchOPENOrders()])
			.then(result => {
				const ID1_delete_status = result[0];
				const ID2_delete_status = result[1];
				// console.log(``);
				if (ID1_delete_status && ID2_delete_status) {
					console.log('ALL PENDING ORDERS FROM BOTH IDs CANCELLED SUCCESSFULLY!');
					return true;
				}
				else {
					console.log(`RESULT from deleteOpenOrders: ${result}`);
					console.log(`ID1 ORDER STATUS: ${ID1_delete_status} || ID2 ORDER STATUS: ${ID2_delete_status}`);
					return false;
				}
			}).catch(err => {
				console.log(`Error in DeleteOPENorders: `, err);
				throw err;
			});
	}

	async deletePARTOpenOrders(stopCall) {
		if (stopCall || this.ordersByID1.length + this.ordersByID1.length >= TOTAL_ORDERS_COUNT) {
			console.log(`\n/-/-/-/-/-/-/-/---- DELETING PARTIALLY FILLED ORDERS ----/-/-/-/-/-/-/-/\n`);
			const promONE = Promise.all(
				this.ordersByID1.map(o => this.laTOKEN_APIConstruct('api-v1-39b70f507b0aea6ecfb71864840bce3c', 'api-v1-secret-00144c2795fcc9f6f7c129cfda1a5235', o)))
				.then(async result => {
					let i;
					// console.log('RESULTS I: ', result);
					for (i = 0; i < result.length; i++) {
						if (!(result[i].status === 'filled')) {
							console.log(`PARTLLY. FILLED ORDER CAUGHT: ID 1,stat: ${result[i].status} orderID: ${result[i].orderId}`);
							try {
								let prom = await this.id1.cancelOrder(result[i].orderId);
								console.log(`----------- PROMISE 1 VAL: ${prom} ---------------`);
								if (prom) console.log('Partially Filled Order Cancelled!');
								else {
									console.log('Could not CANCEL Partially Filled Order', prom);
									throw (`Cancelling Part-filled Order operation failed for order by ID 1 with ORDER-ID: ${result[i].orderId}`);
								}
							} catch (e) {
								console.log(`Inside CATCH in GOT deletePARTOpenOrders/cancelOrder: `, err);
								throw err;
							}
						} else continue;
					}
					if (i === result.length) return true;
				}).catch(err => {
					console.log(`Error in first PROM.ALL: ${err}`);
					throw err;
				});
			const promTWO = Promise.all(
				this.ordersByID2.map(k => this.laTOKEN_APIConstruct('api-v1-7559123e991ac353bb7d22c5ab50b283', 'api-v1-secret-1ccc7c1b8325f6716e3b0279ab9acf1d', k)))
				.then(async result => {
					// console.log('RESULTS J: ', result);
					let j;
					for (j = 0; j < result.length; j++) {
						if (!(result[j].status === 'filled')) {
							console.log(`PARTLLY. FILLED ORDER CAUGHT: ID 2, stat: ${result[j].status} orderID: ${result[j].orderId}`);
							try {
								let prom = await this.id2.cancelOrder(result[j].orderId);
								console.log(`----------- PROMISE 2 VAL: ${prom} ---------------`);
								if (prom) console.log('Partially Filled Order Cancelled!');
								else {
									console.log('Could not CANCEL Partially Filled Order', prom);
									throw (`Cancelling Part-filled Order operation failed for order by ID 2 with ORDER-ID: ${result[j].orderId}`);
								}
							} catch (e) {
								console.log(`Inside CATCH in GOT deletePARTOpenOrders/cancelOrder: `, err);
								throw err;
							}
						} else continue;
					}
					if (j === result.length) return true;
				}).catch(err => {
					console.log(`Error in second PROM.ALL: ${err}`);
					throw err;
				});

			return Promise.all([promONE, promTWO]).then(promiseRES => {
				if (promiseRES[0] && promiseRES[1]) {
					this.ordersByID1 = [];
					this.ordersByID2 = [];
					return true;
				} else throw (`Both PROMISES FAILED TO RETURN TRUE=> P1: ${promiseRES[0]}, P2: ${promiseRES[1]}`);
			}).catch(err => {
				console.log(`Error in MASTER PROMISE-ALL of deletePARTOpenOrders: ${err}`);
				throw err;
			});
		} else {
			console.log(`deletePARTOpenOrders NOT REQUIRED to be called...`);
		}
	}

	async stop() {
		this.isStopCalled = 1;
		let a = async () => {
			try {
				// console.log('INTERVAL: ' + this.botInterval);
				// if (this.running === 2) {
				clearInterval(this.botInterval);
				const status2 = await this.deletePARTOpenOrders(true);
				const status1 = await this.deleteOPENOrders();
				if (status1 && status2) console.log(`SAFE TO STOP BOT`);
				else console.log(`DELETE OPEN ORDERS DIDN'T EXECUTE PROPERLY... STAT1: ${status1} || STAT2: ${status2}`);
				this.ordersByID1 = [];
				this.ordersByID2 = [];
				this.status = "stopped";
				this.isStopCalled = 0;
				this.totalTradeCount = 0;
				clearInterval(myInterval);

				// } else {
				// 	console.log('Waiting for Trade Processes to end...');
				// 	this.stop();
				// }
			}
			catch (err) {
				console.log(`Error thrown in STOP function: `, err);
			}
		}
		const myInterval = setInterval(() => {
			if (this.isStopCalled === 2) a();
			else {
				console.log('Waiting for Trade Processes to end...');
			}
		}, 5000)
	}

	// async laTOKEN_APIConstruct (type, apiName, data) {
	// 	// debug('REQ: ', {req: req, data: data, type: type, apiName: apiName, KEY: apiKey});
	// 	console.log(`API_KEY: ${this.apiKey} || SECRET: ${this.secret}`)
	// 	return new Promise((resolve, reject) => {
	// 		// console.log("API KEY: ", apiKey);
	// 		// console.log("API KEY: ", apiKey);
	// 		axios({
	// 			method: type,
	// 			url: `https://latoken.com/api/v1/${apiName}`,
	// 			headers: {
	// 				"X-Api-Key": this.apiKey,
	// 				"key" : this.secret
	// 			},
	// 			data: data
	// 		}).then(resp => {
	// 				// console.log('RESPONSE: ', resp.data.bestAsk, resp.data.bestBid);
	// 				if (resp.data) {
	// 					console.log('2');
	// 					resolve (resp.data);
	// 				}
	// 				else reject (null);
	// 			})
	// 			.catch(err => {
	// 				console.log('ERROR in LATOKEN CONSTRUCT: ', err);
	// 				reject (err);
	// 			});
	// 	});
	// };	
}

module.exports = VolumeBot;
