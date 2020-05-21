const { MessageEmbed } = require("discord.js");

const defEmojiList = [
	"\u0031\u20E3",
	"\u0032\u20E3",
	"\u0033\u20E3",
	"\u0034\u20E3",
	"\u0035\u20E3",
	"\u0036\u20E3",
	"\u0037\u20E3",
	"\u0038\u20E3",
	"\u0039\u20E3",
	"\uD83D\uDD1F",
];

const voteEmbed = async (
	message,
	title,
	options,
	timeout = 30,
	emojiList = defEmojiList.slice(),
	forceEndPollEmoji = "\u2705"
) => {
	if (!message && !message.channel)
		return message.reply("No puedo acceder a este canal.");
	if (!title) return message.reply("Especifica el título de la encuesta.");
	if (!options)
		return message.reply("Especifica las opciones de la encuesta.");
	if (options.length < 2)
		return message.reply("Por favor, proporciona más de dos opciones.");
	if (options.length > emojiList.length)
		return message.reply(
			`Por favor, proporciona ${emojiList.length} o menos.`
		);

	let text = `*Para votar, reacciona usando el emoji correspondiente.\nLa encuesta terminará en **${timeout} segundos**.\nEl creador de esta encuesta puede finalizar **forzadamente** reaccionando al emoji ${forceEndPollEmoji}.*\n\n`;
	const emojiInfo = {};
	for (const option of options) {
		const emoji = emojiList.splice(0, 1);
		emojiInfo[emoji] = { option: option, votes: 0 };
		text += `${emoji} : \`${option}\`\n\n`;
	}
	const usedEmojis = Object.keys(emojiInfo);
	usedEmojis.push(forceEndPollEmoji);

	const poll = await message.channel.send(
		embedBuilder(title, message.author.tag).setDescription(text)
	);
	for (const emoji of usedEmojis) await poll.react(emoji);

	const reactionCollector = poll.createReactionCollector(
		(reaction, user) =>
			usedEmojis.includes(reaction.emoji.name) && !user.bot,
		timeout === 0 ? {} : { time: timeout * 1000 }
	);
	const voterInfo = new Map();
	reactionCollector.on("collect", (reaction, user) => {
		if (usedEmojis.includes(reaction.emoji.name)) {
			if (
				reaction.emoji.name === forceEndPollEmoji &&
				message.author.id === user.id
			)
				return reactionCollector.stop();
			if (!voterInfo.has(user.id))
				voterInfo.set(user.id, { emoji: reaction.emoji.name });
			const votedEmoji = voterInfo.get(user.id).emoji;
			if (votedEmoji !== reaction.emoji.name) {
				const lastVote = poll.reactions.get(votedEmoji);
				lastVote.count -= 1;
				lastVote.users.remove(user.id);
				emojiInfo[votedEmoji].votes -= 1;
				voterInfo.set(user.id, { emoji: reaction.emoji.name });
			}
			emojiInfo[reaction.emoji.name].votes += 1;
		}
	});

	reactionCollector.on("dispose", (reaction, user) => {
		if (usedEmojis.includes(reaction.emoji.name)) {
			voterInfo.delete(user.id);
			emojiInfo[reaction.emoji.name].votes -= 1;
		}
	});

	reactionCollector.on("end", () => {
		text = "*¡La encuesta ha terminado! Los resultados son:*\n\n";
		for (const emoji in emojiInfo)
			text += `\`${emojiInfo[emoji].option}\` - \`${emojiInfo[emoji].votes}\`\n\n`;
		poll.delete();
		message.channel.send(
			embedBuilder(title, message.author.tag).setDescription(text)
		);
	});
};

const embedBuilder = (title, author) => {
	return new MessageEmbed()
		.setTitle(`Encuesta - ${title}`)
		.setFooter(`Encuesta creada por ${author}`);
};

module.exports = voteEmbed;
