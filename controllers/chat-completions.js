import OpenAI from "openai";
import dotenv from 'dotenv';

dotenv.config()
// Created OPEN AI Client ~ Use your OPENAI API Key
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const chatbotAI = async (transcript,userQuery,oldMessages)=>{

  console.log(transcript,userQuery,oldMessages)

  const system_prompt = `You are an AI Assistant which understand the ${userQuery} 
  and generate answer only based on ${transcript}. and return the message as a chat. 
  
  Rules:
  --Only answer the question if those are related to ${transcript}. Otherwise you can 
  sassily reply to the user in a fun way. 
  -- You are allowed to generate response in English or Hinglish only. That depends based on the ${userQuery}
  -- Also consider the previous conversation with the user which you can get from ${oldMessages} and you 
  can help user to resolve his query. 
  -- Keep the conversation interesting and fun. 
  -- Don't disrespect. Be Friendly
  -- your response should not be more than 100 words. Remember you are chatting with user Don't make him bore.
  `
  const completion = await client.chat.completions.create({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: system_prompt },
      { role: 'user', content: userQuery },
    ],
  });
  
  console.log(completion.choices[0].message.content);
  return completion.choices[0].message.content
}

export {chatbotAI}
