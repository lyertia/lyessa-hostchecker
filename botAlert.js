const client = require("./index.js").client();
const clean = require("./index.js").clean();
const { exec } = require('child_process')
const db = require("akame.db");
const settings = require("./settings.json");

client.on("ready", async () => {
    setInterval(function () {
        const lyessa = client.users.cache.get(settings.bot_user)

        if (lyessa.presence.status == "offline") {
            if(db.get("countdown") == 48) {
                exec("pm2 restart lyessa", (error, stdout, stderr) => {
                    if (!error && stdout) {
                        if (stdout.length > 1000) {
                            stdout = stdout.substr(stdout.length - 999, stdout.length)
                        }
                        console.log(clean(stdout))
                    } else {
                        console.log(clean(stderr))
                    }   })
                db.delete("countdown")
                db.delete("alert")
                db.delete("down")
            }
            db.add("countdown", 1)
            if(db.get("down")) return;
            client.channels.cache.get(settings.downlog_channel).send("If the bot is not active within 8 minutes, it will automatically restart.")
            db.set("alert", true)
            db.set("down", true)
        } else {
            if(db.get("alert") || db.get("countdown") || db.get("down")) {
                db.delete("alert")
                db.delete("countdown")
                db.delete("down")
                client.channels.cache.get(settings.downlog_channel).send("Bot now is active.")
            }
        }
    }, 10000)
});
