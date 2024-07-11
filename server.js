import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import fetch from 'node-fetch';

dotenv.config();

const app = express();
const port = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

app.get('/api/lyrics', async (req, res) => {
  const { song, artist } = req.query;

  const apiKey = process.env.MUSIXMATCH_API_KEY;
  const apiUrl = `https://api.musixmatch.com/ws/1.1/matcher.lyrics.get?q_track=${song}&q_artist=${artist}&apikey=${apiKey}`;

  fetch(apiUrl).then(res => {
    return res.json();
  }).then(data => {
    if (data.message.body.lyrics) {
      let returned = data.message.body.lyrics.lyrics_body.split("***")[0];
      res.json({ lyrics: returned });
    }
  }).catch(error => error);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});