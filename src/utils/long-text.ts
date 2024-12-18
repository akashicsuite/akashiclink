/**
 * return the first length/2 characters and last length/2 if the isSplitInHalf is true. Excluding AS, 0x and T at the front
 * return the first 10 characters and last 5 if the string is too long. connected with ...
 *
 * @param long long string
 *
 * @returns first 10 characters + ... +  5 last characters || first length/2 characters + ... +  length/2 last characters excluding AS, 0x and T
 */
export function displayLongText(
  long = '',
  length = 15,
  isPostfix?: boolean,
  isSplitInHalf?: boolean
): string {
  if (long.length <= length) return long;

  if (isSplitInHalf) {
    const halfLength = length / 2;
    if (long.startsWith('AS') || long.startsWith('0x')) {
      return long.slice(0, halfLength + 2) + '...' + long.slice(-halfLength);
    } else if (long.startsWith('T')) {
      return long.slice(0, halfLength + 1) + '...' + long.slice(-halfLength);
    } else {
      return long.slice(0, halfLength) + '...' + long.slice(-halfLength);
    }
  } else if (isPostfix) {
    return long.slice(0, length - 2) + '..';
  } else {
    return long.slice(0, length - 5) + '...' + long.slice(-5);
  }
}
