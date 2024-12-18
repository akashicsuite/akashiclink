export function randomIntFromInterval(min: number, max: number): number {
  // eslint-disable-next-line sonarjs/pseudo-random
  return Math.floor(Math.random() * (max - min + 1) + min);
}
/** Gets `length` UNIQUE number from `min` (inclusive) to `max` (inclusive)
 * WARNING: This function is NOT cryptographically secure and is not robust to
 * nonsensical arguments (i.e. min > max, length > max - min)
 * */
export function getRandomNumbers(min: number, max: number, length: number) {
  const numberGenerated: Array<number> = [];
  while (numberGenerated.length < length) {
    const r = randomIntFromInterval(min, max);
    if (numberGenerated.indexOf(r) === -1) numberGenerated.push(r);
  }
  return numberGenerated;
}
