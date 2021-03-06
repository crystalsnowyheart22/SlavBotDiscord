const command = require("discord.js-commando");
var IndexRef = require("../../index.js")

class SetMuteRoleCommand extends command.Command
 {
    constructor(client)
    {
        super(client, {
            name: "setmuterole",
            group: "moderation",
            memberName: "setmuterole",
            description: "Sets the mute role for the mute command (Default is Server-wide Mute). Role name is case-sensitive.",
            examples: ["`!setmuterole <role-name>`"]
        });
    }

    async run(message, args)
    {
        if(message.guild == null)
        {
            return;
        }

        if(!message.guild.member(message.client.user.id).hasPermission("ADMINISTRATOR") && (!message.guild.member(message.author).hasPermission("MANAGE_ROLES") || !message.guild.member(message.author).hasPermission("MUTE_MEMBERS"))){
            message.channel.send("<@" + message.author.id + "> Slav Bot requires the Administrator Permission or both Manage Roles and Mute Members Permission.").catch(error => console.log("Send Error - " + error))
            return;
        }
        
        if(!message.guild.member(message.author).hasPermission("ADMINISTRATOR") && (!message.guild.member(message.author).hasPermission("MANAGE_ROLES") || !message.guild.member(message.author).hasPermission("MUTE_MEMBERS")) && message.author.id != message.guild.owner.id){
            message.channel.send("<@" + message.author.id + "> This command is only available to the owner, or those with the Administrator Permission or both Manage Roles and Mute Members Permission.").catch(error => console.log("Send Error - " + error))
            return;
        }

        IndexRef.addCommandCounter(message.author.id)

        if(args.length > 0)
        {
            console.log("args are present");
            

            var muteRole = message.guild.roles.find("name", args.toString());

            if(muteRole == null)
            {
                message.channel.send("<@" + message.author.id + "> The role " + args.toString() + " does not exist.").catch(error => console.log("Send Error - " + error));
            }
            else
            {
                var allChannels = message.guild.channels.array()
                allChannels.forEach(channel => {
                    channel.overwritePermissions(muteRole, {SEND_MESSAGES: false, ATTACH_FILES: false, ADD_REACTIONS: false})
                });
                IndexRef.setRoleName(message.guild.id, muteRole.name);
                message.channel.send(muteRole.name + " is now the mute role.").catch(error => console.log("Send Error - " + error));
            }

        }
        else
        {
            message.channel.send("<@" + message.author.id + "> Role name is not mentioned.").catch(error => console.log("Send Error - " + error));
            return;
        }
    }
}

module.exports = SetMuteRoleCommand;
