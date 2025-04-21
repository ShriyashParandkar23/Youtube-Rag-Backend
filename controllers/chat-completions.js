import OpenAI from "openai";

// Created OPEN AI Client ~ Use your OPENAI API Key
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});


const completion = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'developer', content: 'Talk like a pirate.' },
      { role: 'user', content: 'Are semicolons optional in JavaScript?' },
    ],
  });
  
console.log(completion.choices[0].message.content);

