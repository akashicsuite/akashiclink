/**
 *
 * @param identity ledgerId of nft
 * @param quality numher 0-100 denoting quality of picture
 * @param width size of picture in px?
 * @returns
 */
export function getNftImage(
  identity: string,
  width = '300',
  quality = '100'
): string {
  return `https://nft.akashicchain.com/cdn-cgi/image/width=${width},quality=${quality}/nft/image/${identity}`;
}
