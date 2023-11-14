> [!NOTE]
> The bot is heavily WIP, and is not ready for production use, and probably
> full of bad coding practices, since I'm still learning Go.
>
> It's also not made to be used by other people, but you can if you want to.
> Just be prepared to edit the source code to make it work for you.

# Asuka

A Discord bot written in Go for a server I'm staff of.
Also my very first try at Go, because looking at tutorials is boring.

## Features

- [ ] Internal web server (dashboard for people)
- [ ] Voting for server icons and server names (with the dashboard)
- [ ] Club system
- [ ] Radio?

## Building

You need to have Go installed, and then run `go build` in the root directory.

### Dependencies

- [godotenv](https://github.com/joho/godotenv)
- [discordgo](https://github.com/bwmarrin/discordgo)

## Running

You need to have a `.env` file in the root directory with the following variables:

*(You can also pass them as environment variables, I guess.)*

```dotenv
# Discord bot token
TOKEN=your_token
# The ID of the server the bot will be running on
GUILD_ID=your_guild_id
```

Then, run the executable.

## Contributing

I don't really expect anyone to contribute, but if you want to, feel free to open a pull request.

## License

This project is licensed under the [MIT License](LICENSE).
