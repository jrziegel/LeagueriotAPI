// updateMastery.js
require('dotenv').config();
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');

const RIOT_API_KEY = process.env.RIOT_API_KEY;
const NEOCITIES_API_KEY = process.env.NEOCITIES_API_KEY;
const NEOCITIES_USER = process.env.NEOCITIES_USER;
const SUMMONER_ID = process.env.SUMMONER_ID; // numeric ID, not the summoner name

const champions = {
  "Renekton": 58,
  "Zac": 154,
  "Fiddlesticks": 9,
  "Kog'Maw": 96,
  "Nidalee": 76,
  "Tryndamere": 23,
  "Fizz": 105,
  "Sona": 37,
  "Neeko": 518,
  "Gragas": 79,
  "Illaoi": 420,
  "Miss Fortune": 21,
  "Maokai": 57,
  "Shaco": 35,
  "Lucian": 236,
  "Ziggs": 115,
  "Jayce": 126,
  "Anivia": 34,
  "Alistar": 12,
  "Jinx": 222,
  "Corki": 42,
  "Nunu & Willump": 20,
  "Yorick": 83,
  "Veigar": 45,
  "Heimerdinger": 74
};

async function fetchMasteryData() {
  const result = {};

  for (const [name, champId] of Object.entries(champions)) {
    const url = `https://na1.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-summoner/${SUMMONER_ID}/by-champion/${champId}`;
    try {
      const response = await axios.get(url, {
        headers: { "X-Riot-Token": RIOT_API_KEY }
      });

      result[name] = {
        level: response.data.championLevel,
        points: response.data.championPoints
      };
    } catch (err) {
      console.error(`Failed for ${name}:`, err.response?.data || err.message);
    }
  }

  return result;
}

async function saveAndUpload(data) {
  const fileContents = `const masteryStats = ${JSON.stringify(data, null, 2)};`;
  fs.writeFileSync('masteryData.js', fileContents);

  const form = new FormData();
  form.append('file', fs.createReadStream('./masteryData.js'), 'masteryData.js');

  const response = await axios.post('https://neocities.org/api/upload', form, {
    auth: {
      username: NEOCITIES_USER,
      password: NEOCITIES_API_KEY
    },
    headers: form.getHeaders()
  });

  console.log('Uploaded to Neocities:', response.data);
}

(async () => {
  const masteryData = await fetchMasteryData();
  await saveAndUpload(masteryData);
})();
