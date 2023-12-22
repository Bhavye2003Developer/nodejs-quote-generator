const express = require('express')
const ejs = require('ejs');
const utils = require('./utils')

const app = express()

app.set("view engine", "ejs")
app.use(express.urlencoded({ extended: true })) // to parse body
app.use(express.static('public'));

const hostname = "0.0.0.0"
const PORT = 3000

utils.startCronJob(
    {
        seconds: 0,
        minutes: 30,
        hour: 13, //0-23
        executor: function () {
            utils.sendMail()
        }
    }
)

app.get("/subscribe", (req, res) => {
    res.render('index')
})


app.post("/subscribe", (req, res) => {
    const email = req.body.email
    if (email) {
        utils.addMail(email).then((code) => {
            if (code == 0) {
                res.render('success')
                return;
            }
            else if (code == 1) {
                res.render('emailExists')
                return;
            }
            return
        }).catch(err => {
            res.send(err)
        })
    }
})


app.listen(PORT, hostname, () => {
    console.log(`Listening at port ${PORT}...`)
})