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
		return message.reply("no puedo acceder a este canal.");
	if (!title) return message.reply("especifica el título de la encuesta.");
	if (!options) {
		options = ["Sí", "No"];
	}
	if (options.length < 2)
		return message.reply("por favor, proporciona más de dos opciones.");
	if (options.length > emojiList.length)
		return message.reply(
			`por favor, no excedas de ${emojiList.length} opciones.`
		);

	let text = `✥ Para votar, reacciona usando el emoji correspondiente.\n✥ ${
		timeout > 0
			? "La encuesta terminará en **" + timeout + "** segundos."
			: "La encuesta **finalizará manualmente** según el creador de la encuesta lo decida."
	}\n✥ El creador de esta encuesta puede finalizar **forzadamente** reaccionando al emoji ${forceEndPollEmoji}\n\n`;
	const emojiInfo = {};
	for (const option of options) {
		const emoji = emojiList.splice(0, 1);
		emojiInfo[emoji] = { option: option, votes: 0 };
		text += `${emoji} : \`${option}\`\n\n`;
	}
	const usedEmojis = Object.keys(emojiInfo);
	usedEmojis.push(forceEndPollEmoji);

	const poll = await message.channel.send(
		embedBuilder(title, message.author)
			.setDescription(text)
			.setColor("7c4e55")
			.setThumbnail(message.guild.iconURL())
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
			if (
				reaction.emoji.name === forceEndPollEmoji &&
				message.author.id !== user.id
			)
				return;
			emojiInfo[reaction.emoji.name].votes = reaction.count - 1;
		}
	});
	// reactionCollector.on("dispose", (reaction, user) => {
	// 	if (usedEmojis.includes(reaction.emoji.name)) {
	// 		emojiInfo[reaction.emoji.name].votes -= 1;
	// 	}
	// });
	reactionCollector.on("end", () => {
		text = "*¡La encuesta ha terminado!*\n✥ Los resultados son:\n\n";
		for (const emoji in emojiInfo)
			text += `• \`${emojiInfo[emoji].option}\` - \`${emojiInfo[emoji].votes} votos\`\n\n`;
		poll.delete();
		message.channel.send(
			embedBuilder(title, message.author).setDescription(text)
		);
	});
};

const embedBuilder = (title, author) => {
	return new MessageEmbed()
		.setTitle(`Encuesta - ${title}`)
		.setFooter(
			`Encuesta creada por ${author.tag}`,
			author.displayAvatarURL()
		);
};

module.exports = voteEmbed;
