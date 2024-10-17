import { chooseBestNodes, PortType } from './nitr0gen/nitr0gen.utils';

/**
 *
 * @param identity ledgerId of nft
 * @param quality numher 0-100 denoting quality of picture
 * @param width size of picture in px?
 * @returns
 */
export async function getNftImage(
  identity: string,
  width = '300',
  quality = '100'
): Promise<string> {
  const NITR0_URL = await chooseBestNodes(PortType.NFT);
  return `${NITR0_URL}cdn-cgi/image/width=${width},quality=${quality}/nft/image/${identity}`;
}
