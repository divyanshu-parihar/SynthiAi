const express = require("express");
const app = express();
const axios = require("axios");
const fs = require("fs");
const { prisma } = require("../handler/database");
app.use(express.json());
// const { PrismaClient } = require("@prisma/client");
// const prisma = new PrismaClient();
app.post("/webhook", async (req, res) => {
  // const data = prisma.userPurchasedToken.findMany();

  try {
    const payload = req.body.event.data; // Extracting the data object from the payload
    // const chargeId = payload.id;
    const status = payload.timeline[payload.timeline.length - 1].status; // Getting the latest status from timeline
    const amount = parseInt(payload.pricing.local.amount);
    // const currency = payload.pricing.local.currency;
    // const customerName = payload.metadata.name;
    // const customerEmail = payload.metadata.email;

    if (status == "COMPLETED") {
      const data = await prisma.userOrders.findFirst({
        where: {
          orderid: req.body.event.data.id,
        },
      });
      // url: 'https://commerce.coinbase.com/pay/3592c237-e72b-4e71-8de2-569dcf0b515f'
      const user = data.userid;

      const dataPoint = await prisma.userPurchasedToken.findUnique({
        where: { userid: user },
      });
      console.log(data, user, dataPoint);
      if (!dataPoint) {
        throw new Error("Data point not found");
      }

      // Calculate the new value
      const currentValue = dataPoint.token;
      const newValue = currentValue + amount * 100;

      // Update the database with the new value
      console.log(newValue);
      await prisma.userPurchasedToken.update({
        where: { userid: user },
        data: {
          token: parseInt(newValue),
        },
      });

      return res.send(JSON.stringify(data));
    }
  } catch (e) {
    // console.log("error happened for ", user, currentValue, newValue);
    console.log(e);
    return res.send(JSON.stringify(e));
  }
});

app.post("/create", async (req, res) => {
  const data = req.body;
  console.log(data);
  const apiKey = "501fd8be-d3b5-4dbe-910d-8096cd061c7f";
  if (!data || !data.userid || !data.amount) return res.status(400);

  const headers = {
    "Content-Type": "application/json",
    "X-CC-Api-Key": apiKey,
  };

  const result = await axios.post(
    "https://api.commerce.coinbase.com/charges/",
    {
      name: data.userid + "-" + data.amount,
      description: "token payment",
      pricing_type: "fixed_price",
      local_price: {
        amount: parseFloat(data.amount),
        currency: "USD",
      },
    },
    { headers }
  );

  if (result.status == 201) {
    try {
      await prisma.userOrders.create({
        data: {
          userid: data.userid,
          orderid: result.data.data.id,
        },
      });
    } catch (e) {
      console.log(e);
      res.status(500);
    }
    return res.send({ url: result.data.data.hosted_url });
  } else res.status(400);
});
app.listen(3000, (req, res) => {
  console.log("webhook started");
});

// console.log("Hello");
