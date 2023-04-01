import { config } from 'dotenv';

config();

const showError = (msg: string) => {
  throw new Error(msg)
};


export const token = process.env.TOKEN || showError('token not found in .env');
export const openAIToken = process.env.OPENAI_API_KEY || showError('token not found in .env');

