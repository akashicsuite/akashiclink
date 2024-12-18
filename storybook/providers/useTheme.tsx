import type { StoryContext, StoryFn } from '@storybook/react';
import { useEffect } from 'react';

import { useAppDispatch, useAppSelector } from '../../src/redux/app/hooks';
import { selectTheme, setTheme } from '../../src/redux/slices/preferenceSlice';
import { themeType } from '../../src/theme/const';

/**
 * Toggle theme when user toggle toolbar
 */
export const useTheme = (Story: StoryFn, context: StoryContext) => {
  const dispatch = useAppDispatch();
  const storedTheme = useAppSelector(selectTheme);

  const toggleDarkTheme = (setDark: boolean) => {
    document.body.classList.toggle('dark', setDark);
    document.body.classList.toggle('light', !setDark);
  };

  useEffect(() => {
    toggleDarkTheme(context.globals.theme === themeType.DARK);
    dispatch(setTheme(context.globals.theme));
  }, [context.globals.theme]);

  useEffect(() => {
    toggleDarkTheme(storedTheme === themeType.DARK);
  }, [storedTheme]);

  return <Story />;
};
