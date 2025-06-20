const Fastify = require('fastify');
const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const fastify = Fastify({ logger: true });

fastify.get('/', async (request, reply) => {
  return { hello: 'Riot Proxy Server is Live!' };
});

fastify.get('/mastery/:summoner', async (request, reply) => {
  try {
    const summonerName = request.params.summoner;
    const apiKey = process.env.RIOT_API_KEY;
    console.log("API Key:", apiKey);

    console.log("Summoner Name:", summonerName);

    const summonerRes = await axios.get(
      `https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-name/${summonerName}`,
      {
        headers: { 'X-Riot-Token': apiKey }
      }
    );

    const summonerId = summonerRes.data.id;

    const masteryRes = await axios.get(
      `https://na1.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-summoner/${summonerId}`,
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
      console.error(err);
    }
    reply.status(500).send({ error: 'Failed to fetch mastery data.' });
  }
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