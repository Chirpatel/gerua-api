const express = require("express");
const { Router } = express;
const router = Router();
const Login = require("../model/login");

const removeLogin = async () => {
  let login = await Login.find();
  if (login.length > 0) {
    for (let log in login){
      let time =
        (new Date().getTime() - new Date(log.createdAt).getTime()) /
        (60 * 1000);
      if (time > 30) {
        console.log(Login.remove({ code: log.code }));
      }
    }
      
  }
}

router.get("/", async (req, res) => {
  try {
    removeLogin();
    let login = await Login.find({ code: req.query.auth });
    if (login.length > 0) {
      let time =
        (new Date().getTime() - new Date(login[0].createdAt).getTime()) /
        (60 * 1000);
      if (time > 30) {
        console.log(Login.remove({ code: login[0].code }));
        res.status(404).json({ status: false });
      } else {
        res.status(200).json({ status: true });
      }
    } else {
      res.status(404).json({ status: false });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json("Server Error");
  }
});
module.exports = router;
