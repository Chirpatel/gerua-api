const express = require("express");
const { Router } = express;
const router = Router();
const Data = require("../model/data");

router.post("/delete", async (req, res) => {
  console.log(req.query);
  const { name, categories, price, thumImg, medImg, img } = req.query;
  var images = {
    thumImg: thumImg,
    medImg: medImg,
    img: img
  };
  console.log(images);
  try {
    let data = new Data({
      name,
      categories,
      price,
      images,
      date: new Date()
    });
    await data.save();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json("Server Error");
  }
});

module.exports = router;
