import './toggle.scss';
/* eslint-disable @typescript-eslint/no-explicit-any */
type Props = {
  isLoading?: boolean;
  currentState: 'loading' | 'active' | 'inActive';
  onClickHandler: () => void;
  containerStyle?: React.CSSProperties;
  switchStyle?: React.CSSProperties;
  sliderStyle?: React.CSSProperties;
  firstIcon?: any;
  secondIcon?: any;
};
export function Toggle({
  isLoading = false,
  currentState,
  onClickHandler,
  containerStyle,
  switchStyle,
  sliderStyle,
  firstIcon,
  secondIcon,
}: Props) {
  return (
    <div
      className={`toggle-container ${currentState} ${
        isLoading ? 'loading' : ''
      }`}
      style={{ ...containerStyle }}
      role="switch"
    >
      <label className="switch" style={{ ...switchStyle }}>
        <input type="checkbox" onChange={onClickHandler} />
        <span className="slider round" style={{ ...sliderStyle }}>
          {firstIcon}
          {secondIcon}
        </span>
      </label>
    </div>
  );
}
