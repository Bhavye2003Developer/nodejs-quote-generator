const express = require('express')
const ejs = require('ejs');
const utils = require('./utils')

const app = express()
const router = express.Router()

app.set("view engine", "ejs")
router.use(express.urlencoded({ extended: true })) // to parse body
router.use(express.static('public'));

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

router.get("/", (req, res) => {
    res.redirect("/subscribe")
})

router.get(`/subscribe`, (req, res) => {
    res.render('index')
})


router.post("/subscribe", (req, res) => {
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


router.use("", router)

app.listen(PORT, () => {
    console.log(`Listening at port ${PORT}...`)
})
