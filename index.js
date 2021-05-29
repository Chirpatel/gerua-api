const express = require("express");
//const connectDB = require("./config/db");
const app = express();
const cors = require("cors")
//connectDB();

app.use(cors({credentials: true, origin: true}));
app.all('/*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
});
app.use(express.json({ extend: false }));

app.get("/", function(req, res, next) {
  res.json({ message: "alive" });
});

app.use("/image", require("./routes/saveImage"));

app.set('port', process.env.PORT || 3001);
console.log("Express server listening on port " + app.get('port'));
app.listen(app.get('port'));


module.exports = app;
