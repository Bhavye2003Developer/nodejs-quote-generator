const { CronJob } = require('cron')
const nodemailer = require('nodemailer')
const fs = require('fs')

const quotesPath = "./scemas/quotes.json"
const mailsPath = "./scemas/mails.json"


const user = "YOUR_EMAIL"
const pass = "YOUR_PASS"


// if parameters not provided, will send notification at 10 A.M IST
function startCronJob({ seconds = 0, minutes = 0, hour = 10, executor }) {
    new CronJob(
        `${seconds} ${minutes} ${hour} * * *`,
        executor,
        null,
        true, // automatically starts the job
        'Asia/Kolkata' // timezone
    )
}

function sendQuote(quote, receivers) {
    const transport = nodemailer.createTransport({
        service: "gmail",
        port: 2525,
        auth: {
            user: user,
            pass: pass
        }
    });
    // async..await is not allowed in global scope, must use a wrapper
    async function main() {
        // send mail with defined transport object
        const info = await transport.sendMail({
            from: '"bhavyedevelopment2003@gmail.com', // sender address
            to: receivers, // list of receivers
            subject: "Motivational Quotes", // Subject line
            text: "Quote", // plain text body
            html: `<b><i>${quote}</i></b>`, // html body
        });

        console.log("Message sent: %s", info.messageId);
    }
    // main().catch(console.error);
    return main()
}

async function getNewQuote() {
    let quote
    return new Promise((resolve) => {
        fs.readFile(quotesPath, (err, quotes) => {
            if (quotes.toString()) {
                let quotesJson = JSON.parse(quotes.toString())
                let currentId = quotesJson["currentQuoteId"]
                quote = quotesJson["quotes"][currentId]
                currentId = (currentId + 1) % quotesJson["quotes"].length

                fs.writeFile(quotesPath, JSON.stringify({
                    ...quotesJson, "currentQuoteId": currentId
                }), (err) => {
                    if (err) {
                        console.log(`Error: ${err}`)
                    }
                })
                resolve(quote)
            }
            else {
                console.log("No quotes.json found")
            }
        })
    })
}


function sendMail() {
    fs.readFile(mailsPath, async (err, data) => {
        if (err) {
            console.log(`Error: ${err}`)
        }
        else {
            const mailsInfo = JSON.parse(data.toString())
            // console.log(mailsInfo)
            if (Array.isArray(mailsInfo)) {
                const receivers = mailsInfo.join(", ")
                // get new quote from quotes.json
                const quote = await getNewQuote()
                // send mail to all users
                sendQuote(`Today's quote: "${quote}"`, receivers)
            }
        }
    })
}


function addMail(email) {
    return new Promise((resolve, reject) => {
        fs.readFile(mailsPath, (err, data) => {
            if (err) {
                reject(`Error: ${err}`)
            }
            else {
                const mailArray = JSON.parse(data.toString())
                if (Array.isArray(mailArray)) {
                    if (!(mailArray.includes(email))) {
                        mailArray.push(email)
                        fs.writeFile(mailsPath, JSON.stringify(mailArray), (err) => {
                            if (err) {
                                reject(`Error: ${err}`)
                            }
                            else {
                                resolve(0)
                            }
                        })
                    }
                    else {
                        resolve(1)
                    }
                }
                else {
                    reject(`Error: ${err}`)
                }
            }
        })
    })
}


module.exports = { startCronJob, sendMail, addMail }