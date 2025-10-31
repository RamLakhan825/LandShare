const tf = require("@tensorflow/tfjs");
const { PriceHistory, PredictedPrice, Ipo } = require("../models");
const axios = require("axios");
require("dotenv").config();

// Normalize / denormalize helpers
function normalize(data) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const normalized = data.map(x => (x - min) / (max - min));
  return { normalized, min, max };
}

function denormalize(value, min, max) {
  return value * (max - min) + min;
}

// Prepare sequences for LSTM
function createSequences(data, seqLength = 10) {
  const X = [], y = [];
  for (let i = 0; i < data.length - seqLength; i++) {
    X.push(data.slice(i, i + seqLength));
    y.push(data[i + seqLength]);
  }
  return { X, y };
}

// LSTM price prediction
async function predictPrice(prices) {
  if (prices.length < 15) return prices[prices.length - 1]; // fallback

  const { normalized, min, max } = normalize(prices);
  const seqLength = 10;
  const { X, y } = createSequences(normalized, seqLength);

  const Xtensor = tf.tensor3d(X.map(seq => seq.map(v => [v])));
  const ytensor = tf.tensor2d(y.map(v => [v]));

  const model = tf.sequential();
  model.add(tf.layers.lstm({ units: 50, inputShape: [seqLength, 1] }));
  model.add(tf.layers.dense({ units: 1 }));
  model.compile({ optimizer: "adam", loss: "meanSquaredError" });

  await model.fit(Xtensor, ytensor, { epochs: 50, batchSize: 16, verbose: 0 });

  const lastSeq = normalized.slice(-seqLength).map(v => [v]);
  const predTensor = model.predict(tf.tensor3d([lastSeq]));
  const pred = (await predTensor.array())[0][0];

  return denormalize(pred, min, max);
}

// Cloudflare AI news adjustment
async function getNewsImpact(ipoName) {
  const apiKey = process.env.CF_API_KEY;
  const model = process.env.CF_MODEL;

  try {
    const response = await axios.post(
      "https://api.cloudflare.com/client/v4/accounts/self/workers/services/llama-3-8b-instruct/deployments",
      { input: `Analyze the sentiment of recent news for "${ipoName}" land prices. Output a number between -0.05 and 0.05 indicating price adjustment.` },
      { headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" } }
    );

    let impact = parseFloat(response.data?.result?.output?.[0]?.content || 0);
    if (isNaN(impact)) impact = 0;
    return impact;
  } catch (err) {
    console.error("News sentiment error:", err.message);
    return 0;
  }
}

// Full prediction & store
async function predictAndStore(ipoId) {
  const ipo = await Ipo.findByPk(ipoId);
  if (!ipo) return 0;

  const prices = await PriceHistory.findAll({ where: { ipoId }, order: [["timestamp", "ASC"]] });
  const closePrices = prices.map(p => parseFloat(p.close));

  let predictedPrice = await predictPrice(closePrices);
  const newsImpact = await getNewsImpact(ipo.ownerName);
  predictedPrice *= 1 + newsImpact;

  await PredictedPrice.create({ ipoId, predictedClose: predictedPrice });
  return predictedPrice;
}

module.exports = { predictAndStore };
