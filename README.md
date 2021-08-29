# Paquete de encuestas de Erina

## Uso

```js
const voteEmbed = require("erinapolls");

/**
- title <String> (ej: "Título de la encuesta")
- options <Array> (ej: ["Opcion1", "Opcion2"])
- timeout <String> (ej: 30)
- lang <String> (ej: "en")
- emojiList <Array>
- forceEndPollEmoji <String>
**/
voteEmbed(message, title, options, timeout, lang, emojiList, forceEndPollEmoji);
```

## Idiomas soportados

- English `en` 
