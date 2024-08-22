import { IonLabel, IonTabButton } from '@ionic/react';
import { Route } from 'react-router';

import { urls } from '../constants/urls';

/**
 * Tabs will be used to split the wallet up in 2+ parallel and non-interacting trees:
 * - Each tree belong will be associated with a single tab.
 * - Each tree will have it's own navigation stack - switching trees preserves the navigation state
 * - Pages (aka views) are registered under a tree through a urls of the form /:tab(tabPath)/path-to-page
 * - Using this factory function should prevent cross-tab navigation which is not allowed e.g. from /us2/xxx page to /hp/yyy page.
 *
 * @returns root path
 * @returns registerPage function that links a page to this tabs navigation tree
 * @returns createPath function that creates a valid path in this subtree
 * @returns tab JSX.Element that should be placed inside a <IonTabBar>
 */
export function createTab(tabPath: string, tabLabel: string) {
  const root = `/${tabPath}`;
  return {
    root,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    registerPage: (page: (...args: any[]) => JSX.Element, url?: string) => (
      <Route
        exact
        path={url ? `/:tab(${tabPath})/${url}` : `/:tab(${tabPath})`}
        component={page}
      />
    ),
    createPath: (url: string, params?: Record<string, string>) => {
      let base = `${root}/${url}`;
      params &&
        Object.entries(params).forEach((value) => {
          base = base.replace(`:${value[0]}`, value[1]);
        });
      return base;
    },
    tab: (
      <IonTabButton tab={tabPath} href={root}>
        <IonLabel>{tabLabel}</IonLabel>
      </IonTabButton>
    ),
  };
}

export const AkashicTab = createTab(urls.akashicPay, 'AkashicPay Chain');
export const { createPath: akashicPayPath, root: akashicPayRoot } = AkashicTab;

export const Us2Tab = createTab(urls.us2, 'Square (US²)');
export const { createPath: us2Path } = Us2Tab;
