divyanshu.parihar@Divyanshus-MacBook-Air synth ai bot % vim
divyanshu.parihar@Divyanshus-MacBook-Air synth ai bot % ls
Archive.zip			src
TODO.txt			telegraf-sessions.sqlite
node_modules			webhook_request.bat
package-lock.json		webhook_request.sh
package.json			yarn-error.log
prisma				yarn.lock
divyanshu.parihar@Divyanshus-MacBook-Air synth ai bot % clear








            ██╗      █████╗ ███████╗██╗   ██╗██╗   ██╗██╗███╗   ███╗          Z
            ██║     ██╔══██╗╚══███╔╝╚██╗ ██╔╝██║   ██║██║████╗ ████║      Z
            ██║     ███████║  ███╔╝  ╚████╔╝ ██║   ██║██║██╔████╔██║   z
            ██║     ██╔══██║ ███╔╝    ╚██╔╝  ╚██╗ ██╔╝██║██║╚██╔╝██║ z
            ███████╗██║  ██║███████╗   ██║    ╚████╔╝ ██║██║ ╚═╝ ██║
            ╚══════╝╚═╝  ╚═╝╚══════╝   ╚═╝     ╚═══╝  ╚═╝╚═╝     ╚═╝



               �  Find file                                     f

                 New file                                      n

                 Recent files                                  r

                 Find text                                     g
                                                              18,21-19      Top
divyanshu.parihar@Divyanshus-MacBook-Air synth ai bot % nvim
divyanshu.parihar@Divyanshus-MacBook-Air synth ai bot % git statuys
git: 'statuys' is not a git command. See 'git --help'.

The most similar command is
	status
divyanshu.parihar@Divyanshus-MacBook-Air synth ai bot % git status
On branch master
Your branch is up to date with 'origin/master'.

Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
	modified:   src/index.js

no changes added to commit (use "git add" and/or "git commit -a")
const express = require("express");
const app = express();
const axios = require("axios");
const fs = require("fs");
const { prisma } = require("../handler/database");
app.use(express.json());
// const { PrismaClient } = require("@prisma/client");
// const prisma = new PrismaClient();

app.get("/", (req, res) => {
  res.send("Hello from webhook");
});
app.post("/webhook", async (req, res) => {
  // const data = prisma.userPurchasedToken.findMany();

  try {
    const payload = req.body.event.data; // Extracting the data object from the payload
    // const chargeId = payload.id;
    const status = payload.timeline[payload.timeline.length - 1].status; // Getting the latest status from timeline
    const amount = parseInt(payload.pricing.local.amount);
    // const currency = payload.pricing.local.currency;
    // const customerName = payload.metadata.name;

