import { displayLongText } from '../../../utils/long-text';
import { MutedText, PrimaryText } from './address-list-item';

export const MyAccountListItem = ({
  name,
  address,
}: {
  name: string;
  address: string;
}) => (
  <>
    <PrimaryText>{name}</PrimaryText>
    <MutedText>{displayLongText(address, 30, false, true)}</MutedText>
  </>
);
