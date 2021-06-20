const express = require("express");
const { Router } = express;
const router = Router();
const axios = require("axios");
const multer = require("multer");
const FormData = require("form-data");
const fs = require("fs");
const Data = require("../model/data");
const Jimp = require("jimp");
const tinify = require("tinify");
const watermark = require("image-watermark");
require("dotenv").config();
const apibbKey = process.env.apibbKey;
tinify.key = process.env.tinyPngkey;
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
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

const upload = multer({
  storage: storage
});

const axiosRequest = async config => {
  return await axios(config).then(function(response) {
    return response.data;
  });
};
const postDataForm = async (url, params, data) => {
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

const addWaterMark = image => {
  var options = {
    text: "Gerua Stone Bracelet",
    pointsize: 40,
    color: "black",
    dstPath: UploadFolder + "/upload_" + image
  };
   watermark.embedWatermark(
    UploadFolder + "/compressed_" + image,
    options
  );
  return true;
};

const removeFile = image => {
  fs.unlinkSync(image);
};

const compressImage = async image => {
  const source = await tinify.fromFile("src/raw/" + image);
  await source.toFile("src/raw/compressed_" + image);
};
router.post("/save", upload.single("file"), async (req, res, next) => {
  console.log("Image Save");
  try {
    if (!req.file) {
      return res.send({
        success: false
      });
    } else {
      await compressImage(req.file.filename);
      addWaterMark(req.file.filename)
      await delay(60000)
      var form = await createFormData("upload_" + req.file.filename);
      var url = `https://api.imgbb.com/1/upload`;
      var data = await postDataForm(
        url,
        {
          key: apibbKey
        },
        form
      );
      removeFile(UploadFolder + "/upload_" + req.file.filename);
      removeFile(UploadFolder +"/compressed_"+ req.file.filename);
      removeFile(UploadFolder +"/"+ req.file.filename);
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
