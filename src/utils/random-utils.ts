export function randomIntFromInterval(min: number, max: number): number {
  // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
}
// gets 4 different numbers.
export function getRandomNumbers(min: number, max: number, length: number) {
  const numberGenerated: Array<number> = [];
  while (numberGenerated.length < length) {
    const r = randomIntFromInterval(min, max);
    if (numberGenerated.indexOf(r) === -1) numberGenerated.push(r);
  }
  return numberGenerated;
}
