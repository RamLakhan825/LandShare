// const { PriceHistory, PredictedPrice, PredictedPriceV2 } = require("../models");

// /**
//  * Calculate regression metrics between actual and predicted prices
//  * @param {number[]} actualPrices - array of true closing prices
//  * @param {number[]} predictedPrices - array of predicted prices
//  * @returns {object} - MAE, MSE, RMSE, MAPE, R2
//  */
// function calculateAccuracy(actualPrices, predictedPrices) {
//   const n = actualPrices.length;
//   if (n === 0 || predictedPrices.length !== n) return null;

//   let mae = 0, mse = 0, mape = 0;
//   const meanActual = actualPrices.reduce((sum, val) => sum + val, 0) / n;

//   let ssRes = 0, ssTot = 0;

//   for (let i = 0; i < n; i++) {
//     const error = predictedPrices[i] - actualPrices[i];
//     mae += Math.abs(error);
//     mse += error ** 2;
//     mape += Math.abs(error / actualPrices[i]);
//     ssRes += error ** 2;
//     ssTot += (actualPrices[i] - meanActual) ** 2;
//   }

//   mae /= n;
//   mse /= n;
//   const rmse = Math.sqrt(mse);
//   mape = (mape / n) * 100;
//   const r2 = ssTot === 0 ? 1 : 1 - ssRes / ssTot;

//   return { MAE: mae, MSE: mse, RMSE: rmse, MAPE: mape, R2: r2 };
// }

// /**
//  * Get accuracy metrics for a specific IPO
//  * @param {number} ipoId
//  * @returns {object} - { model1: {...}, model2: {...} }
//  */
// async function getIpoAccuracy(ipoId) {
//   const priceHistory = await PriceHistory.findAll({
//     where: { ipoId },
//     order: [["timestamp", "ASC"]],
//   });

//   if (!priceHistory.length) return null;

//   const actualPrices = priceHistory.map(p => parseFloat(p.close));

//   const predicted1 = await PredictedPrice.findAll({ where: { ipoId }, order: [["createdAt", "ASC"]] });
//   const predicted2 = await PredictedPriceV2.findAll({ where: { ipoId }, order: [["createdAt", "ASC"]] });

//   if (!predicted1.length || !predicted2.length) return null;

//   const predictedPrices1 = predicted1.map(p => parseFloat(p.predictedClose));
//   const predictedPrices2 = predicted2.map(p => parseFloat(p.predictedClose));

//   // Align lengths: in case predictions are shorter
//   const minLen = Math.min(actualPrices.length, predictedPrices1.length, predictedPrices2.length);
//   return {
//     model1: calculateAccuracy(actualPrices.slice(-minLen), predictedPrices1.slice(-minLen)),
//     model2: calculateAccuracy(actualPrices.slice(-minLen), predictedPrices2.slice(-minLen)),
//   };
// }

// module.exports = { calculateAccuracy, getIpoAccuracy };



const { PriceHistory, PredictedPrice, PredictedPriceV2 } = require("../models");

// Simple accuracy: 100 - MAPE
function calculateSimpleAccuracy(actualPrices, predictedPrices) {
  const n = actualPrices.length;
  if (n === 0 || predictedPrices.length !== n) return null;

  let totalError = 0;
  for (let i = 0; i < n; i++) {
    totalError += Math.abs(predictedPrices[i] - actualPrices[i]) / actualPrices[i];
  }

  const mape = (totalError / n) * 100;
  const accuracy = 100 - mape; // higher is better
  return Number(accuracy.toFixed(2));
}

async function getIpoAccuracy(ipoId) {
  const priceHistory = await PriceHistory.findAll({
    where: { ipoId },
    order: [["timestamp", "ASC"]],
  });

  if (!priceHistory.length) return null;

  const actualPrices = priceHistory.map(p => parseFloat(p.close));

  const predicted1 = await PredictedPrice.findAll({ where: { ipoId }, order: [["createdAt", "ASC"]] });
  const predicted2 = await PredictedPriceV2.findAll({ where: { ipoId }, order: [["createdAt", "ASC"]] });

  if (!predicted1.length || !predicted2.length) return null;

  const predictedPrices1 = predicted1.map(p => parseFloat(p.predictedClose));
  const predictedPrices2 = predicted2.map(p => parseFloat(p.predictedClose));

  const minLen = Math.min(actualPrices.length, predictedPrices1.length, predictedPrices2.length);

  return {
    model1: calculateSimpleAccuracy(actualPrices.slice(-minLen), predictedPrices1.slice(-minLen)),
    model2: calculateSimpleAccuracy(actualPrices.slice(-minLen), predictedPrices2.slice(-minLen)),
  };
}

module.exports = { calculateSimpleAccuracy, getIpoAccuracy };
