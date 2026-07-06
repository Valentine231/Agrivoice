"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type LangCode = "en" | "ig" | "yo" | "ha";

export const LANGUAGES: { code: LangCode; label: string; nativeLabel: string }[] = [
  { code: "en", label: "English", nativeLabel: "English" },
  { code: "ig", label: "Igbo", nativeLabel: "Igbo" },
  { code: "yo", label: "Yoruba", nativeLabel: "Yorùbá" },
  { code: "ha", label: "Hausa", nativeLabel: "Hausa" },
];

/**
 * Dictionary of UI strings. Keep entries short and literal — most farmers using
 * this product will be reading on small screens, sometimes as a second or third
 * language. Native-speaker review is strongly recommended before production use;
 * these translations are a solid starting point, not a certified localization.
 */
const dict: Record<string, Record<LangCode, string>> = {
  appName: { en: "AgriLink", ig: "AgriLink", yo: "AgriLink", ha: "AgriLink" },
  tagline: {
    en: "Sell your harvest straight to real buyers",
    ig: "Ree ihe ubi gị nye ndị na-azụ ahịa n'ezie",
    yo: "Ta ohun ọ̀gbìn rẹ tààrà fún àwọn oníbàárà tòótọ́",
    ha: "Sayar da amfanin gonarka kai tsaye ga masu saye na gaske",
  },
  heroSub: {
    en: "AgriLink connects farmers, buyers, and trusted transporters — with your money held safe until you agree the job is done.",
    ig: "AgriLink na-ejikọ ndị ọrụ ugbo, ndị na-azụ ahịa, na ndị na-ebufe ahịa e nwere ntụkwasị obi — ego gị dị nchekwa ruo mgbe unu kwenyere na ọrụ ahụ zuru.",
    yo: "AgriLink so àwọn àgbẹ̀, oníbàárà, àti awakọ̀ tí a gbẹ́kẹ̀lé pọ̀ — owó rẹ yóò wà láìléwu títí ẹ o fi gbà pé iṣẹ́ ti parí.",
    ha: "AgriLink tana haɗa manoma, masu saye, da masu jigilar kaya amintattu — kuɗinka zai kasance lafiya har sai kun amince aikin ya cika.",
  },
  getStartedFarmer: { en: "I'm a Farmer", ig: "Abụ m Onye Ọrụ Ugbo", yo: "Àgbẹ̀ ni mí", ha: "Ni Manomi" },
  getStartedBuyer: { en: "I'm a Buyer", ig: "Abụ m Onye Na-azụ Ahịa", yo: "Oníbàárà ni mí", ha: "Ni Mai Saye" },
  howItWorks: { en: "How it works", ig: "Otu ọ na-arụ ọrụ", yo: "Bí ó ṣe ń ṣiṣẹ́", ha: "Yadda yake aiki" },
  categories: { en: "Categories", ig: "Ụdị Ihe", yo: "Ẹ̀ka", ha: "Rukuni" },
  marketplace: { en: "Marketplace", ig: "Ahịa", yo: "Ọjà", ha: "Kasuwa" },
  uploadHarvest: { en: "Upload Your Harvest", ig: "Bugote Ihe Ubi Gị", yo: "Fi Ohun Ọ̀gbìn Rẹ Sí Ayélujára", ha: "Loda Amfanin Gonarka" },
  takePhoto: { en: "Take or choose a photo", ig: "See foto ma ọ bụ họrọ foto", yo: "Ya fọ́tò tàbí yan fọ́tò", ha: "Dauki hoto ko zaɓi hoto" },
  cropName: { en: "What did you harvest?", ig: "Kedu ihe i weere n'ubi?", yo: "Kí ni o kórè?", ha: "Me ka ka girbe?" },
  quantity: { en: "How much do you have?", ig: "Ole ka i nwere?", yo: "Iye mélòó ni o ní?", ha: "Nawa kake da shi?" },
  price: { en: "Your price", ig: "Ọnụ ahịa gị", yo: "Iye owó rẹ", ha: "Farashinka" },
  location: { en: "Your location", ig: "Ebe i nọ", yo: "Ibi tí o wà", ha: "Wurin da kake" },
  submit: { en: "Submit", ig: "Zipu", yo: "Fi Ránṣẹ́", ha: "Sallama" },
  contactBuyer: { en: "Message this buyer", ig: "Ziga onye na-azụ ahịa a ozi", yo: "Fi ránṣẹ́ sí oníbàárà yìí", ha: "Aika saƙo ga wannan mai saye" },
  agreePrice: { en: "Agree on price", ig: "Kwekọrịta ọnụ ahịa", yo: "Fohùn síi lórí owó", ha: "Amince akan farashi" },
  chooseTransport: { en: "Choose transport", ig: "Họrọ ụgbọ mbufe", yo: "Yan ọkọ̀ ìrìnnà", ha: "Zaɓi sufuri" },
  payNow: { en: "Pay securely", ig: "Kwụọ ụgwọ n'enweghị nsogbu", yo: "Sanwó láìséwu", ha: "Biya lafiya" },
  escrowNote: {
    en: "Your money stays safe with Paystack until you confirm delivery.",
    ig: "Ego gị ga-anọ n'enweghị nsogbu na Paystack ruo mgbe i kwenyere na e bugatara ya.",
    yo: "Owó rẹ yóò dúró láìséwu pẹ̀lú Paystack títí ìwọ yóò fi jẹ́rìí ìfìjíṣẹ́.",
    ha: "Kuɗinka zai kasance lafiya tare da Paystack har sai ka tabbatar da isarwa.",
  },
  cashCrop: { en: "Cash Crops", ig: "Ihe Ọkụkụ Ego", yo: "Ọ̀gbìn Owó", ha: "Amfanin Kuɗi" },
  perishable: { en: "Perishables", ig: "Ihe Na-ebu Ozi Ngwa Ngwa", yo: "Ohun Tí Ń Bàjẹ́", ha: "Kayan Da Ke Lalacewa" },
  grain: { en: "Grains", ig: "Ọka", yo: "Hóró", ha: "Hatsi" },
  livestock: { en: "Livestock", ig: "Anụ Ụlọ", yo: "Ẹran Ọ̀sìn", ha: "Dabbobi" },
  tuber: { en: "Tubers & Roots", ig: "Ji na Mgbọrọgwụ", yo: "Ìsu àti Egbò", ha: "Kaba da Saiwa" },
  language: { en: "Language", ig: "Asụsụ", yo: "Èdè", ha: "Harshe" },
};

export type DictKey = keyof typeof dict;

interface I18nContextType {
  lang: LangCode;
  setLang: (l: LangCode) => void;
  t: (key: DictKey | string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<LangCode>("en");

  useEffect(() => {
    const saved = typeof window !== "undefined" ? window.localStorage.getItem("agrilink_lang") : null;
    const initialLang = saved && LANGUAGES.some((l) => l.code === saved) ? (saved as LangCode) : "en";
    setLangState(initialLang);
    if (typeof window !== "undefined") {
      window.document.documentElement.lang = initialLang;
    }
  }, []);

  const setLang = (l: LangCode) => {
    setLangState(l);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("agrilink_lang", l);
      window.document.documentElement.lang = l;
    }
  };

  const t = useMemo(
    () => (key: DictKey | string) => {
      const entry = dict[key as DictKey];
      if (!entry) return key;
      return entry[lang] ?? entry.en;
    },
    [lang]
  );

  return <I18nContext.Provider value={{ lang, setLang, t }}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
