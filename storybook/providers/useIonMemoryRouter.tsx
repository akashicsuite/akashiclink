import { IonApp } from '@ionic/react';
import { IonReactMemoryRouter } from '@ionic/react-router';
import type { StoryContext, StoryFn } from '@storybook/react';
import { createMemoryHistory } from 'history';

export const useIonMemoryRouter = (
  Story: StoryFn,
  { parameters: { history } }: StoryContext
) => {
  return (
    <IonApp>
      <IonReactMemoryRouter
        history={createMemoryHistory({
          initialEntries: [
            {
              state: {
                ...history,
              },
            },
          ],
        })}
      >
        <Story />
      </IonReactMemoryRouter>
    </IonApp>
  );
};
