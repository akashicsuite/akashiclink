import styled from '@emotion/styled';

export const Divider = styled.div<{
  borderColor?: string;
  height?: string;
  borderWidth?: string;
  horizontal?: boolean;
}>((props) => ({
  boxSizing: 'border-box',
  height: `${props.height ?? '1px'}`,
  borderTop: `${props.borderWidth ?? '1px'} solid ${
    props.borderColor ?? '#D9D9D9'
  }`,
  marginTop: '8px',
  marginBottom: '8px',
  ...(props.horizontal && {
    width: '100%',
  }),
}));
