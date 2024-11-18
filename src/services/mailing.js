const { promisify } = require("util");
const { SENDGRID_API_KEY, SENDGRID_FROM } = require("../utils/config");

const transporter = require("nodemailer").createTransport({
  service: "SendGrid",
  auth: {
    user: "apikey",
    pass: SENDGRID_API_KEY,
  },
});

const send_mail = promisify(transporter.sendMail.bind(transporter));

module.exports = {
  send: async ({ from, ...opts }) => {
    return send_mail({ from: SENDGRID_FROM, ...opts });
  },
};
