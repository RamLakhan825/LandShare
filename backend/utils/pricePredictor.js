// const tf = require("@tensorflow/tfjs");
// const { PriceHistory, PredictedPrice, Ipo } = require("../models");
// const axios = require("axios");
// require("dotenv").config();
// const { PredictedPriceV2 } = require("../models");


// // Normalize / denormalize helpers
// function normalize(data) {
//   const min = Math.min(...data);
//   const max = Math.max(...data);
//   const normalized = data.map(x => (x - min) / (max - min));
//   return { normalized, min, max };
// }

// function denormalize(value, min, max) {
//   return value * (max - min) + min;
// }

// // Prepare sequences for LSTM
// function createSequences(data, seqLength = 10) {
//   const X = [], y = [];
//   for (let i = 0; i < data.length - seqLength; i++) {
//     X.push(data.slice(i, i + seqLength));
//     y.push(data[i + seqLength]);
//   }
//   return { X, y };
// }

// // LSTM price prediction
// async function predictPrice(prices) {
//   if (prices.length < 15) return prices[prices.length - 1]; // fallback

//   const { normalized, min, max } = normalize(prices);
//   const seqLength = 10;
//   const { X, y } = createSequences(normalized, seqLength);

//   const Xtensor = tf.tensor3d(X.map(seq => seq.map(v => [v])));
//   const ytensor = tf.tensor2d(y.map(v => [v]));

//   const model = tf.sequential();
//   model.add(tf.layers.lstm({ units: 50, inputShape: [seqLength, 1] }));
//   model.add(tf.layers.dense({ units: 1 }));
//   model.compile({ optimizer: "adam", loss: "meanSquaredError" });

//   await model.fit(Xtensor, ytensor, { epochs: 50, batchSize: 16, verbose: 0 });

//   const lastSeq = normalized.slice(-seqLength).map(v => [v]);
//   const predTensor = model.predict(tf.tensor3d([lastSeq]));
//   const pred = (await predTensor.array())[0][0];

//   return denormalize(pred, min, max);
// }


// function simpleMovingAverage(prices) {
//   if (prices.length < 10) 
//     return prices[prices.length - 1];

//   const last10 = prices.slice(-10);
//   const avg = last10.reduce((a, b) => a + b, 0) / last10.length;
//   return avg;
// }

// // Cloudflare AI news adjustment
// async function getNewsImpact(ipoName) {
//   const apiKey = process.env.CF_API_KEY;
//   const model = process.env.CF_MODEL;

//   try {
//     const response = await axios.post(
//       "https://api.cloudflare.com/client/v4/accounts/self/workers/services/llama-3-8b-instruct/deployments",
//       { input: `Analyze the sentiment of recent news for "${ipoName}" land prices. Output a number between -0.05 and 0.05 indicating price adjustment.` },
//       { headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" } }
//     );

//     let impact = parseFloat(response.data?.result?.output?.[0]?.content || 0);
//     if (isNaN(impact)) impact = 0;
//     return impact;
//   } catch (err) {
//     console.error("News sentiment error:", err.message);
//     return 0;
//   }
// }

// // Full prediction & store
// // async function predictAndStore(ipoId) {
// //   const ipo = await Ipo.findByPk(ipoId);
// //   if (!ipo) return 0;

// //   const prices = await PriceHistory.findAll({ where: { ipoId }, order: [["timestamp", "ASC"]] });
// //   const closePrices = prices.map(p => parseFloat(p.close));

// //   let predictedPrice = await predictPrice(closePrices);
// //   const newsImpact = await getNewsImpact(ipo.ownerName);
// //   predictedPrice *= 1 + newsImpact;

// //   await PredictedPrice.create({ ipoId, predictedClose: predictedPrice });
// //   return predictedPrice;
// // }

// async function predictAndStore(ipoId) {
//   const ipo = await Ipo.findByPk(ipoId);
//   if (!ipo) return 0;

//   const prices = await PriceHistory.findAll({
//     where: { ipoId },
//     order: [["timestamp", "ASC"]],
//   });

//   const closePrices = prices.map(p => parseFloat(p.close));

//   // MODEL 1
//   let predictedPrice1 = await predictPrice(closePrices);

//   // MODEL 2 (SMA)
//   let predictedPrice2 = simpleMovingAverage(closePrices);

//   // Apply same news impact to both
//   const newsImpact = await getNewsImpact(ipo.ownerName);
//   predictedPrice1 *= 1 + newsImpact;
//   predictedPrice2 *= 1 + newsImpact;

//   // Save both model outputs
//   await PredictedPrice.create({
//     ipoId,
//     predictedClose: predictedPrice1,
//   });

//   await PredictedPriceV2.create({
//     ipoId,
//     predictedClose: predictedPrice2,
//   });

//   return { predictedPrice1, predictedPrice2 };
// }



// module.exports = { predictAndStore };



const tf = require("@tensorflow/tfjs");
const { PriceHistory, PredictedPrice, Ipo, PredictedPriceV2 } = require("../models");
const axios = require("axios");
require("dotenv").config();
const { RandomForestRegression } = require("ml-random-forest");

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

// LSTM price prediction (Model 1)
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

// Random Forest price prediction (Model 2)
function randomForestPredict(prices) {
  if (prices.length < 15) return prices[prices.length - 1]; // fallback

  const seqLength = 10;
  const X = [];
  const y = [];

  for (let i = 0; i <= prices.length - seqLength - 1; i++) {
    X.push(prices.slice(i, i + seqLength));
    y.push(prices[i + seqLength]);
  }

  const rf = new RandomForestRegression({
    nEstimators: 50,
    maxFeatures: Math.round(Math.sqrt(seqLength)),
  });

  rf.train(X, y);

  const lastSeq = prices.slice(-seqLength);
  const predicted = rf.predict([lastSeq])[0];

  return predicted;
}

// Cloudflare AI news adjustment
async function getNewsImpact(ipoName) {
  const apiKey = process.env.CF_API_KEY;

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

  const prices = await PriceHistory.findAll({
    where: { ipoId },
    order: [["timestamp", "ASC"]],
  });

  const closePrices = prices.map(p => parseFloat(p.close));

  // MODEL 1: LSTM
  let predictedPrice1 = await predictPrice(closePrices);

  // MODEL 2: Random Forest
  let predictedPrice2 = randomForestPredict(closePrices);

  // Apply same news impact to both
  const newsImpact = await getNewsImpact(ipo.ownerName);
  predictedPrice1 *= 1 + newsImpact;
  predictedPrice2 *= 1 + newsImpact;

  // Save both model outputs
  await PredictedPrice.create({ ipoId, predictedClose: predictedPrice1 });
  await PredictedPriceV2.create({ ipoId, predictedClose: predictedPrice2 });

  return { predictedPrice1, predictedPrice2 };
}

module.exports = { predictAndStore };
