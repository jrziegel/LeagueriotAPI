require('dotenv').config();
const fs = require('fs');
const https = require('https');

const API_KEY = process.env.RIOT_API_KEY;
const SUMMONER_ID = 'Yy3OsNhQ9No5Cw8CbUVFSK7oURkvZrJPJiNN-hLxRpZFzyLzHnkxOp8a32Iq89X437rpmkbhibqn6A';
const REGION = 'na1';
const DATA_DRAGON_VERSION = '14.12.1';

function getJSON(url) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

(async () => {
  try {
    // Get champ ID → name
    const champMeta = await getJSON(`https://ddragon.leagueoflegends.com/cdn/${DATA_DRAGON_VERSION}/data/en_US/champion.json`);
    const idToName = {};
    for (const champ in champMeta.data) {
      idToName[champMeta.data[champ].key] = champMeta.data[champ].id;
    }

    // Get mastery info
    const mastery = await getJSON(`https://${REGION}.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-summoner/${SUMMONER_ID}?api_key=${API_KEY}`);
    const top25 = mastery.slice(0, 25);

    // Build masteryStats object
    const masteryStats = {};
    top25.forEach(c => {
      const name = idToName[c.championId.toString()];
      if (name) {
        masteryStats[name] = {
          level: c.championLevel,
          points: c.championPoints,
          lastPlayTime: c.lastPlayTime
        };
      }
    });

    const jsCode = `const masteryStats = ${JSON.stringify(masteryStats, null, 2)};`;
    fs.writeFileSync('masteryData.js', jsCode);
    console.log('✅ masteryData.js updated successfully.');

  } catch (err) {
    console.error('❌ Failed:', err.message);
  }
})();
