const Discord = require('discord.js');
const client = new Discord.Client();
const config = require("./config.json");
const SQLite = require("better-sqlite3");
const sql = new SQLite('./emojis.sqlite');

async function countEmojis(guild, channel, mega, uid) {
    const emojiDict = {};
    messageFound = false;
    let lastID;
    firstMessage = await channel.fetchMessages({limit: 1})
    firstID = firstMessage.first().id;
    emojiArr = guild.emojis.array()

    while (true) {
        const options = { limit: 100 };  
        if (lastID) {
            options.before = lastID;
        }
        const messages = await channel.fetchMessages(options);
        msgArr = messages.array()
        for (message in msgArr) {
            if(mega == false && msgArr[message].id == uid) {
                messageFound = true;
                break;
            }
            for (emoji in emojiArr) {
                if (msgArr[message].content.includes(emojiArr[emoji].id) && !(msgArr[message].author.bot)) {
                    emojiDict[emojiArr[emoji]] = (emojiDict[emojiArr[emoji]] || 0) + 1;
                } 
            }
        }
        lastID = messages.last().id;
        if (messages.size != 100 || messageFound) {
            break;
        }
    }
    console.log(emojiDict)
    return await {
        emojiDict:emojiDict,
        firstID:firstID,
    }
}

function megaUpdateDbEmojis (emojiDictID, dbEmojis){
    let uid = emojiDictID.firstID
    for(var key in emojiDictID.emojiDict) {
        client.setEmojis.run({id:key, amount:emojiDictID.emojiDict[key]});
    }
    client.setUID.run({uid:uid})
}

function miniUpdateDbEmojis (emojiDictID, dbEmojis){
    let uid = emojiDictID.firstID
    for(var row in dbEmojis) {
        emojiDictID.emojiDict[dbEmojis[row].id] = (emojiDictID.emojiDict[dbEmojis[row].id] || 0) + dbEmojis[row].amount;
    }
    for(var key in emojiDictID.emojiDict) {
        console.log(key)
        client.setEmojis.run({id:key, amount:emojiDictID.emojiDict[key]});
    }
    client.setUID.run({uid:uid})
}

client.on("ready", () => {
    console.log("starting up");
    var db = require('./db');
    db.setup(sql);

    client.getUID = sql.prepare("SELECT * FROM uidtable");
    client.setUID = sql.prepare("REPLACE INTO uidtable (id, uid) VALUES (0, @uid)");
    
    client.getEmojis = sql.prepare("SELECT * FROM emojis");
    client.setEmojis = sql.prepare("REPLACE INTO emojis (id, amount) VALUES (@id, @amount);");
    // Prepared statements for getting and setting data in DB.
});

client.on("message", message => {
    if (message.author.bot) {
        return;
    }
    if (message.content.indexOf(config.prefix) !== 0) {
        return;
    } 

    const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
    var cflag = null

    if(args && args.length) {
        cflag = args.shift().toLowerCase();
    }
    
    if(command === "udb") {
        console.log("updating database")
        if(!message.author.id === message.guild.owner) return message.reply("Only the owner is allowed to mega update the database");
        emojis = client.getEmojis.all();
        emojiArr = message.guild.emojis.array();
        uid_row = client.getUID.get() || 0
        if(cflag === "--mega") {
            countEmojis(message.guild, message.channel, true, uid_row.uid)
                .then(ceObj => megaUpdateDbEmojis(ceObj, emojis))
                .then(console.log("success"))
                .catch(err => console.log(err))
        }
        if(cflag === "--mini") {
            countEmojis(message.guild, message.channel, false, uid_row.uid)
                .then(ceObj => miniUpdateDbEmojis(ceObj, emojis))
                .catch(err => console.log(err))
        }
    }
    if(command === "emojilist") {
        console.log("printing emojis")
        var m = ""
        emojis = client.getEmojis.all()
        console.log(emojis)
        emojis.sort(function(first, second) {
            return second.amount - first.amount;
        });

        for(var row in emojis) {
            m = emojis[row].id + " - " + emojis[row].amount + "\n"
            message.channel.send(m);
        }
    }
});
    
client.login(config.token);