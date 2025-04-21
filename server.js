import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { retrieveTranscript } from "./controllers/get-transcript.js";
import { chatbotAI } from "./controllers/chat-completions.js";
dotenv.config();

// Configured PORT ~ Use your env variable
const PORT = process.env.PORT || 8000;
const app = express();
app.use(express.json());


app.use(cors())


// testing route
app.get('/',(req,res)=>{
    return res.json({
        message:'Everything is set up !'
    })
})

app.post("/chatAI", async (req, res) => {
  // console.log('Received request body:', req.body);

  const userQuery = req.body?.UserQuery?.data;
  const oldMsg = req.body?.oldMsg?.data;
  const videoId = req.body?.videoID?.data;

  //   console.log({
  //     userQuery: userQuery,
  //     oldMsg: oldMsg,
  //     videoID: videoId,
  //   });

  // Getting the transcript from the youtube video

  const transcriptData = await retrieveTranscript(videoId);
  if (!transcriptData) {
    console.error("Transcript not found or failed to fetch");
    return res.json({
      transcript: "",
      responseAI: "Unable to fetch transcript or video details.",
    });
  }
  const { parsedTranscript, metadata } = transcriptData;

  // Generating the OpenAI Response

  const responseAI = await chatbotAI(parsedTranscript, userQuery, oldMsg);
  console.log(responseAI);

  // Simulate AI response (for now just sending the parsed transcript)
  //   const responseAI = parsedTranscript || "No transcript found for the video.";
  res.json({
    transcript: parsedTranscript,
    responseAI: responseAI,
  });

  // Further logic for processing the request
});

  



app.listen(PORT, () => console.log(`Server is running on port: ${PORT}`));
