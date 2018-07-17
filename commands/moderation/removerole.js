const command = require("discord.js-commando");

class RemoveroleCommand extends command.Command
 {
    constructor(client)
    {
        super(client, {
            name: "removerole",
            group: "moderation",
            memberName: "removerole",
            description: "Remove a role or roles from a member or members. Role name is case-sensitive.",
            examples: ["`!removerole <role-name> @User`", "`!removerole <role1>|<role2> @User1 @User2`"]
        });
    }

    async run(message, args)
    {
        if(message.guild == null)
        {
            return;
        }

        if(!message.guild.member(message.client.user.id).hasPermission("ADMINISTRATOR") && !message.guild.member(message.client.user.id).hasPermission("MANAGE_ROLES")){
            message.reply("Slav Bot does not have the Administrator or Manage Roles Permission.").catch(error => console.log("Send Error - " + error))
            return;
        }
        
        if(!message.guild.member(message.author).hasPermission("ADMINISTRATOR") && !message.guild.member(message.author).hasPermission("MANAGE_ROLES")){
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
            var firstIndex = 0;

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
                        if(firstIndex == 0)
                        {
                            firstIndex = i;
                        }
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

            var roles = [];
            var roleName = "";
            console.log(firstIndex);
            
            for(var i = 0; i < firstIndex; i++)
            {
                if(args[i] == "|" || args[i + 1] == "<")
                {
                    roles.push(roleName);
                    roleName = "";
                }
                else
                {
                    roleName = roleName + args[i];
                }
            } 

            if(roles.length == 0)
            {
                message.reply("no roles mentioned.").catch(error => console.log("Send Error - " + error));
                message.channel.stopTyping();
                return;
            }

            for(var i = 0; i < users.length; i++)
            {
                const user = users[i];
                message.guild.fetchMember(user).then(function(member){
                    for(var roleIndex = 0; roleIndex < roles.length; roleIndex++)
                    {
                        var userRole = message.guild.roles.find("name", roles[roleIndex]);

                        member.removeRole(userRole).then(message.reply("<@" + user + "> no longer has the role of " + userRole.name).catch(error => console.log("Send Error - " + error))).catch(error => message.reply("Error - " + error).catch(error => console.log("Send Error - " + error)));
                    }
                }).catch(function(error){
                    console.log(error.member);
                    message.reply("Error - " + error.message).catch(error => console.log("Send Error - " + error));
                })
            }

            message.channel.stopTyping();
        }
        else
        {
            message.reply("no users mentioned or roles.").catch(error => console.log("Send Error - " + error));
            message.channel.stopTyping();
            return;
        }
    }
}

module.exports = RemoveroleCommand;