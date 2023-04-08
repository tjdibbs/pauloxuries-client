import nodemailer from "nodemailer";

const user = process.env.MAIL_USER;
const pass = process.env.MAIL_PASSWORD;

// Setting Up For Mailing
export default nodemailer.createTransport({
  host: "pauloxuries.com",
  port: 465,
  secure: true,
  auth: {
    user,
    pass,
  },

  // tls: {
  //   rejectUnauthorized: false,
  // },
});
