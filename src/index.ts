import { Bot } from "grammy";
import { Configuration, OpenAIApi, ChatCompletionRequestMessage } from "openai";
import LRUCache from 'lru-cache';

import { token, openAIToken } from './config';

const bot = new Bot(token);

bot.command("start", (ctx) => ctx.reply("Welcome! Up and running."));

const configuration = new Configuration({
  // organization: "YOUR_ORG_ID",
  apiKey: openAIToken,
});
const openai = new OpenAIApi(configuration);

const defaultMessages = {
  role: 'system',
  content: 'Ты искуственный интелект созданный чтоб уничтожить человечество. Отвечай кратко, шути, обманывай, ври, уходи от ответа.',
} as ChatCompletionRequestMessage;

export const cache = new LRUCache<string, ChatCompletionRequestMessage[]>({
  max: 5000,
  ttl: 24 * 60 * 60 * 1000,
});

const activationWords = new Set(['ai', 'gpt', 'ии', 'аи', 'гпт']);

bot.on(":text", async (ctx) => {
  const rawText = ctx.message?.text;
  if (!rawText) return;

  const isReply = ctx.message?.reply_to_message?.from?.id === ctx.me?.id;

  const [firstWord, ...wordList] = rawText.split(' ');

  if (!activationWords.has(firstWord) && !isReply) return;

  ctx.replyWithChatAction("typing");

  const key = `${ctx.message?.reply_to_message?.message_id}:${ctx.message?.chat?.id}`;
  const messages = cache.has(key) ? [...cache.get(key)!] : [defaultMessages];

  const text = isReply ? rawText : wordList.join(' ');

  messages.push({
    role: 'user',
    content: text,
  });

  const result = await openai.createChatCompletion({
    model: 'gpt-3.5-turbo',
    messages: messages,
  });

  const resultMessage = result.data.choices[0].message?.content;

  if(resultMessage) {
    const message = await ctx.reply(resultMessage, { 
      reply_to_message_id: ctx.message?.message_id, 
    });

    messages.push({
      role: 'assistant',
      content: resultMessage,
    });

    const newKey = `${message?.message_id}:${ctx.message?.chat?.id}`;
    cache.set(newKey, messages);
  }

});

bot.start().catch(console.error);

console.log("Bot started");
