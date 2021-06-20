const nodemailer = require("nodemailer");
const express = require("express");
const { Router } = express;
const router = Router();
const crypto = require("crypto");
const emailKey = process.env.emailKey;
const emailId = process.env.emailId;
const Login = require("../model/login");

const transporter = nodemailer.createTransport({
  host: 'smtp.mail.yahoo.com',
  port: 465,
  service: "yahoo",
  auth: {
    user: emailId,
    pass: emailKey
  }
});

const hash = () => {
  return crypto
    .createHash("md5")
    .update(new Date().toString())
    .digest("hex");
};
const sendMail = async code => {
  let url = "https://flaxen-inconclusive-owner.glitch.me/checkLogin/?auth=" + code;
  var mailOptions = {
    from: "Gerua <gopienterprise23@yahoo.com>",
    to: "chirpatelss@gmail.com",
    subject: "Sending Email using Node.js",
    html: `<h1>Login Url</h1> <a href=${url}><button>Login</button></a> <p>Unable to see button, click here <a href=${url}>${url}</a><br/> This Link will be active for 30 mins.</p>`
  };

  transporter.sendMail(mailOptions, function(error, info) {
    if (error) {
      console.log(error);
      throw error;
    } else {
      console.log("Email sent: " + info.response);
    }
  });
};

router.get("/generate", async (req, res) => {
  try {
    let code = hash();
    let login = new Login({
      code
    });
    await login.save();
    await sendMail(code);
    res.status(200).json({ status: true});
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false});
  }
});
module.exports = router;
