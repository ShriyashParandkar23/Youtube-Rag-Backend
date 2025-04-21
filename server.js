import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();


// Configured PORT ~ Use your env variable
const PORT = process.env.PORT || 8000;
const app = express();

app.use(cors())

// testing route
app.get('/',(req,res)=>{
    return res.json({
        message:'Everything is set up !'
    })
})

app.post('/chatAI',(req,res)=>{

})




app.listen(PORT, () => console.log(`Server is running on port: ${PORT}`));
