const db = require("./config/level").GOT_DB;

db.get('volumeGOT', (err, res)=> {
    if (!err) console.log('VOL GOT:', res.toString());
});
db.get('lastReportSubmittedToDB', (err, res)=> {
    if (!err) console.log('LAST DATE:', res.toString());
});