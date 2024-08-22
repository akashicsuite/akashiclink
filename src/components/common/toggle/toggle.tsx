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
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
    <div
      className={`toggle-container ${currentState} ${
        isLoading ? 'loading' : ''
      }`}
      style={{ ...containerStyle }}
      // eslint-disable-next-line jsx-a11y/role-has-required-aria-props
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
