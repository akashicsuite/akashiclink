import { IonRadioGroup } from '@ionic/react';

import { LANGUAGE_LIST } from '../../i18n/supported-languages';
import { useSetGlobalLanguage } from '../../utils/hooks/useSetGlobalLanguage';
import { DownArrow } from './down-arrow';
import { ForwardArrow } from './forward-arrow';
import { SettingsRadio } from './setting-radio';

function getLanguageTitle(locale: string) {
  const language = LANGUAGE_LIST.find((l) => l.locale === locale);
  return language?.title;
}

export const LanguageTextCaret = ({
  showAccordionItem,
}: {
  showAccordionItem?: boolean;
}) => {
  const [globalLanguage] = useSetGlobalLanguage();

  return (
    <>
      <h5 className="ion-no-margin ion-text-size-xs ion-margin-right-xs">
        {getLanguageTitle(globalLanguage)}
      </h5>
      {showAccordionItem ? <DownArrow /> : <ForwardArrow />}
    </>
  );
};

export const LanguageAccordion = () => {
  const [globalLanguage, setGlobalLanguage] = useSetGlobalLanguage();

  return (
    <IonRadioGroup
      value={globalLanguage}
      className="ion-padding-top-0 ion-padding-bottom-0 ion-padding-left-xs ion-padding-right-xs"
    >
      {LANGUAGE_LIST.map((item) => {
        return (
          <SettingsRadio
            key={item.locale}
            labelPlacement="end"
            justify="start"
            value={item.locale}
            onClick={() => setGlobalLanguage(item.locale)}
            width={'100%'}
            mode="md"
          >
            <h5 className="ion-no-margin">{item.title}</h5>
          </SettingsRadio>
        );
      })}
    </IonRadioGroup>
  );
};
