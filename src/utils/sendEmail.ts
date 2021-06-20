"use strict";
import nodemailer from "nodemailer";

export async function sendEmail(to: string, html: string) {
  let transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: '"Fred Foo 👻" <foo@example.com>', // sender address
    to: to, // list of receivers
    subject: "Hello ✔", // Subject line
    html, // html body
  });

  console.log("Message sent: %s", info.messageId);
}
