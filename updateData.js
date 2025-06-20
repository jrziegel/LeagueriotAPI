require('dotenv').config();
const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');

const NEOCITIES_API_KEY = process.env.NEOCITIES_API_KEY;
const NEOCITIES_USER = process.env.NEOCITIES_USER || 'user'; // fallback
const LOCAL_API_URL = 'http://127.0.0.1:3000/mastery/Dinglebob-dbob';

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
  const response = await axios.get(LOCAL_API_URL);

  for (const champ of response.data) {
    const name = Object.keys(champions).find(key => champions[key] === champ.championId);
    if (name) {
      result[name] = {
        level: champ.championLevel,
        points: champ.championPoints
      };
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
  headers: {
    ...form.getHeaders(),
    Authorization: `Bearer ${NEOCITIES_API_KEY}`
  }
});

  console.log('✅ Uploaded to Neocities:', response.data);
}

(async () => {
  try {
    const masteryData = await fetchMasteryData();
    await saveAndUpload(masteryData);
  } catch (err) {
    console.error('❌ Error during update:', err.response?.data || err.message);
  }
})();
