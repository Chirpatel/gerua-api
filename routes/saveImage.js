const express = require('express');
const {
    Router
} = express;
const router = Router();
const axios = require('axios');
const multer = require('multer');
const FormData = require('form-data');
const fs = require('fs');
const Jimp = require('jimp')
require('dotenv').config();
const apibbKey  = process.env.apibbKey

const UploadFolder = "./src/raw";

const storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, UploadFolder);
    },
    filename: function (req, file, callback) {
        const ext = file.mimetype.split('/')[1];
        callback(null, `image-${Date.now()}.${ext}`);
    }
});

const upload = multer({
    storage: storage
});

const axiosRequest = async (config) => {
    return await axios(config)
        .then(function (response) {
            return response.data;
        })
}
const postData = async (url, params, data) => {
    return await axiosRequest({
        method: 'post',
        url: url,
        params: params,
        headers: {
            ...data.getHeaders()
        },
        data: data
    })
}

const createFormData = (image) => {
    var form = new FormData();
    form.append('image', fs.createReadStream("./src/raw/" + image));
    return form;
}

const addWaterMark = async (image) =>{
    let imgActive = UploadFolder + "/" +image;
    await Jimp.read(UploadFolder + "/" +image)
      .then((tpl) =>
          Jimp.read('./src/raw/logo.png').then((logoTpl) => {
              logoTpl.opacity(0.2)
              logoTpl.resize(tpl.bitmap.width,tpl.bitmap.height);
              return tpl.composite(logoTpl, 0, 0, [Jimp.BLEND_DESTINATION_OVER])
          }),
      )
      .then( (tpl) => {tpl.write('./src/raw/upload_' + image);removeFile(imgActive)})
}

const removeFile = (image) => {
    fs.unlinkSync(image)
}
router.post('/save', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.send({
                success: false
            });

        } else {
            
            await addWaterMark(req.file.filename);
            var form = createFormData("upload_"+req.file.filename);
            var url = `https://api.imgbb.com/1/upload`;
            var data = await postData(url, {
                key: apibbKey
            }, form);
            removeFile("./src/raw/upload_" + req.file.filename);
            return res.send({
                filename: req.file.filename,
                success: true,
                ...data
            })
        }
    } catch (err) {
        removeFile("./src/raw/upload_" + req.file.filename);
        console.error(err);
        res.status(500).json({
            err: err,
            msg: 'Server error'
        });
    }

})

module.exports = router;