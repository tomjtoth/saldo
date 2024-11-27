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
  send: ({ from, ...opts }) => {
    return send_mail({ from: EMAIL_FROM, ...opts });
  },
};

class A {
  static method1() {
    //stuff
  }
}

class B extends A {
  // other stuff
}

class C extends B {
  static method1(input) {
    this.method1(new this(input));
  }
}
