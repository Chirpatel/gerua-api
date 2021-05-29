const express = require("express");
const { Router } = express;
const router = Router();
const axios = require("axios");
const multer = require("multer");
const FormData = require("form-data");
const fs = require("fs");
const Data = require("../model/data");
const Jimp = require("jimp");
require("dotenv").config();
const apibbKey = process.env.apibbKey;

const UploadFolder = "src/raw";

const storage = multer.diskStorage({
  destination: function(req, file, callback) {
    callback(null, UploadFolder);
  },
  filename: function(req, file, callback) {
    const ext = file.mimetype.split("/")[1];
    callback(null, `image-${Date.now()}.${ext}`);
  }
});

const upload = multer({
  storage: storage
});

const axiosRequest = async config => {
  return await axios(config).then(function(response) {
    return response.data;
  });
};
const postData = async (url, params, data) => {
  return await axiosRequest({
    method: "post",
    url: url,
    params: params,
    headers: {
      ...data.getHeaders()
    },
    data: data
  });
};
const getData = url => {
  return axios.get(url);
};
const createFormData = async image => {
  var form = new FormData();
  form.append("image", await fs.createReadStream("src/raw/" + image));
  return form;
};

const addWaterMark = async image => {
  let imgActive = UploadFolder + "/" + image;
  await Jimp.read(UploadFolder + "/" + image)
    .then(tpl =>
      Jimp.read(UploadFolder + "/Logo.png").then(logoTpl => {
        logoTpl.opacity(0.2);
        logoTpl.resize(tpl.bitmap.width, tpl.bitmap.height);
        return tpl.composite(logoTpl, 0, 0, [Jimp.BLEND_DESTINATION_OVER]);
      })
    )
    .then(tpl => {
      tpl.write(UploadFolder + "/upload_" + image);
      removeFile(imgActive);
    });
};

const removeFile = image => {
  fs.unlinkSync(image);
};
router.post("/save", upload.single("file"), async (req, res, next) => {
  console.log("Image Save");
  try {
    if (!req.file) {
      return res.send({
        success: false
      });
    } else {
      await addWaterMark(req.file.filename);
      var form = await createFormData("upload_" + req.file.filename);
      var url = `https://api.imgbb.com/1/upload`;
      var data = await postData(
        url,
        {
          key: apibbKey
        },
        form
      );
      removeFile(UploadFolder + "/upload_" + req.file.filename);
      req.url = "/add";
      req.query = {
        thumImg: data.data.thumb.url,
        medImg: data.data.medium.url,
        img: data.data.image.url,
        ...req.query
      };
      router.handle(req, res, next);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({
      err: err,
      msg: "Server error"
    });
  }
});

router.post("/add", async (req, res) => {
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
