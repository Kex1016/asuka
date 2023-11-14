package main

import (
	"github.com/bwmarrin/discordgo"
	"github.com/joho/godotenv"
	"log"
	"os"
	"os/signal"
)

var (
	GuildID = os.Getenv("GUILD_ID")
)

type Bot struct {
	Discord *discordgo.Session
}

func (bot *Bot) Init() {
	token := os.Getenv("TOKEN")
	log.Println("Initializing bot...")
	discord, err := discordgo.New("Bot " + token)

	if err != nil {
		panic(err)
	}

	discord.AddHandler(func(s *discordgo.Session, i *discordgo.InteractionCreate) {
		if h, ok := cmdHandlers[i.ApplicationCommandData().Name]; ok {
			log.Println("Command executed: " + i.ApplicationCommandData().Name)
			h(s, i)
		}
	})

	bot.Discord = discord
}

func (bot *Bot) Start() {
	err := bot.Discord.Open()
	if err != nil {
		log.Panicf("Error opening connection to Discord: %s", err)
	}

	log.Println("Registering commands...")
	registeredCommands := make([]discordgo.ApplicationCommand, len(cmds))
	for i, v := range cmds {
		cmd, err := bot.Discord.ApplicationCommandCreate(bot.Discord.State.User.ID, GuildID, &v)
		if err != nil {
			log.Panicf("Error registering command %s: %s", v.Name, err)
		}
		registeredCommands[i] = *cmd
	}

	defer bot.Discord.Close()

	stop := make(chan os.Signal, 1)
	signal.Notify(stop, os.Interrupt)
	log.Println("Bot is now running. Press CTRL-C to exit.")
	<-stop

	log.Println("Unregistering commands...")
	for _, v := range registeredCommands {
		err := bot.Discord.ApplicationCommandDelete(bot.Discord.State.User.ID, GuildID, v.ID)
		if err != nil {
			log.Panicf("Error unregistering command %s: %s", v.Name, err)
		}
	}

	log.Println("Bot is now stopped.")
}

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Println("Error loading .env file. Using environment variables instead.")
	}

	bot := Bot{}
	bot.Init()
	bot.Start()
}
