# DOS-bot
Under development.

Bot for a private discord server, using discord.js and sqlite.

## Current functionality
Stores the amount of times any server emoji has been used in a text-channel into a database. By sending a command, users can then print a sorted list of the results.

Since the Discord API does not allow bots to use the search functionality, the bot has to go through the entire history of the text channel the command is sent in, which is likely to take some time due to the limits of the discord API. To allow users to print the emoji-list without delay, the data is stored in a database so that a complete check of the history is not required each time a command is sent while allowing the data to be persistent. 

The user can also perform a "mini" update, which will count emojis since last previous counted message.

## Installation

```bash
npm i -g --production windows-build-tools
npm i node-gyp better-sqlite3
npm i discord.js
```

Start bot with:
```bash
node bot.js
```
