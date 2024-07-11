import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

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

app.get('/api/scrape', async (req, res) => {
  const { song, artist } = req.query;

  const apiUrl = `https://www.musixmatch.com/lyrics/${artist}/${song}`;

  console.log("scraping")
  console.log(song + ", " + artist);

  try {
    const page = await fetch(apiUrl, {
      method: "GET",
    });

    if (!page.ok) {
      res.json({ lyrics: "sorry, we couldn't find the lyrics for this one :(" });
      return;
    }

    const body = await page.text();
    const $ = await cheerio.load(body);

    const $lyrics = $('.r-ueyrd6');
    const lyrics = $lyrics.map((i, e) => $(e).text().toString());
    let finalLyrics = "";
    for (let lyric of lyrics) {
      finalLyrics += `${lyric}\n`;
    }
    console.log(finalLyrics);
    return res.json({ lyrics: finalLyrics });
  } catch (error) {
    console.error(`catch clause error in server: ${error}`);
  }

});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});