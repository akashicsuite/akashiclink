import { useAccountStorage } from '../../../utils/hooks/useLocalAccounts';
import { displayLongText } from '../../../utils/long-text';
import { CopyBox } from '../../common/copy-box';
import { RefreshDataButton } from './refresh-data-button';

export function Toolbar({ showRefresh = false }: { showRefresh?: boolean }) {
  const { activeAccount } = useAccountStorage();

  // Calculate how much space we have for the text in copy-box
  // "Window - refreshIconSize - gap - padding - margin" in CopyBox
  // Use this to decide how many characters we can display
  const spaceForText = window.innerWidth - 32 - 8 - 48 - 60;

  return (
    <div
      style={{
        padding: '12px 24px',
        height: 'auto',
        display: 'flex',
        gap: '8px',
        justifyContent: 'space-between',
      }}
    >
      <div style={{ flex: 1 }}>
        <CopyBox
          compact
          text={displayLongText(
            activeAccount?.identity ?? '',
            spaceForText / 10,
            false,
            true
          )}
          copyText={activeAccount?.identity ?? ''}
        />
      </div>
      {showRefresh && (
        <div style={{ flex: 0 }}>
          <RefreshDataButton />
        </div>
      )}
    </div>
  );
}
