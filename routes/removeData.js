const express = require("express");
const { Router } = express;
const router = Router();
const Data = require("../model/data");

router.get("/", async (req, res) => {
  console.log(req.query);
  const {id} = req.query;
  try {
    await Data.deleteOne({_id:id});
    res.status(200).json({status:"Success"});
  } catch (err) {
    console.error(err);
    res.status(500).json("Server Error");
  }
});

module.exports = router;
