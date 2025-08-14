const res = await fetch(`/api/price-history/2`);
const data = await res.json();
console.log('Price history response:', data);
