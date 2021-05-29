const express = require("express");
const connectDB = require("./config/db");
const app = express();
const cors = require("cors")
connectDB();

app.use(cors({credentials: true, origin: true}));
app.all('/*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
});
app.use(express.json({ extend: false }));
app.use('/static',express.static('src/raw'))
app.get("/", function(req, res, next) {
  res.json({ message: "alive" });
});

app.use("/image", require("./routes/saveImage"));
app.use("/imagedata", require("./routes/addData"));

const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
