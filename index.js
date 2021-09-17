const Discord = require('discord.js');
const db = require("akame.db")
const client = new Discord.Client({
    fetchAllMembers: true,
});
module.exports.client = () => client;
const settings = require('./settings.json');
const tokens = require('./tokens.json');
const { exec } = require('child_process')
const SysLoad = require("sysload");
const load = new SysLoad();

load.start();

const clean = text => {
    if(typeof(text) === "string")
        return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203))
    else
        return text
}
module.exports.clean = () => clean;

client.on("ready", async () => {
    console.log('Connected.');
    setInterval(function () {
        client.user.setPresence({ activity: { type: 'WATCHING', name: "Lyessa - CPU: " + load.average().s1 + "%" } });
    }, 3000)
});

client.on("ready", async () => {
        db.deleteAll()
    setInterval(function () {
        const lyessa = client.users.cache.get(settings.bot_user)
        const embed = new Discord.MessageEmbed()
     .setAuthor("Bot is down", client.user.avatarURL())
     .setDescription(`${lyessa} is now down.`)
    .setColor("RED")
    .setTimestamp()
    .setFooter("Made by lyertia")

        if(lyessa.presence.status == "offline" ) {
            if(db.get("offline")) return;
            client.channels.cache.get(settings.downlog_channel).send(embed)
            db.set("offline", true)
        } else {
            if(db.get("offline")) {
                db.delete("offline")
            }
        }
            }, 5000)
});

client.on("message", async message => {
    if (message.author.id == settings.owner_id && message.content.startsWith(settings.cmd_prefix)) {
        if (message.content.slice(3)) {
            if (message.channel.id == settings.exec_channel) {
                var code = message.content.slice(3)
                exec(code, (error, stdout, stderr) => {
                    if (!error && stdout) {
                        if (stdout.length > 1000) {
                            stdout = stdout.substr(stdout.length - 999, stdout.length)
                        }
                        message.channel.send("```" + clean(stdout) + "```")
                    } else {
                        message.channel.send("```" + clean(stderr) + "```")
                    }   })
            } else {
                return message.channel.send("Not authorized.");
            }
        }
    }
})
client.login(tokens.discord);
require("./botAlert.js")
