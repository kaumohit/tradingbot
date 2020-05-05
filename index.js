require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const filledOrder = require('./models/record');
// const router = require('./routes/volume');
const cors = require('cors');
const app = express();
const routes = require('./routes/routes');
require('./dbScript');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ extended: true }));

app.use(cors());

app.get('/', (req, res) => {
  res.sendFile('volumeBot.html', { root: '.' })
});

// var WebSocketServer = require('ws').Server,
//   wss = new WebSocketServer({port: 40510})


// wss.on('connection', function (ws) {
//   ws.on('message', function (message) {
//     console.log('received: %s', message)
//   })

//   setInterval(() => ws.send('HI WORLD!'),
//     3000);
// })
// mongoose.connect(
//   process.env.DBURL,
//   { useNewUrlParser: true },
//   async (err, res) => {
//     if (err) {
//       console.log(err);
//     } else {
//       // var dbo = db.db("mydb");
//       const a = await filledOrder.find({});
//       console.log((a));
//     //   await res.collection('record_latokens').find({}).toArray((err, result) => {
//     //     if (err) {
//     //       console.log(err);
//     //     } else console.log((result));
//     // })
//       // console.log(rec);
//     }
//   }
// );

// mongoose.Promise = global.Promise;

// mongoose.connect(process.env.DBURL, { useNewUrlParser: true }, )
//   .then((res) => {
//     var dbo = res.db("filledOrder");
//     dbo.collection("filledOrder").findOne({}, (err, result) => {
//       if (err) throw err;
//       console.log(result.name);
//     console.log('Successfully connected to the Database at:\n' + new Date());
//     });
//   }).catch(err => {
//     console.log('Could not connect to the database. Exiting now...');
//     process.exit();
//   });

app.use('/v1',routes);

app.listen(process.env.PORT,process.env.HOST, error => {
  if (error) {
    logger.error(error);
  } else {
    var timestamp = new Date();
    console.log(
      'Server Started at Port ' +
        process.env.PORT +
        ' HOST : ' +
        process.env.HOST +
        ' TIME : ' +
        timestamp.toDateString() +
        ' ' +
        timestamp.toLocaleTimeString()
    );
  }
});
