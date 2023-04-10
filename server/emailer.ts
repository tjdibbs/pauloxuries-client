import { MailOptions } from "nodemailer/lib/sendmail-transport";

import { compile } from "handlebars";
import { readFile } from "node:fs/promises";
import nodemailer from "nodemailer";
import transporter from "../lib/transporter";

export enum Email {
  REGISTER = "register",
  CHECKOUT = "checkout",
  ORDER = "order",
  CANCEL = "cancel",
  DELETE = "delete",
  CHANGE = "change",
  VERIFY = "verify",
  CHANGES = "changes",
  SUBSCRIBE = "subscribe",
}

export default async function Emailer(email: string, type: Email, data?: any) {
  const mailOptions: Partial<MailOptions> = {
    from: "info@pauloxuries.com",
    to: email,
  };

  let path;

  const addHtml = async (path: string) =>
    compile(await readFile(path, { encoding: "utf-8" }))(data);

  switch (type) {
    case Email.REGISTER:
      path = __dirname + "/templates/signed-up.html";
      mailOptions.subject = "Pauloxuries User Registration";
      mailOptions.html = await addHtml(path);
      break;
    case Email.CHECKOUT:
      path = __dirname + "/templates/checkout.html";
      mailOptions.subject = "Products Order from Pauloxuries Store";
      mailOptions.html = await addHtml(path);
      break;
    case Email.SUBSCRIBE:
      path = __dirname + "/templates/subscribe.html";
      mailOptions.subject = "Pauloxuries Community";
      mailOptions.html = await addHtml(path);
      break;
    case Email.CHANGE:
      path = __dirname + "/templates/change-password.html";
      mailOptions.subject = "Request For Change Of Password";
      mailOptions.html = await addHtml(path);
      break;
    case Email.CHANGES:
      path = __dirname + "/templates/password-changed.html";
      mailOptions.subject = "Password Changed";
      mailOptions.html = await addHtml(path);
      break;
    case Email.ORDER:
      path = __dirname + "/templates/order-alert.html";
      mailOptions.subject = "New Order Alert From " + data.firstname;
      mailOptions.html = await addHtml(path);
      break;
    case Email.CANCEL:
      path = __dirname + "/templates/cancel-alert.html";
      mailOptions.subject = "Order Cancelled Alert From " + data.firstname;
      mailOptions.html = await addHtml(path);
      break;
    default:
      break;
  }

  try {
    return await transporter.sendMail(mailOptions);
  } catch (error: any) {
    console.log({ error });
    return { error: error.message };
  }
}
