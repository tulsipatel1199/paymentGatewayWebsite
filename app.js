//jshint esversion:6
const express = require('express');
const paypal = require('paypal-rest-sdk');
const nodemailer = require("nodemailer");

paypal.configure({
  'mode': 'sandbox', //sandbox or live
  'client_id': 'AX3XIhno8I-iLl-F2mrFwXPA-Y8OtMJnX6Ut9cTKej5qxvl4GAkr2uMVeddRRbI8ENbEv0R-7z-gjrty',
  'client_secret': 'EHwrc10iMw2BAsU4sIbWCE-RSrjvumdhjPk405KenTarcxlLkTOBE2sU9S6WEAIzgznivehbn02exA7z'
});

const app = express();
app.use(express.static("public"));

app.get('/', (req, res) => res.sendFile(__dirname + "/index.html"));
//............................................................

app.post("/", (req, res) => res.sendFile(__dirname + "/paym.html"));

//.............................................................
app.post('/pay', (req, res) => {
  const create_payment_json = {
    "intent": "sale",
    "payer": {
      "payment_method": "paypal"
    },
    "redirect_urls": {
      "return_url": "http://localhost:3000/success",
      "cancel_url": "http://localhost:3000/cancel"
    },
    "transactions": [{
      "item_list": {
        "items": [{
          "name": "Red Sox Hat",
          "sku": "001",
          "price": "25.00",
          "currency": "USD",
          "quantity": 1
        }]
      },
      "amount": {
        "currency": "USD",
        "total": "25.00"
      },
      "description": "Hat for the best team ever"
    }]
  };

  paypal.payment.create(create_payment_json, function(error, payment) {
    if (error) {
      throw error;
    } else {
      for (let i = 0; i < payment.links.length; i++) {
        if (payment.links[i].rel === 'approval_url') {
          res.redirect(payment.links[i].href);
        }
      }
    }
  });

});
//................................................
app.get('/success', (req, res) => {
  const payerId = req.query.PayerID;
  const paymentId = req.query.paymentId;

  const execute_payment_json = {
    "payer_id": payerId,
    "transactions": [{
      "amount": {
        "currency": "USD",
        "total": "25.00"
      }
    }]
  };

  paypal.payment.execute(paymentId, execute_payment_json, function(error, payment) {
    if (error) {
      console.log(error.response);
      throw error;
    } else {
      console.log(JSON.stringify(payment));
      res.sendFile(__dirname + "/sucess.html");
    }
  });
});
//..................................................
app.get('/cancel', (req, res) => res.sendFile(__dirname + "/cancel.html"));
//................................................
var transport = nodemailer.createTransport({
  host: "smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "aafc7577e8aca4",
    pass: "c697e51aa50970"
  }
});

const message = {
  from: 'sb-qm8nq5145890@business.example.com',
  to: 'sb-tulsi@personal.example.com',
  subject: 'successful donation payment',
  html: "<p><b>Thank you for your kind donation</b><p> <p>Your caring support of <b>the Children With AIDS Foundation</b> will make a great difference in the lives of thousands of sick children.Your gift is already being used in ugenda to pay for the life-saving antibiotics that help prevent infections that throw HIV positive children into full-blown AIDS. Just <b>$25 </b>provides a full month’s worth of medical treatment for an HIV positive child."
};
transport.sendMail(message, function(err, info) {
  if (err) {
    console.log(err);
  } else {
    console.log(info);
  }
});
//.................................................
app.listen(3000, () => console.log(`Server Started on 3000`));
