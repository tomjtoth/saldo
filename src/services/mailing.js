const { promisify } = require("util");
const { EMAIL_PASS, EMAIL_FROM } = require("../utils/config");

const transporter = require("nodemailer").createTransport({
  service: "SendGrid",
  auth: {
    user: "apikey",
    pass: EMAIL_PASS,
  },
});

const send_mail = promisify(transporter.sendMail.bind(transporter));

module.exports = {
  send: async ({ from, ...opts }) => {
    return send_mail({ from: EMAIL_FROM, ...opts });
  },
};
