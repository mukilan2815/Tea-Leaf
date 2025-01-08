// i18n.js

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "expo-localization";
import en from "./locales/en/translation.json";
import hi from "./locales/hi/translation.json";
import ta from "./locales/ta/translation.json";
import te from "./locales/te/translation.json";
import bn from "./locales/bn/translation.json";

const resources = {
  en: { translation: en },
  hi: { translation: hi },
  ta: { translation: ta },
  te: { translation: te },
  bn: { translation: bn },
};

i18n
  .use(initReactI18next) // Passes i18n down to react-i18next
  .init({
    resources,
    lng: Localization.locale.split("-")[0], // Extract language code
    fallbackLng: "en",
    interpolation: {
      escapeValue: false, // React already protects from XSS
    },
    react: {
      useSuspense: false, // Disable suspense for React Native
    },
  });

export default i18n;
