require("dotenv").config();
const WebSocket = require("ws");
/* 285: GOT/ETH & 1135: GOT/BTC */
let ws = new WebSocket('wss://wallet.latoken.com/api/ws/');

// let establishConnection = () => {
// 	console.log('CONNECTING....');
	ws = new WebSocket('wss://wallet.latoken.com/api/ws/');
	ws.onopen = async (event) => {
		console.log('Socket Connected! ');
		ws.send(JSON.stringify({ 
			method: 'ticker', params: { 
			channel: 285 }}
			));	
		// ws.on('ORDER', function incoming(data) {
		// 	console.log('**************** TRADE DATA EVENT *****************');
		// 	console.log(data);
		// 	console.log('*****************************************************');
		//   });
		ws.onmessage = function (event) {
			if (JSON.parse(event.data).data){
				console.log(JSON.parse(event.data).data);
				// if (JSON.parse(event.data).data.id === 285){
			// console.log('*****************************************************');
			// console.log(JSON.parse(event.data));
			// console.log('*****************************************************');			
			// } else {
			// 	console.log('NOT FOUND')
			// }
		}else {}

		}
		/* ws.send(JSON.stringify({ 
			method: 'join', params: { 
			channel: 285 }})); */
		
};
// ws.on('ticker', function incoming(data) {
// 	console.log('***********TICKER*******************');
// 	console.log(data);
// 	console.log('*************************************');	
// });
// }

// ws.onclose = function (event) {
// 	establishConnection();
// };

// // establishConnection();

// // const api = new RippleAPI({
// // 	server: 'wss://wallet.latoken.com/api/ws/'
// // });
// // api.on("error", (errorCode, errorMessage) => {
// // 	console.log(errorCode + ": " + errorMessage);
// // });
// // api.on("Connected", () => {
// // 	console.log('SOCK CONNECTED!');
// // });
// // api.on("Disconnected", code => {
// // 	console.log('SOCK DISCONNECTED!');
// // 	api.connect();
// // });
// // api
// // 	.connect()
// // 	.then(() => {
// // 		api.isConnected();
// // 	})
// // 	.catch(console.error);


