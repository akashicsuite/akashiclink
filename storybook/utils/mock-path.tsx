import { MemoryRouter } from 'react-router-dom';

/**
 * Decorator that puts the components on a mocked path.
 * Required for storybook components where the path is important (e.g. redirects or conditional rendering).
 *
 * @param path to put component onto
 */
export function withMockPath(path: string) {
  return (Story: any) => (
    <MemoryRouter initialEntries={[path]}>
      <Story />
    </MemoryRouter>
  );
}
