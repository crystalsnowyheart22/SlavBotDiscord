const command = require("discord.js-commando");
var signedIntoFirebase = false;
var firebase = require("firebase");
const fs = require('fs');
var callback = function(err) { 
    if(err) {
       console.log("unlink failed", err);
    } else {
       console.log("file saved");
    }
}

firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        signedIntoFirebase = true;
    } 
    else
    {
        signedIntoFirebase = false;
    }
  });

class MuteCommand extends command.Command
 {
    constructor(client)
    {
        super(client, {
            name: "mute",
            group: "moderation",
            memberName: "mute",
            description: "Mute a member or members in all channels. Messages that are sent by muted users will always be deleted. This can also be used to mute Slav Bot's responses to certain messages, regular command responses will not be muted.",
            examples: ["`!mute @User`", "`!mute @User1 @User2`"]
        });
    }

    async run(message, args)
    {
        if(message.guild == null)
        {
            return;
        }
        
        if(!signedIntoFirebase)
        {
           return; 
        }
        
        if(!message.guild.member(message.client.user.id).hasPermission("ADMINISTRATOR") && !message.guild.member(message.client.user.id).hasPermission("MANAGE_CHANNELS")){
            message.reply("Slav Bot does not have the Administrator or Manage Channels Permission.").catch(error => console.log("Send Error - " + error))
            return;
        }

        if(!message.guild.member(message.author).hasPermission("ADMINISTRATOR") && !message.guild.member(message.author).hasPermission("MANAGE_CHANNELS")){
            message.reply("this command is only available to admins and mods.").catch(error => console.log("Send Error - " + error))
            return;
        }

        message.channel.startTyping();
        var users = [];

        if(args.length > 0)
        {
            console.log("args are present");
            var getUser = false;
            var userID = "";

            for(var i = 0; i < args.length; i++)
            {
                if(getUser)
                {
                    if(args[i].toString() == ">")
                    {
                        users.push(userID);
                        userID = "";
                        getUser = false;
                    }
                    else
                    {
                        if(args[i].toString() != "@" && !isNaN(args[i].toString()))
                        {
                            userID = userID + args[i].toString();
                        }
                    }
                }
                else
                {
                    if(args[i].toString() == "<")
                    {
                            getUser = true;
                    } 
                }
            }

            if(users.length == 0)
            {
                message.reply("no users mentioned.").catch(error => console.log("Send Error - " + error));
                message.channel.stopTyping();
                return;
            }
        }
        else
        {
            message.reply("no users mentioned.").catch(error => console.log("Send Error - " + error));
            message.channel.stopTyping();
            return;
        }
        
        fs.readFile('mutedusers.json', 'utf8', function readFileCallback(err, data){
            if (err){
                console.log(err);
            } else {
            var allMutedUsers = JSON.parse(data).allMutedUsers; //now it's an object
            var mutedusers = [];

            for(var i = 0; i < allMutedUsers.length; i++)
            {
                if(allMutedUsers[i].key == message.guild.id)
                {
                    mutedusers = allMutedUsers[i].users;
                }
            }

            if(mutedusers == null || mutedusers.length == 0)
            {
                console.log("users null, getting data")
                firebase.database().ref("serversettings/" + message.guild.id + "/mutedusers").once('value').then(function(snapshot) {
                    if(snapshot.val() == null)
                    {
                        mutedusers = ["test"]
                    }
                    else
                    {
                        mutedusers = JSON.parse(snapshot.val());
                    }
                   
                    var hasKey = false;
                    for(var i = 0; i < allMutedUsers.length; i++)
                    {
                        if(allMutedUsers[i].key == message.guild.id)
                        {
                            allMutedUsers[i].users = mutedusers;
                            hasKey = true;
                        }
                    }

                    if(!hasKey)
                    {
                        allMutedUsers.push({key: message.guild.id, users: mutedusers})
                    }
        
                    var addedUsers = [];

                    for(var i = 0; i < users.length; i++)
                    {
                        var userAdded = false;
        
                        for(var userIndex = 0; userIndex < mutedusers.length; userIndex++)
                        {
                            if(mutedusers[userIndex] == users[i])
                            {
                                userAdded = true;
                            }
                        }    
                        
                        if(!userAdded)
                        {
                            addedUsers.push(users[i])
                            message.reply("muted <@" + users[i] + ">").catch(error => console.log("Send Error - " + error))
                        }
                        else
                        {
                            message.reply("<@" + users[i] + "> already muted").catch(error => console.log("Send Error - " + error))
                        }
                    }  
        
                    for(var i = 0; i < addedUsers.length; i++)
                    {
                        mutedusers.push(addedUsers[i])   
                    }
    
                    for(var i = 0; i < allMutedUsers.length; i++)
                    {
                        if(allMutedUsers[i].key == message.guild.id)
                        {
                            allMutedUsers[i].users = mutedusers;
                        }
                    }

                    firebase.database().ref("serversettings/" + message.guild.id + "/mutedusers").set(JSON.stringify(mutedusers));
                    fs.writeFile('mutedusers.json', JSON.stringify({allMutedUsers: allMutedUsers}), 'utf8', callback); // write it back 
                    message.channel.stopTyping();
                });
            }
            else
            {
                var addedUsers = [];

                for(var i = 0; i < users.length; i++)
                {
                    var userAdded = false;
    
                    for(var userIndex = 0; userIndex < mutedusers.length; userIndex++)
                    {
                        if(mutedusers[userIndex] == users[i])
                        {
                            userAdded = true;
                        }
                    }    
                    
                    if(!userAdded)
                    {
                        addedUsers.push(users[i])
                        message.reply("muted <@" + users[i] + ">").catch(error => console.log("Send Error - " + error))
                    }
                    else
                    {
                        message.reply("<@" + users[i] + "> already muted").catch(error => console.log("Send Error - " + error))
                    }
                }  
    
                for(var i = 0; i < addedUsers.length; i++)
                {
                    mutedusers.push(addedUsers[i])   
                }

                for(var i = 0; i < allMutedUsers.length; i++)
                {
                    if(allMutedUsers[i].key == message.guild.id)
                    {
                        allMutedUsers[i].users = mutedusers;
                    }
                }

                firebase.database().ref("serversettings/" + message.guild.id + "/mutedusers").set(JSON.stringify(mutedusers));
                fs.writeFile('mutedusers.json', JSON.stringify({allMutedUsers: allMutedUsers}), 'utf8', callback); // write it back 
                message.channel.stopTyping();
            }
        }});
    }
}

module.exports = MuteCommand;
