const Fastify = require('fastify');
const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const fastify = Fastify({ logger: true });

fastify.get('/', async (request, reply) => {
  return { hello: 'Riot Proxy Server is Live!' };
});

// Updated endpoint to handle RiotID format with "#" or "-"
fastify.get('/mastery/:riotId', async (request, reply) => {
  try {
    const apiKey = process.env.RIOT_API_KEY;
    const riotId = request.params.riotId;

    let gameName, tagLine;
    if (riotId.includes('#')) {
      [gameName, tagLine] = riotId.split('#');
    } else if (riotId.includes('-')) {
      [gameName, tagLine] = riotId.split('-');
    } else {
      return reply.status(400).send({ error: 'Riot ID must be in the format GameName#TagLine or GameName-TagLine' });
    }

    console.log("Looking up Riot ID:", gameName, tagLine);

    // Step 1: Get PUUID from Riot ID
    const accountRes = await axios.get(
      `https://americas.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${gameName}/${tagLine}`,
      {
        headers: { 'X-Riot-Token': apiKey }
      }
    );

    const puuid = accountRes.data.puuid;

    // Step 2: Get Summoner info from PUUID
    const summonerRes = await axios.get(
      `https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}`,
      {
        headers: { 'X-Riot-Token': apiKey }
      }
    );

    const summonerId = summonerRes.data.id;

    // Step 3: Get Mastery data
    const masteryRes = await axios.get(
  `https://na1.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-puuid/${puuid}`,
  {
    headers: { 'X-Riot-Token': apiKey }
  }
);


    return masteryRes.data;

  } catch (err) {
    console.error('Error fetching data from Riot API:');
    if (err.response) {
      console.error('Status:', err.response.status);
      console.error('Data:', err.response.data);
    } else {
      console.error(err.message);
    }

    reply.status(500).send({
      error: 'Failed to fetch mastery data.',
      step: err.config?.url,
      status: err.response?.status,
      message: err.response?.data || err.message
    });
  } // ← THIS BRACE WAS MISSING
});

const start = async () => {
  try {
    await fastify.listen({ port: process.env.PORT || 3000, host: '0.0.0.0' });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
