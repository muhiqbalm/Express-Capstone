var router = require("express").Router();
var fire = require("./fire");
var bodyParser = require("body-parser");
var db = fire.firestore();
router.use(bodyParser.json());

router.get("/data", (req, res) => {
  db.settings({
    timestampsInSnapshots: true,
  });
  var allData = [];
  db.collection("pulse")
    .orderBy("timestamp", "desc")
    .get()
    .then((snapshot) => {
      snapshot.forEach((hasil) => {
        allData.push(hasil.data());
      });
      console.log(allData);
      res.send(allData);
    })
    .catch((error) => {
      console.log(error);
    });
});

router.post("/data", (req, res) => {
  db.settings({
    timestampsInSnapshots: true,
  });
  db.collection("timestamp").add({
    timestamp: req.body.timestamp,
    bpm: req.body.bpm,
  });
  res.send({
    timestamp: req.body.timestamp,
    bpm: req.body.bpm,
  });
});

module.exports = router;
