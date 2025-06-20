const fs = require('fs');
const axios = require('axios');
const https = require('https');

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

    // 🔁 Get mastery info from your local Fastify server
    const { data: mastery } = await axios.get('http://127.0.0.1:3000/mastery/Dinglebob-dbob');

    console.log('Raw mastery response:', mastery);
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
