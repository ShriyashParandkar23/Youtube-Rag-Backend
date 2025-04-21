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
  const userQuery = req.body?.UserQuery?.data;
  const oldMsg = req.body?.oldMsg?.data;
  const videoId = req.body?.videoID?.data;

  try {
    // Getting the transcript from the YouTube video
    const transcriptData = await retrieveTranscript(videoId);
    if (!transcriptData || !transcriptData.parsedTranscript) {
      console.error("Transcript not found or failed to fetch");
      return res.json({
        transcript: "",
        responseAI: "Unable to fetch transcript or video details.",
      });
    }

    const { parsedTranscript } = transcriptData;

    // Generating the OpenAI Response
    const responseAI = await chatbotAI(parsedTranscript, userQuery, oldMsg);

    // Send the response with the transcript and AI response
    res.json({
      transcript: parsedTranscript,
      responseAI: responseAI,
    });
  } catch (error) {
    console.error("Error processing the request:", error);
    res.status(500).json({
      transcript: "",
      responseAI: "An error occurred while processing your request.",
    });
  }
});

  



app.listen(PORT, () => console.log(`Server is running on port: ${PORT}`));
