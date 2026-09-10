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

  // Farmer dashboard
  loading: { en: "Loading…", ig: "Na-ebu ya…", yo: "Ń kó jọ…", ha: "Ana loda…" },
  logIn: { en: "Log in", ig: "Banye", yo: "Wọlé", ha: "Shiga" },
  farmerLoginPrompt: {
    en: "Log in to see your listings",
    ig: "Banye ka ị hụ ihe i tinyere maka ire",
    yo: "Wọlé láti rí àwọn ohun tí o tà",
    ha: "Shiga don ganin abubuwan da kake sayarwa",
  },
  myListings: { en: "My Listings", ig: "Ihe M Na-ere", yo: "Àwọn Ohun Tí Mo Ń Tà", ha: "Kayayyakina" },
  myListingsSub: {
    en: "Everything you've put up for sale.",
    ig: "Ihe niile i tinyere maka ire.",
    yo: "Ohun gbogbo tí o ti fi sílẹ̀ fún títà.",
    ha: "Duk abin da ka sanya don sayarwa.",
  },
  noListingsYetFarmer: {
    en: "You haven't listed anything yet — here's what buyers see on the marketplace right now. Upload your harvest to replace these with your own.",
    ig: "Ị ka tinyebeghị ihe ọ bụla — nke a bụ ihe ndị na-azụ ahịa na-ahụ n'ahịa ugbu a. Bugote ihe ubi gị iji dochie ha na nke gị.",
    yo: "O ò tí ì fi ohunkóhun sílẹ̀ — èyí ni ohun tí àwọn oníbàárà ń rí ní ọjà báyìí. Fi ohun ọ̀gbìn rẹ sí ayélujára láti fi tirẹ rọ́pò àwọn èyí.",
    ha: "Har yanzu ba ka jera komai ba — ga abin da masu saye ke gani a kasuwa yanzu. Loda amfanin gonarka don maye gurbinsu da naka.",
  },
  demoListingsNotePart1: {
    en: "Showing sample listings — connect Supabase in",
    ig: "Ana-egosi ihe nlele — jikọọ Supabase na",
    yo: "Ń fi àpẹẹrẹ ohun tí à ń tà hàn — so Supabase pọ̀ ní",
    ha: "Ana nuna samfuran kaya — haɗa Supabase a cikin",
  },
  demoListingsNotePart2: {
    en: "to manage real ones.",
    ig: "iji jikwaa ndị ezi ihe.",
    yo: "láti ṣàkóso àwọn gidi.",
    ha: "don sarrafa na gaske.",
  },
  addBankDetailsTitle: {
    en: "⚠️ Add your bank details",
    ig: "⚠️ Tinye nkọwa akaụntụ ụlọ akụ gị",
    yo: "⚠️ Fi kúnrẹ́rẹ́ ẹ̀rọ báńkì rẹ sí i",
    ha: "⚠️ Ƙara bayanan bankinka",
  },
  addBankDetailsBody: {
    en: "You need to add your bank account before buyers' payments can be released to you.",
    ig: "Ị ga-etinye akaụntụ ụlọ akụ gị tupu e wepụtara gị ego ndị na-azụ ahịa kwụrụ.",
    yo: "O nílò láti fi àkọọ́lẹ̀ báńkì rẹ sí i kí a tó lè tú owó tí àwọn oníbàárà san sílẹ̀ fún ọ.",
    ha: "Kana bukatar ƙara asusun bankinka kafin a saki kuɗin da masu saye suka biya zuwa gare ka.",
  },
  addBankDetails: {
    en: "Add bank details",
    ig: "Tinye nkọwa ụlọ akụ",
    yo: "Fi kúnrẹ́rẹ́ báńkì sí i",
    ha: "Ƙara bayanan banki",
  },
  payments: { en: "Payments", ig: "Ịkwụ Ụgwọ", yo: "Owó Sísanwó", ha: "Biyan Kuɗi" },
  paymentsExplain: {
    en: "When a buyer pays, the money is held safely by Paystack. You'll be paid out as soon as the buyer confirms the delivery arrived.",
    ig: "Mgbe onye na-azụ ahịa kwụrụ ụgwọ, Paystack na-echekwa ego ahụ n'enweghị nsogbu. A ga-akwụ gị ụgwọ ozugbo onye na-azụ ahịa kwenyere na ihe ahụ eruola.",
    yo: "Nígbà tí oníbàárà bá san owó, Paystack yóò tọ́jú owó náà láìséwu. A óò san owó fún ọ ní kété tí oníbàárà bá jẹ́rìí pé ẹrù ti dé.",
    ha: "Idan mai saye ya biya, Paystack zai riƙe kuɗin lafiya. Za a biya ka nan take idan mai saye ya tabbatar da isar kayan.",
  },

  // Categories page
  categoriesSub: {
    en: "Browse what farmers are selling right now, grouped by category.",
    ig: "Chọgharịa ihe ndị ọrụ ugbo na-ere ugbu a, kekọrịtara n'ụdị.",
    yo: "Wo ohun tí àwọn àgbẹ̀ ń tà báyìí, tí a to sí ẹ̀ka.",
    ha: "Bincika abin da manoma ke sayarwa yanzu, an tsara ta rukuni.",
  },
  demoListingsNotePart2See: {
    en: "to see real ones.",
    ig: "iji hụ ndị ezi ihe.",
    yo: "láti rí àwọn gidi.",
    ha: "don ganin na gaske.",
  },
  noListingsInCategory: {
    en: "No listings in this category yet.",
    ig: "Enweghị ihe e depụtara n'ụdị a ka.",
    yo: "Kò sí ohun tí a tà nínú ẹ̀ka yìí síbẹ̀.",
    ha: "Babu kaya a wannan rukuni tukuna.",
  },

  // Marketplace page
  marketplaceSub: {
    en: "Fresh listings straight from farmers across Nigeria.",
    ig: "Ihe ọhụrụ ndị ọrụ ugbo n'akụkụ Naịjirịa niile depụtara.",
    yo: "Àwọn ohun tuntun tààrà láti ọ̀dọ̀ àwọn àgbẹ̀ jákèjádò Nàìjíríà.",
    ha: "Sabbin kaya kai tsaye daga manoma a fadin Najeriya.",
  },
  allFilter: { en: "All", ig: "Ihe Niile", yo: "Gbogbo", ha: "Duka" },
  searchPlaceholder: {
    en: "Search crop or state…",
    ig: "Chọọ ihe ọkụkụ ma ọ bụ steeti…",
    yo: "Wá ọ̀gbìn tàbí ìpínlẹ̀…",
    ha: "Nemo amfanin gona ko jiha…",
  },
  noListingsMatch: {
    en: "No listings match your search yet.",
    ig: "Enweghị ihe dabara na nchọ gị ka.",
    yo: "Kò sí ohun tí ó bá ìwádìí rẹ mu síbẹ̀.",
    ha: "Babu kayan da suka dace da bincikenka tukuna.",
  },

  // Order confirm page
  loginToViewOrder: {
    en: "Log in with the account you paid from to see this order.",
    ig: "Jiri akaụntụ i ji kwụọ ụgwọ banye ka ị hụ ntinye a.",
    yo: "Wọlé pẹ̀lú àkọọ́lẹ̀ tí o fi san owó láti rí ọ̀rọ̀ yìí.",
    ha: "Shiga da asusun da ka biya don ganin wannan oda.",
  },
  orderNotFound: {
    en: "We couldn't find this order.",
    ig: "Achọtaghị anyị ntinye a.",
    yo: "A kò rí ọ̀rọ̀ yìí.",
    ha: "Ba mu sami wannan oda ba.",
  },
  noPaymentReference: {
    en: "No payment reference found for this order yet.",
    ig: "Enweghị ihe ngosi ụgwọ maka ntinye a ka.",
    yo: "A kò rí ìtọ́kasí owó fún ọ̀rọ̀ yìí síbẹ̀.",
    ha: "Ba a sami tabbacin biya na wannan oda ba tukuna.",
  },
  paymentVerifyFailed: {
    en: "We couldn't confirm this payment yet.",
    ig: "Anyị enwebeghị ike ịkwado ụgwọ a ka.",
    yo: "A kò tí ì lè jẹ́rìísí owó yìí.",
    ha: "Ba mu iya tabbatar da wannan biya ba tukuna.",
  },
  paystackPreviewVerify: {
    en: "Payment verification isn't wired up in this preview — add your Paystack keys in .env.local to go live.",
    ig: "Nyocha ụgwọ ejikọtabeghị na ngosi a — tinye igodo Paystack gị na .env.local ka ọ dị ndụ.",
    yo: "A kò tí ì ṣètò ìjẹ́rìísí owó nínú àpẹẹrẹ yìí — fi kọ́kọ́rọ́ Paystack rẹ sí .env.local kí ó lè ṣiṣẹ́ ní gidi.",
    ha: "Ba a haɗa tabbatar da biya a wannan gwaji ba — ƙara mabuɗan Paystack a .env.local don fara aiki na gaske.",
  },
  confirmingPayment: {
    en: "Confirming your payment…",
    ig: "Na-akwado ụgwọ gị…",
    yo: "Ń jẹ́rìísí owó rẹ…",
    ha: "Ana tabbatar da biyanka…",
  },
  hitSnag: {
    en: "We hit a snag",
    ig: "Anyị zutere nsogbu",
    yo: "A ní ìṣòro díẹ̀",
    ha: "Mun fuskanci matsala",
  },
  backToMarketplace: {
    en: "Back to marketplace",
    ig: "Laghachi n'ahịa",
    yo: "Padà sí ọjà",
    ha: "Koma kasuwa",
  },
  orderStatus: { en: "Order status", ig: "Ọnọdụ Ntinye", yo: "Ipò Ọ̀rọ̀", ha: "Matsayin Oda" },
  itemLabel: { en: "Item", ig: "Ihe", yo: "Ohun", ha: "Kaya" },
  transportLabel: { en: "Transport", ig: "Ụgbọ Mbufe", yo: "Ọkọ̀ Ìrìnnà", ha: "Sufuri" },
  totalPaidLabel: { en: "Total paid", ig: "Mkpokọta Akwụrụ", yo: "Àpapọ̀ Owó Tí A San", ha: "Jimlar da aka biya" },
  shippedNote: {
    en: "The farmer has marked this order as on the way. Once it arrives and you've checked it matches what you agreed, confirm delivery below to release their payment.",
    ig: "Onye ọrụ ugbo akọwapụtala na ntinye a nọ n'ụzọ. Ozugbo o ruru na ị lelewo na ọ dabara na ihe unu kwekọrịtara, kwado nnata ya n'okpuru iji wepụta ụgwọ ha.",
    yo: "Àgbẹ̀ ti fi hàn pé ẹrù yìí ń bọ̀. Nígbà tí ó bá dé, tí o sì ti rí i pé ó bá ohun tí ẹ gbà mu, jẹ́rìí ìfìjíṣẹ́ nísàlẹ̀ láti tú owó wọn sílẹ̀.",
    ha: "Manomin ya nuna cewa wannan oda tana kan hanya. Da zarar ta iso kuma ka tabbatar ta dace da abin da kuka amince, tabbatar da isarwa a ƙasa don sakin kuɗinsu.",
  },
  deliveryWarnNote: {
    en: "Only tap the button below once your delivery has actually arrived and you've checked it matches what you agreed with the farmer. This releases their payment immediately.",
    ig: "Naanị pị bọtịnụ n'okpuru mgbe ihe gị ruru n'ezie ma ị lelewo na ọ dabara na ihe gị na onye ọrụ ugbo kwekọrịtara. Nke a na-ewepụta ụgwọ ha ozugbo.",
    yo: "Kàn tẹ ìdìpọ̀ nísàlẹ̀ nígbà tí ẹrù rẹ bá ti dé gan-an tí o sì ti rí i pé ó bá ohun tí ìwọ àti àgbẹ̀ náà gbà mu. Èyí máa tú owó wọn sílẹ̀ lẹ́sẹ̀kẹsẹ̀.",
    ha: "Danna maballin ƙasa ne kawai bayan kayanka sun iso da gaske kuma ka tabbatar sun dace da abin da kai da manomin kuka amince. Wannan yana sakin kuɗinsu nan take.",
  },
  releasingPayment: {
    en: "Releasing payment…",
    ig: "Na-ewepụta ụgwọ…",
    yo: "Ń tú owó sílẹ̀…",
    ha: "Ana sakin kuɗi…",
  },
  confirmDeliveryButton: {
    en: "✅ Confirm delivery & pay farmer",
    ig: "✅ Kwado nnata & kwụọ onye ọrụ ugbo ụgwọ",
    yo: "✅ Jẹ́rìí ìfìjíṣẹ́ & san owó fún àgbẹ̀",
    ha: "✅ Tabbatar da isarwa & biya manomi",
  },
  deliveryConfirmedTitle: {
    en: "Delivery confirmed",
    ig: "Akwadola Nnata",
    yo: "A Ti Jẹ́rìí Ìfìjíṣẹ́",
    ha: "An Tabbatar Da Isarwa",
  },
  farmerPaidNotePart1: {
    en: "The farmer has been paid",
    ig: "Akwụọla onye ọrụ ugbo",
    yo: "A ti san owó fún àgbẹ̀",
    ha: "An biya manomi",
  },
  farmerPaidNotePart2: {
    en: "Thanks for using AgriLink.",
    ig: "Daalụ maka iji AgriLink.",
    yo: "Ẹ ṣé fún lílo AgriLink.",
    ha: "Na gode da amfani da AgriLink.",
  },

  // Product detail page
  sampleListingBadge: {
    en: "Sample listing — connect Supabase to browse and buy real produce.",
    ig: "Ihe nlele — jikọọ Supabase iji hụ ma zụta ezi ngwaahịa.",
    yo: "Àpẹẹrẹ ohun tí à ń tà — so Supabase pọ̀ láti wo tí o sì rà ẹrù gidi.",
    ha: "Samfurin kaya — haɗa Supabase don duba da siyan kaya na gaske.",
  },
  messageFarmerBtn: { en: "Message Farmer", ig: "Ziga Onye Ọrụ Ugbo Ozi", yo: "Fi Ránṣẹ́ Sí Àgbẹ̀", ha: "Aika Saƙo Ga Manomi" },
  quantityAvailable: { en: "available", ig: "dị", yo: "wà", ha: "akwai" },
  stateWord: { en: "State", ig: "Steeti", yo: "Ìpínlẹ̀", ha: "Jiha" },
  listedBy: { en: "Listed by", ig: "Onye depụtara ya:", yo: "Ẹni tí ó tà á:", ha: "Wanda ya jera:" },
  howMany: { en: "How many", ig: "Ole", yo: "Iye mélòó", ha: "Nawa" },
  perUnit: { en: "per", ig: "kwa", yo: "fún", ha: "kowace" },
  listedPricePart1: { en: "Listed price:", ig: "Ọnụ ahịa e depụtara:", yo: "Iye owó tí a tà á sí:", ha: "Farashin da aka jera:" },
  listedPricePart2: {
    en: "Adjust to the price you and the farmer agreed on.",
    ig: "Gbanwee ya ka ọ dabara na ọnụ ahịa gị na onye ọrụ ugbo kwekọrịtara.",
    yo: "Ṣàtúnṣe rẹ̀ sí iye owó tí ìwọ àti àgbẹ̀ gbà mu.",
    ha: "Daidaita zuwa farashin da kai da manomin kuka amince.",
  },
  goodsTotalLabel: { en: "Goods total", ig: "Mkpokọta Ngwaahịa", yo: "Àpapọ̀ Ẹrù", ha: "Jimlar Kaya" },
  deliveryStateLabel: { en: "delivery state", ig: "steeti nnata", yo: "ìpínlẹ̀ ìfìjíṣẹ́", ha: "jihar isarwa" },
  approxDistanceFrom: { en: "km from", ig: "km site na", yo: "km láti", ha: "km daga" },
  coldChain: { en: "cold chain", ig: "oyi na-edobe", yo: "ọ̀nà ìtura", ha: "sanyi mai kiyayewa" },
  etaApprox: { en: "ETA ≈", ig: "Oge Nchere ≈", yo: "Àkókò Dídé ≈", ha: "Lokacin Isa ≈" },
  hrsLabel: { en: "hrs", ig: "hr", yo: "wákàtí", ha: "awa" },
  goodsLabel: { en: "Goods", ig: "Ngwaahịa", yo: "Ẹrù", ha: "Kaya" },
  totalLabel: { en: "Total", ig: "Mkpokọta", yo: "Àpapọ̀", ha: "Jimla" },
  yourEmailLabel: { en: "Your email", ig: "Email gị", yo: "Ímeèlì rẹ", ha: "Imel ɗinka" },
  startingPayment: { en: "Starting payment…", ig: "Na-amalite ịkwụ ụgwọ…", yo: "Ń bẹ̀rẹ̀ owó sísanwó…", ha: "Ana fara biya…" },
  interestedStart: {
    en: "Interested in this harvest? Start by agreeing a price with the farmer.",
    ig: "Ị masịrị ihe ubi a? Malite site n'ikwekọrịta ọnụ ahịa na onye ọrụ ugbo.",
    yo: "O nífẹ̀ẹ́ sí ọ̀gbìn yìí? Bẹ̀rẹ̀ nípa fífohùn síi lórí owó pẹ̀lú àgbẹ̀.",
    ha: "Kana sha'awar wannan amfanin gona? Fara ta hanyar amincewa da farashi da manomi.",
  },
  demoWarnPay: {
    en: "This is a sample listing — connect Supabase so real listings and orders can be created.",
    ig: "Nke a bụ ihe nlele — jikọọ Supabase ka e nwee ike ịmepụta ezi ihe na ntinye.",
    yo: "Àpẹẹrẹ ni èyí — so Supabase pọ̀ kí a lè dá àwọn ohun gidi àti ọ̀rọ̀ sílẹ̀.",
    ha: "Wannan samfuri ne kawai — haɗa Supabase don a iya ƙirƙirar kaya da oda na gaske.",
  },
  paystackPreviewPay: {
    en: "Payment isn't wired up in this preview — add your Paystack keys in .env.local to go live.",
    ig: "Ịkwụ ụgwọ ejikọtabeghị na ngosi a — tinye igodo Paystack gị na .env.local ka ọ dị ndụ.",
    yo: "A kò tí ì ṣètò owó sísanwó nínú àpẹẹrẹ yìí — fi kọ́kọ́rọ́ Paystack rẹ sí .env.local kí ó lè ṣiṣẹ́ ní gidi.",
    ha: "Ba a haɗa biya a wannan gwaji ba — ƙara mabuɗan Paystack a .env.local don fara aiki na gaske.",
  },
  enterEmailError: {
    en: "Enter an email to receive your payment receipt.",
    ig: "Tinye email ka ị nata akwụkwọ ígbàanya ụgwọ gị.",
    yo: "Tẹ ímeèlì kan sí i láti gba ẹ̀rí owó rẹ.",
    ha: "Shigar da imel don karɓar rasidin biyanka.",
  },

  // Farmer upload page
  checkingAccount: { en: "Checking your account…", ig: "Na-elele akaụntụ gị…", yo: "Ń ṣàyẹ̀wò àkọọ́lẹ̀ rẹ…", ha: "Ana duba asusunka…" },
  accountCheckFailedTitle: {
    en: "Couldn't check your account",
    ig: "Enweghị ike ilele akaụntụ gị",
    yo: "A kò lè ṣàyẹ̀wò àkọọ́lẹ̀ rẹ",
    ha: "Ba a iya duba asusunka ba",
  },
  accountCheckFailedBody1: {
    en: "This usually means Supabase isn't reachable right now — check your internet connection, or that",
    ig: "Nke a na-egosikarị na enweghị ike iru Supabase ugbu a — lelee njikọ ịntanetị gị, ma ọ bụ na",
    yo: "Èyí sábà máa ń túmọ̀ sí pé a kò lè dé Supabase báyìí — ṣàyẹ̀wò ìsopọ̀ ayélujára rẹ, tàbí pé",
    ha: "Wannan yakan nuna Supabase ba a iya isa gare shi yanzu ba — duba haɗin intanet ɗinka, ko cewa",
  },
  accountCheckFailedBody2: { en: "in", ig: "na", yo: "nínú", ha: "a cikin" },
  accountCheckFailedBody3: { en: "is correct.", ig: "ziri ezi.", yo: "tọ́.", ha: "daidai ne." },
  tryAgain: { en: "Try again", ig: "Nwaa ọzọ", yo: "Gbìyànjú Lẹ́ẹ̀kansí", ha: "Sake gwadawa" },
  loginToListTitle: {
    en: "Log in to list your harvest",
    ig: "Banye ka ị depụta ihe ubi gị",
    yo: "Wọlé láti tà ọ̀gbìn rẹ",
    ha: "Shiga don jera amfanin gonarka",
  },
  needFarmerAccount: {
    en: "You'll need a farmer account to upload produce for sale.",
    ig: "Ị ga-achọ akaụntụ onye ọrụ ugbo iji bugote ngwaahịa maka ire.",
    yo: "Ìwọ yóò nílò àkọọ́lẹ̀ àgbẹ̀ láti fi ẹrù sí ayélujára fún títà.",
    ha: "Za ka bukaci asusun manomi don loda kaya don sayarwa.",
  },
  newHere: { en: "New here?", ig: "Ị bụ ọhụrụ ebe a?", yo: "Ṣé ìwọ jẹ́ tuntun níbí?", ha: "Sabo ne a nan?" },
  createFarmerAccount: {
    en: "Create a farmer account",
    ig: "Mepụta akaụntụ onye ọrụ ugbo",
    yo: "Dá àkọọ́lẹ̀ àgbẹ̀ sílẹ̀",
    ha: "Ƙirƙiri asusun manomi",
  },
  farmerOnlyTitle: { en: "Farmer accounts only", ig: "Naanị Akaụntụ Ndị Ọrụ Ugbo", yo: "Àkọọ́lẹ̀ Àgbẹ̀ Nìkan", ha: "Asusun Manoma Kawai" },
  farmerOnlyBody: {
    en: "Your account is set up as a buyer or transporter, so it can't list produce for sale.",
    ig: "A haziri akaụntụ gị dị ka onye na-azụ ahịa ma ọ bụ onye na-ebufe ahịa, ya mere ọ nweghị ike depụta ngwaahịa maka ire.",
    yo: "A ti ṣètò àkọọ́lẹ̀ rẹ gẹ́gẹ́ bí oníbàárà tàbí awakọ̀, nítorí náà kò lè tà ẹrù.",
    ha: "An kafa asusunka a matsayin mai saye ko mai jigilar kaya, don haka ba zai iya jera kaya don sayarwa ba.",
  },
  harvestLiveTitle: { en: "Your harvest is live!", ig: "Ihe Ubi Gị Adịla Ndụ!", yo: "Ọ̀gbìn Rẹ Ti Wà Lórí Ayélujára!", ha: "Amfanin Gonarka Yana Kan Layi!" },
  buyersCanSeePart1: { en: "Buyers can now see", ig: "Ndị na-azụ ahịa nwere ike ịhụ ugbu a", yo: "Àwọn oníbàárà lè rí ní báyìí", ha: "Masu saye za su iya gani yanzu" },
  buyersCanSeePart2: { en: "on the marketplace.", ig: "n'ahịa.", yo: "ní ọjà.", ha: "a kasuwa." },
  yourHarvestFallback: { en: "your harvest", ig: "ihe ubi gị", yo: "ọ̀gbìn rẹ", ha: "amfanin gonarka" },
  goToListings: { en: "Go to my listings", ig: "Gaa n'ihe m na-ere", yo: "Lọ sí àwọn ohun tí mo ń tà", ha: "Je zuwa kayayyakina" },
  uploadDetailsSub: {
    en: "Fill in a few simple details — it only takes a minute.",
    ig: "Dejupụta ntakịrị nkọwa — ọ na-ewe naanị otu nkeji.",
    yo: "Fi àwọn kúnrẹ́rẹ́ ìsàlẹ̀ sí i — ìṣẹ́jú kan péré ni yóò gbà.",
    ha: "Cika ƴan bayanai kaɗan — daƙiƙa ɗaya kawai zai ɗauka.",
  },
  uploadingPhoto: { en: "Uploading photo…", ig: "Na-ebugote foto…", yo: "Ń fi fọ́tò sí ayélujára…", ha: "Ana loda hoto…" },
  photoUploaded: { en: "Photo uploaded ✓", ig: "Ebugotela Foto ✓", yo: "Fọ́tò Ti Wọlé ✓", ha: "An Loda Hoto ✓" },
  uploadFailedNote: {
    en: "Couldn't upload — add your Cloudinary keys in .env.local to enable this in production.",
    ig: "Ebugoteghị ya — tinye igodo Cloudinary gị na .env.local ka nke a rụọ ọrụ n'ezie.",
    yo: "A kò lè fi sí ayélujára — fi kọ́kọ́rọ́ Cloudinary rẹ sí .env.local kí èyí lè ṣiṣẹ́ ní gidi.",
    ha: "Ba a iya lodawa ba — ƙara mabuɗan Cloudinary a .env.local don kunna wannan a aikace.",
  },
  soldPer: { en: "Sold per", ig: "A na-ere ya kwa", yo: "A ń tà á fún", ha: "Ana sayarwa kowace" },
  publishing: { en: "Publishing…", ig: "Na-ebipụta…", yo: "Ń tẹ̀ ẹ jáde…", ha: "Ana wallafawa…" },

  // Homepage
  farmToBuyerBadge: { en: "Farm → Buyer → Delivered", ig: "Ugbo → Onye Na-azụ → Ebutere", yo: "Oko → Oníbàárà → Fífìjíṣẹ́", ha: "Gona → Mai Saye → An Kai" },
  howSaleMoves: { en: "How a sale moves", ig: "Otu Ire Si Aga", yo: "Bí Títà Ṣe Ń Lọ", ha: "Yadda Sayarwa Take Gudana" },
  journey1Title: { en: "Farmer lists harvest", ig: "Onye Ọrụ Ugbo Na-etinye Ihe Ubi", yo: "Àgbẹ̀ Ń Tà Ọ̀gbìn", ha: "Manomi Ya Jera Amfanin Gona" },
  journey1Body: { en: "Snap a photo, set a price, done in under a minute.", ig: "See foto, tọọ ọnụ ahịa, emechaa n'okpuru otu nkeji.", yo: "Ya fọ́tò, tọ́ owó, parí ní ìsàlẹ̀ ìṣẹ́jú kan.", ha: "Ɗauki hoto, saita farashi, ya ƙare a ƙasa da minti ɗaya." },
  journey2Title: { en: "Buyer agrees a price", ig: "Onye Na-azụ Ahịa Ekwenye Ọnụ Ahịa", yo: "Oníbàárà Fohùn Síi Lórí Owó", ha: "Mai Saye Ya Amince Da Farashi" },
  journey2Body: { en: "Real buyers browse by category and message farmers directly.", ig: "Ezi ndị na-azụ ahịa na-achọgharị site n'ụdị ma ziga ndị ọrụ ugbo ozi ozugbo.", yo: "Àwọn oníbàárà gidi ń wo ẹ̀ka wọn wọ́n sì ń fi ránṣẹ́ sí àwọn àgbẹ̀ tààrà.", ha: "Masu saye na gaske suna bincike ta rukuni suna kuma aika saƙo ga manoma kai tsaye." },
  journey3Title: { en: "Transport is arranged", ig: "Ahazila Ụgbọ Mbufe", yo: "A Ti Ṣètò Ọkọ̀ Ìrìnnà", ha: "An Shirya Sufuri" },
  journey3Body: { en: "We suggest the right vehicle for the crop and the distance.", ig: "Anyị na-atụ aro ụgbọala kwesịrị ekwesị maka ihe ọkụkụ na anya.", yo: "A máa ń dábàá ọkọ̀ tí ó tọ́ fún ọ̀gbìn àti ìjìnnà náà.", ha: "Muna ba da shawarar motar da ta dace da amfanin gona da nisan." },
  journey4Title: { en: "Payment is held safe", ig: "A Na-echekwa Ụgwọ N'enweghị Nsogbu", yo: "Owó Ni A Ó Tọ́jú Láìséwu", ha: "Ana Ajiye Kuɗi Lafiya" },
  journey4Body: { en: "Paystack holds the funds until the buyer confirms delivery.", ig: "Paystack na-echekwa ego ahụ ruo mgbe onye na-azụ ahịa kwadoro nnata.", yo: "Paystack yóò tọ́jú owó náà títí oníbàárà yóò fi jẹ́rìí ìfìjíṣẹ́.", ha: "Paystack yana riƙe kuɗin har sai mai saye ya tabbatar da isarwa." },
  categoriesSubHome: {
    en: "Everything sold on AgriLink fits one of these.",
    ig: "Ihe niile e na-ere na AgriLink dabara n'otu n'ime ndị a.",
    yo: "Ohun gbogbo tí a tà lórí AgriLink bá ọ̀kan lára àwọn wọ̀nyí mu.",
    ha: "Duk abin da ake sayarwa akan AgriLink ya dace da ɗayan waɗannan.",
  },
  viewAll: { en: "View all →", ig: "Lee Ihe Niile →", yo: "Wo Gbogbo →", ha: "Duba Duka →" },
  rightTransportTitle: { en: "Right transport, every time", ig: "Ụgbọ Mbufe Kwesịrị Ekwesị, Oge Niile", yo: "Ọkọ̀ Ìrìnnà Tí Ó Tọ́, Nígbà Gbogbo", ha: "Sufuri Da Ya Dace, Kowane Lokaci" },
  rightTransportBody: {
    en: "We match cold vans to perishables and trucks to bulk grain automatically.",
    ig: "Anyị na-eji ụgbọala oyi eme ihe maka ihe na-ebu ozi ngwa ngwa na gwongworo maka ọka buru ibu na akpaghị aka.",
    yo: "A máa ń fi ọkọ̀ tútù fún àwọn ohun tí ń bàjẹ́ àti ọkọ̀ ẹrù fún hóró púpọ̀ láìfọwọ́sowọ́pọ̀.",
    ha: "Muna daidaita motocin sanyi da kayan lalacewa da manyan motoci da hatsi masu yawa ta atomatik.",
  },
  builtForEveryFarmerTitle: { en: "Built for every farmer", ig: "Emere Maka Onye Ọrụ Ugbo Ọ Bụla", yo: "A Kọ́ Ọ Fún Àgbẹ̀ Gbogbo", ha: "An Gina Wa Kowane Manomi" },
  builtForEveryFarmerBody: {
    en: "Available in English, Igbo, Yoruba and Hausa — with a simple, uncluttered screen.",
    ig: "Dị na Bekee, Igbo, Yoruba na Hausa — nwere ihuenyo dị mfe, na-adịghị mgbagwoju anya.",
    yo: "Wà ní Gẹ̀ẹ́sì, Igbo, Yorùbá àti Hausa — pẹ̀lú ojú-ìwé tí ó rọrùn, tí kò dàrú.",
    ha: "Ana samu a Turanci, Igbo, Yoruba da Hausa — tare da fuska mai sauƙi, marar cikakkiya.",
  },
  footerText: {
    en: "© 2026 AgriLink. Farm to buyer, made simple.",
    ig: "© 2026 AgriLink. Ugbo ruo onye na-azụ, mere mfe.",
    yo: "© 2026 AgriLink. Oko sí oníbàárà, tí a rọrùn.",
    ha: "© 2026 AgriLink. Gona zuwa mai saye, an sauƙaƙe.",
  },

  // How it works page
  howItWorksSub: {
    en: "Four simple steps, from your farm to a buyer's warehouse.",
    ig: "Usoro anọ dị mfe, site n'ugbo gị ruo n'ụlọ ngwaahịa onye na-azụ ahịa.",
    yo: "Ìgbésẹ̀ mẹ́rin tí ó rọrùn, láti oko rẹ dé ilé ìtọ́jú ẹrù oníbàárà.",
    ha: "Matakai huɗu masu sauƙi, daga gonarka zuwa rumbun mai saye.",
  },
  step1Title: { en: "1. List your harvest", ig: "1. Depụta Ihe Ubi Gị", yo: "1. Tà Ọ̀gbìn Rẹ", ha: "1. Jera Amfanin Gonarka" },
  step1Body: {
    en: "Take a photo, choose a category, set your price. Done in under a minute.",
    ig: "See foto, họrọ ụdị, tọọ ọnụ ahịa gị. Emechaa n'okpuru otu nkeji.",
    yo: "Ya fọ́tò, yan ẹ̀ka, tọ́ owó rẹ. Parí ní ìsàlẹ̀ ìṣẹ́jú kan.",
    ha: "Ɗauki hoto, zaɓi rukuni, saita farashinka. Ya ƙare a ƙasa da minti ɗaya.",
  },
  step2Title: { en: "2. Talk to a buyer", ig: "2. Gwa Onye Na-azụ Ahịa Okwu", yo: "2. Bá Oníbàárà Sọ̀rọ̀", ha: "2. Yi Magana Da Mai Saye" },
  step2Body: {
    en: "Buyers message you directly. Agree on a price you're both happy with.",
    ig: "Ndị na-azụ ahịa na-ezigara gị ozi ozugbo. Kwekọrịtaa ọnụ ahịa unu abụọ nwere obi ụtọ.",
    yo: "Àwọn oníbàárà máa ń fi ránṣẹ́ sí ọ tààrà. Fohùn síi lórí owó tí ẹ̀yin méjèèjì fẹ́.",
    ha: "Masu saye suna aika maka saƙo kai tsaye. Ku amince a kan farashin da ku biyu ku ke so.",
  },
  step3Title: { en: "3. Pick a ride for the goods", ig: "3. Họrọ Ụgbọala Maka Ngwaahịa", yo: "3. Yan Ọkọ̀ Fún Ẹrù Náà", ha: "3. Zaɓi Mota Don Kaya" },
  step3Body: {
    en: "AgriLink suggests the right vehicle — cold van for perishables, truck for bulk grain.",
    ig: "AgriLink na-atụ aro ụgbọala kwesịrị ekwesị — ụgbọala oyi maka ihe na-ebu ozi ngwa ngwa, gwongworo maka ọka buru ibu.",
    yo: "AgriLink máa ń dábàá ọkọ̀ tí ó tọ́ — ọkọ̀ tútù fún àwọn ohun tí ń bàjẹ́, ọkọ̀ ẹrù fún hóró púpọ̀.",
    ha: "AgriLink tana ba da shawarar motar da ta dace — motar sanyi don kayan lalacewa, babbar mota don hatsi mai yawa.",
  },
  step4Title: { en: "4. Get paid safely", ig: "4. Nata Ụgwọ N'enweghị Nsogbu", yo: "4. Gba Owó Láìséwu", ha: "4. Karɓi Kuɗi Lafiya" },
  step4Body: {
    en: "The buyer's money is held by Paystack, a licensed payment company — not by AgriLink. You get paid once the buyer confirms the goods arrived.",
    ig: "Paystack, ụlọ ọrụ ịkwụ ụgwọ nwere ikike, na-echekwa ego onye na-azụ ahịa — ọ bụghị AgriLink. Ị na-anata ụgwọ ozugbo onye na-azụ ahịa kwadoro na ngwaahịa eruola.",
    yo: "Paystack, ilé iṣẹ́ owó sísanwó tí ó ní ìwé àṣẹ, ni ó ń tọ́jú owó oníbàárà — kì í ṣe AgriLink. Ìwọ yóò gba owó ní kété tí oníbàárà bá jẹ́rìí pé ẹrù ti dé.",
    ha: "Paystack, kamfanin biya mai lasisi, ne ke riƙe kuɗin mai saye — ba AgriLink ba. Za a biya ka da zarar mai saye ya tabbatar kayan sun iso.",
  },

  // Order confirm — tracking timeline
  trackPaidSecured: { en: "Paid & secured", ig: "Akwụọla & Echekwara", yo: "San & Dáàbò Bò", ha: "An Biya & An Tsare" },
  trackOnTheWay: { en: "On the way", ig: "Ọ na-abịa", yo: "Ó Ń Bọ̀", ha: "A Kan Hanya" },
  trackDelivered: { en: "Delivered", ig: "Ebutere", yo: "A Ti Fi Jíṣẹ́", ha: "An Kai" },

  // Navbar
  messagesNav: { en: "Messages", ig: "Ozi", yo: "Ìránṣẹ́", ha: "Saƙonni" },

  // ChatBox
  loadingChat: { en: "Loading chat...", ig: "Na-ebu mkparịta ụka…", yo: "Ń kó ìjíròrò jọ…", ha: "Ana loda tattaunawa…" },
  noMessagesYet: { en: "No messages yet. Say hi!", ig: "Enweghị ozi ka. Kwuo nnọọ!", yo: "Kò sí ìránṣẹ́ síbẹ̀. Kí sí i!", ha: "Babu saƙo tukuna. Ka gaisa!" },
  typeMessagePlaceholder: { en: "Type a message...", ig: "Pịnye ozi…", yo: "Tẹ ìránṣẹ́ kan…", ha: "Rubuta saƙo…" },
  sendBtn: { en: "Send", ig: "Zipu", yo: "Fi Ránṣẹ́", ha: "Aika" },

  // AuthNav
  myOrders: { en: "My Orders", ig: "Ntinye M Niile", yo: "Àwọn Ọ̀rọ̀ Mi", ha: "Odarina" },
  accountSuffix: { en: "account", ig: "akaụntụ", yo: "àkọọ́lẹ̀", ha: "asusu" },
  payoutSettings: { en: "Payout settings", ig: "Ntọala Ịkwụ Ụgwọ", yo: "Ètò Owó Sísanwó", ha: "Saitin Biya" },
  signOut: { en: "Sign out", ig: "Pụọ", yo: "Jáde", ha: "Fita" },
  farmer: { en: "Farmer", ig: "Onye Ọrụ Ugbo", yo: "Àgbẹ̀", ha: "Manomi" },
  buyer: { en: "Buyer", ig: "Onye Na-azụ Ahịa", yo: "Oníbàárà", ha: "Mai Saye" },
  transporter: { en: "Transporter", ig: "Onye Mbufe", yo: "Awakọ̀", ha: "Mai Sufuri" },

  // LoginForm
  welcomeBack: { en: "Welcome back", ig: "Nnọọ Ọzọ", yo: "Ẹ Kú Àbọ̀", ha: "Barka Da Dawowa" },
  loginSub: {
    en: "Log in to your AgriLink account.",
    ig: "Banye n'akaụntụ AgriLink gị.",
    yo: "Wọlé sí àkọọ́lẹ̀ AgriLink rẹ.",
    ha: "Shiga asusun AgriLink ɗinka.",
  },
  emailLabel: { en: "Email", ig: "Email", yo: "Ímeèlì", ha: "Imel" },
  passwordLabel: { en: "Password", ig: "Paswọọdụ", yo: "Ọ̀rọ̀ Ìgbaniwọlé", ha: "Kalmar Sirri" },
  hidePassword: { en: "Hide password", ig: "Zoo Paswọọdụ", yo: "Fi Ọ̀rọ̀ Ìgbaniwọlé Pamọ́", ha: "Ɓoye Kalmar Sirri" },
  showPassword: { en: "Show password", ig: "Gosi Paswọọdụ", yo: "Fi Ọ̀rọ̀ Ìgbaniwọlé Hàn", ha: "Nuna Kalmar Sirri" },
  hide: { en: "Hide", ig: "Zoo", yo: "Fi Pamọ́", ha: "Ɓoye" },
  show: { en: "Show", ig: "Gosi", yo: "Fi Hàn", ha: "Nuna" },
  loggingIn: { en: "Logging in…", ig: "Na-abanye…", yo: "Ń wọlé…", ha: "Ana shiga…" },
  newToAgriLink: { en: "New to AgriLink?", ig: "Ị bụ ọhụrụ na AgriLink?", yo: "Ṣé ìwọ jẹ́ tuntun sí AgriLink?", ha: "Sabo ne ga AgriLink?" },
  createAccount: { en: "Create an account", ig: "Mepụta akaụntụ", yo: "Dá àkọọ́lẹ̀ sílẹ̀", ha: "Ƙirƙiri asusu" },

  // SignupForm
  chooseRoleError: {
    en: "Choose whether you're a farmer, buyer, or transporter.",
    ig: "Họrọ ma ị bụ onye ọrụ ugbo, onye na-azụ ahịa, ma ọ bụ onye mbufe.",
    yo: "Yan bóyá ìwọ jẹ́ àgbẹ̀, oníbàárà, tàbí awakọ̀.",
    ha: "Zaɓi ko kai manomi ne, mai saye, ko mai sufuri.",
  },
  roleBlurbFarmer: { en: "I want to sell my harvest", ig: "Achọrọ m ire ihe ubi m", yo: "Mo fẹ́ tà ọ̀gbìn mi", ha: "Ina son sayar da amfanin gonata" },
  roleBlurbBuyer: { en: "I want to buy produce", ig: "Achọrọ m ịzụ ngwaahịa", yo: "Mo fẹ́ ra ẹrù", ha: "Ina son sayan kaya" },
  roleBlurbTransporter: { en: "I move goods for AgriLink", ig: "Ana m ebufe ngwaahịa maka AgriLink", yo: "Mo ń gbé ẹrù fún AgriLink", ha: "Ina kai kaya don AgriLink" },
  checkYourEmail: { en: "Check your email", ig: "Lelee Email Gị", yo: "Ṣàyẹ̀wò Ímeèlì Rẹ", ha: "Duba Imel Ɗinka" },
  confirmationSentPart1: {
    en: "We sent a confirmation link to",
    ig: "Anyị ezigala njikọ nkwenye na",
    yo: "A ti fi ìjápọ̀ ìjẹ́rìísí ránṣẹ́ sí",
    ha: "Mun aika hanyar haɗi na tabbatarwa zuwa",
  },
  confirmationSentPart2: {
    en: "Tap it to finish setting up your account.",
    ig: "Pị ya iji mechaa ntọala akaụntụ gị.",
    yo: "Tẹ ẹ́ láti parí ìṣètò àkọọ́lẹ̀ rẹ.",
    ha: "Danna shi don kammala saita asusunka.",
  },
  createYourAccount: { en: "Create your account", ig: "Mepụta Akaụntụ Gị", yo: "Dá Àkọọ́lẹ̀ Rẹ Sílẹ̀", ha: "Ƙirƙiri Asusunka" },
  takesAMinute: { en: "It only takes a minute.", ig: "Ọ na-ewe naanị otu nkeji.", yo: "Ìṣẹ́jú kan péré ni yóò gbà.", ha: "Daƙiƙa ɗaya kawai zai ɗauka." },
  iAmA: { en: "I am a…", ig: "Abụ m…", yo: "Èmi jẹ́…", ha: "Ni ne…" },
  fullNameLabel: { en: "Full name", ig: "Aha Zuru Ezu", yo: "Orúkọ Kíkún", ha: "Cikakken Suna" },
  phoneOptionalLabel: { en: "Phone (optional)", ig: "Ekwentị (nhọrọ)", yo: "Fóònù (yíyàn)", ha: "Waya (na zaɓi)" },
  creatingAccount: { en: "Creating account…", ig: "Na-emepụta akaụntụ…", yo: "Ń dá àkọọ́lẹ̀…", ha: "Ana ƙirƙirar asusu…" },
  createAccountBtn: { en: "Create account", ig: "Mepụta Akaụntụ", yo: "Dá Àkọọ́lẹ̀", ha: "Ƙirƙiri Asusu" },
  alreadyHaveAccount: { en: "Already have an account?", ig: "Ị nweelarị akaụntụ?", yo: "Ṣé o ti ní àkọọ́lẹ̀ tẹ́lẹ̀?", ha: "Kana da asusu tuni?" },

  // Farmer settings page
  chooseBankAndAccountError: {
    en: "Choose a bank and enter your account number.",
    ig: "Họrọ ụlọ akụ ma tinye nọmba akaụntụ gị.",
    yo: "Yan báńkì kí o sì tẹ nọ́mbà àkọọ́lẹ̀ rẹ sí i.",
    ha: "Zaɓi banki ka kuma shigar da lambar asusunka.",
  },
  savedPayoutsPart1: { en: "Saved — payouts will go to", ig: "Echekwara — a ga-ezigara ụgwọ na", yo: "Ti fi pamọ́ — owó yóò lọ sí", ha: "An ajiye — biya zai je zuwa" },
  logInFirst: { en: "Log in first", ig: "Banye Buuru Ụzọ", yo: "Kọ́kọ́ Wọlé", ha: "Fara Shiga" },
  payoutDetailsTitle: { en: "Payout details", ig: "Nkọwa Ịkwụ Ụgwọ", yo: "Kúnrẹ́rẹ́ Owó Sísanwó", ha: "Bayanan Biya" },
  payoutDetailsSub: {
    en: "Add your bank account so AgriLink can pay you once a buyer confirms delivery.",
    ig: "Tinye akaụntụ ụlọ akụ gị ka AgriLink wee kwụọ gị ụgwọ ozugbo onye na-azụ ahịa kwadoro nnata.",
    yo: "Fi àkọọ́lẹ̀ báńkì rẹ sí i kí AgriLink lè san owó fún ọ ní kété tí oníbàárà bá jẹ́rìí ìfìjíṣẹ́.",
    ha: "Ƙara asusun bankinka don AgriLink ta iya biyan ka da zarar mai saye ya tabbatar da isarwa.",
  },
  bankDetailsOnFile: {
    en: "✓ Bank details already on file. Submitting the form below will replace them.",
    ig: "✓ Nkọwa ụlọ akụ dịla na ndekọ. Izipu fọm n'okpuru ga-adochi ha.",
    yo: "✓ Kúnrẹ́rẹ́ báńkì ti wà tẹ́lẹ̀. Fífi fọ́ọ̀mù nísàlẹ̀ ránṣẹ́ yóò rọ́pò wọn.",
    ha: "✓ Bayanan banki suna nan tuni. Aika fom da ke ƙasa zai maye gurbinsu.",
  },
  bankLabel: { en: "Bank", ig: "Ụlọ Akụ", yo: "Báńkì", ha: "Banki" },
  chooseYourBank: { en: "Choose your bank", ig: "Họrọ Ụlọ Akụ Gị", yo: "Yan Báńkì Rẹ", ha: "Zaɓi Bankinka" },
  loadingBanks: { en: "Loading banks…", ig: "Na-ebu ụlọ akụ…", yo: "Ń kó àwọn báńkì jọ…", ha: "Ana loda bankuna…" },
  accountNumberLabel: { en: "Account number", ig: "Nọmba Akaụntụ", yo: "Nọ́mbà Àkọọ́lẹ̀", ha: "Lambar Asusu" },
  verifyingAccount: { en: "Verifying account…", ig: "Na-akwado akaụntụ…", yo: "Ń jẹ́rìísí àkọọ́lẹ̀…", ha: "Ana tabbatar da asusu…" },
  saveBankDetails: { en: "Save bank details", ig: "Chekwaa Nkọwa Ụlọ Akụ", yo: "Fi Kúnrẹ́rẹ́ Báńkì Pamọ́", ha: "Ajiye Bayanan Banki" },

  // Messages pages (buyer & farmer)
  loadingMessages: { en: "Loading messages...", ig: "Na-ebu ozi…", yo: "Ń kó àwọn ìránṣẹ́ jọ…", ha: "Ana loda saƙonni…" },
  loginToViewMessages: { en: "Log in to view messages", ig: "Banye ka ị hụ ozi", yo: "Wọlé láti rí àwọn ìránṣẹ́", ha: "Shiga don ganin saƙonni" },
  myMessages: { en: "My Messages", ig: "Ozi M", yo: "Àwọn Ìránṣẹ́ Mi", ha: "Saƙonnina" },
  noActiveConversations: { en: "You have no active conversations.", ig: "Ị nweghị mkparịta ụka na-arụ ọrụ.", yo: "O kò ní ìjíròrò tí ń lọ lọ́wọ́.", ha: "Ba ka da tattaunawa mai gudana." },
  selectConversation: { en: "Select a conversation to start chatting", ig: "Họrọ mkparịta ụka iji malite ikwu okwu", yo: "Yan ìjíròrò kan láti bẹ̀rẹ̀ ìfọ̀rọ̀wérọ̀", ha: "Zaɓi tattaunawa don fara hira" },

  // Orders pages (buyer & farmer)
  loginToSeeOrders: { en: "Log in to see your orders", ig: "Banye ka ị hụ ntinye gị niile", yo: "Wọlé láti rí àwọn ọ̀rọ̀ rẹ", ha: "Shiga don ganin ododinka" },
  trackPurchasesSub: {
    en: "Track your purchases and confirm delivery when they arrive.",
    ig: "Soro ihe ndị i zụtara ma kwado nnata mgbe ha ruru.",
    yo: "Tọ́pinpin àwọn ohun tí o rà kí o sì jẹ́rìí ìfìjíṣẹ́ nígbà tí wọ́n bá dé.",
    ha: "Bi diddigin abin da ka saya ka kuma tabbatar da isarwa idan sun iso.",
  },
  noOrdersYetBuyer: { en: "You haven't ordered anything yet.", ig: "Ị tinyebeghị ihe ọ bụla n'ime ntinye ka.", yo: "O ò tíì ra ohunkóhun síbẹ̀.", ha: "Har yanzu ba ka yi oda ba." },
  statusAwaitingPayment: { en: "Awaiting payment", ig: "Na-eche Ụgwọ", yo: "Ń Dúró De Owó", ha: "Ana Jiran Biya" },
  statusDisputed: { en: "Disputed", ig: "E Nwere Esemokwu", yo: "Ìjà Ọ̀rọ̀", ha: "Rigima" },
  statusCancelled: { en: "Cancelled", ig: "Akagbuola", yo: "A Ti Fagilé", ha: "An Soke" },
  confirmDeliveryArrow: { en: "Confirm delivery →", ig: "Kwado Nnata →", yo: "Jẹ́rìí Ìfìjíṣẹ́ →", ha: "Tabbatar Da Isarwa →" },
  farmerOrdersSub: {
    en: "Orders buyers have placed on your listings.",
    ig: "Ntinye ndị na-azụ ahịa mere n'ihe i depụtara.",
    yo: "Àwọn ọ̀rọ̀ tí àwọn oníbàárà ti fi sí àwọn ohun tí o tà.",
    ha: "Odar da masu saye suka yi akan kayanka.",
  },
  noOrdersYetFarmer: { en: "No orders yet.", ig: "Enweghị ntinye ọ bụla ka.", yo: "Kò sí ọ̀rọ̀ síbẹ̀.", ha: "Babu oda tukuna." },
  farmerStatusInEscrow: { en: "Paid — ready to ship", ig: "Akwụọla — Dịla Njikere Ibunye", yo: "A Ti San — Ó Ti Ṣetán Fún Fífijíṣẹ́", ha: "An Biya — A Shirye Don Aikawa" },
  farmerStatusShipped: { en: "Shipped", ig: "Ebunyela", yo: "A Ti Fi Jíṣẹ́", ha: "An Aika" },
  farmerStatusCompleted: { en: "Completed", ig: "Emechaala", yo: "Ti Parí", ha: "An Kammala" },
  markingShipped: { en: "Marking…", ig: "Na-akara…", yo: "Ń sàmì sí…", ha: "Ana yiwa alama…" },
  markAsShippedBtn: { en: "Mark as shipped", ig: "Kaa Ya Dị Ka Ebunyela", yo: "Sàmì Sí Gẹ́gẹ́ Bí Fífijíṣẹ́", ha: "Yiwa Alamar An Aika" },
  thenSr: { en: "then", ig: "mgbe ahụ", yo: "lẹ́yìn náà", ha: "sannan" },

  // Transporter dashboard
  transporterDashboard: { en: "Delivery Jobs", ig: "Ọrụ Mbufe", yo: "Iṣẹ́ Ìfìjíṣẹ́", ha: "Ayyukan Isarwa" },
  loginToViewJobs: { en: "Log in to view delivery jobs", ig: "Banye ka ị hụ ọrụ mbufe", yo: "Wọlé láti rí àwọn iṣẹ́ ìfìjíṣẹ́", ha: "Shiga don ganin ayyukan isarwa" },
  transporterOnlyTitle: { en: "Transporter accounts only", ig: "Naanị Akaụntụ Ndị Mbufe", yo: "Àkọọ́lẹ̀ Awakọ̀ Nìkan", ha: "Asusun Masu Sufuri Kawai" },
  transporterOnlyBody: {
    en: "Your account isn't set up as a transporter, so there are no delivery jobs to show here.",
    ig: "A haziribeghị akaụntụ gị dị ka onye mbufe, ya mere enweghị ọrụ mbufe igosi ebe a.",
    yo: "A kò ṣètò àkọọ́lẹ̀ rẹ gẹ́gẹ́ bí awakọ̀, nítorí náà kò sí iṣẹ́ ìfìjíṣẹ́ láti fi hàn níbí.",
    ha: "Ba a kafa asusunka a matsayin mai sufuri ba, don haka babu ayyukan isarwa da za a nuna a nan.",
  },
  goOnlineBtn: { en: "Go Online", ig: "Banye Ịntanetị", yo: "Wà Lórí Ayélujára", ha: "Fara Aiki" },
  goOfflineBtn: { en: "Go Offline", ig: "Pụọ Ịntanetị", yo: "Kúrò Lórí Ayélujára", ha: "Daina Aiki" },
  offlineTitle: { en: "You're offline", ig: "Ị nọ Ọfụ", yo: "O Ti Ké Kúrò", ha: "Kana Bacce" },
  offlineBody: {
    en: "Go online to start browsing and claiming delivery jobs.",
    ig: "Banye ịntanetị iji malite ịchọgharị ma kwenye ọrụ mbufe.",
    yo: "Wọlé sórí ayélujára láti bẹ̀rẹ̀ wíwá àti gbígba iṣẹ́ ìfìjíṣẹ́.",
    ha: "Fara aiki don fara bincike da karɓar ayyukan isarwa.",
  },
  deliveriesCompletedStat: { en: "Deliveries completed", ig: "Mbufe Emechara", yo: "Ìfìjíṣẹ́ Tí Ó Parí", ha: "Isarwar Da Aka Kammala" },
  totalEarnedStat: { en: "Total earned", ig: "Mkpokọta Enwetara", yo: "Àpapọ̀ Owó Tí A Rí", ha: "Jimlar Da Aka Samu" },
  availableJobsHeading: { en: "Available Jobs", ig: "Ọrụ Dị", yo: "Àwọn Iṣẹ́ Tí Ó Wà", ha: "Ayyukan Da Ke Akwai" },
  noOpenJobs: { en: "No open jobs right now — check back soon.", ig: "Enweghị ọrụ dị ugbu a — lelee ọzọ n'oge na-adịghị anya.", yo: "Kò sí iṣẹ́ tí ó ṣí sílẹ̀ báyìí — padà wá láìpẹ́.", ha: "Babu aikin da ke akwai yanzu — duba nan gaba kadan." },
  yourPickupsHeading: { en: "Your Pickups", ig: "Ndị I Kwenyere", yo: "Àwọn Tí O Gbà", ha: "Abubuwan Da Ka Karɓa" },
  noPickupsYet: { en: "You haven't claimed any jobs yet.", ig: "Ị kwenyebeghị ọrụ ọ bụla ka.", yo: "O ò tíì gba iṣẹ́ kankan síbẹ̀.", ha: "Har yanzu ba ka karɓi wani aiki ba." },
  inTransitHeading: { en: "In Transit", ig: "Na-aga N'ụzọ", yo: "Ń Bọ̀ Wá", ha: "A Kan Hanya" },
  noInTransit: { en: "Nothing in transit right now.", ig: "Enweghị ihe na-aga n'ụzọ ugbu a.", yo: "Kò sí ohunkóhun tí ń bọ̀ wá báyìí.", ha: "Babu abin da ke kan hanya yanzu." },
  completedHeading: { en: "Completed Deliveries", ig: "Mbufe Emechara", yo: "Àwọn Ìfìjíṣẹ́ Tí Ó Parí", ha: "Isarwar Da Aka Kammala" },
  noCompletedYet: { en: "No completed deliveries yet.", ig: "Enweghị mbufe emechara ka.", yo: "Kò sí ìfìjíṣẹ́ tí ó parí síbẹ̀.", ha: "Babu isarwar da aka kammala tukuna." },
  pickupLabel: { en: "Pickup", ig: "Ntinye", yo: "Ìgbà", ha: "Karɓa" },
  dropoffLabel: { en: "Drop-off", ig: "Nnata", yo: "Ìjíṣẹ́", ha: "Kaiwa" },
  kmLabel: { en: "km", ig: "km", yo: "km", ha: "km" },
  payoutLabel: { en: "Payout", ig: "Ụgwọ", yo: "Owó Sísanwó", ha: "Kuɗin Sufuri" },
  vehicleNeededLabel: { en: "Vehicle needed", ig: "Ụgbọala A Chọrọ", yo: "Ọkọ̀ Tí A Nílò", ha: "Motar Da Ake Bukata" },
  acceptJobBtn: { en: "Accept Job", ig: "Nabata Ọrụ", yo: "Gba Iṣẹ́", ha: "Karɓi Aiki" },
  claimingJob: { en: "Claiming…", ig: "Na-akwenye…", yo: "Ń gbà…", ha: "Ana karɓa…" },
  markPickedUpBtn: { en: "Mark picked up & shipped", ig: "Kaa Ya Dị Ka Ebutere & Ebunyela", yo: "Sàmì Sí Gẹ́gẹ́ Bí Gbígbà & Fífijíṣẹ́", ha: "Yiwa Alama An Karɓa & An Aika" },
  awaitingBuyerConfirm: { en: "Waiting for buyer to confirm delivery", ig: "Na-eche ka onye na-azụ ahịa kwado nnata", yo: "Ń dúró de oníbàárà láti jẹ́rìí ìfìjíṣẹ́", ha: "Ana jiran mai saye ya tabbatar da isarwa" },
  notSpecified: { en: "Not specified", ig: "Akọwapụtaghị", yo: "A Kò Sọ", ha: "Ba A Bayyana Ba" },

  // AI Assistant widget
  assistantTitle: { en: "AgriLink Assistant", ig: "Onye Enyemaka AgriLink", yo: "Olùrànlọ́wọ́ AgriLink", ha: "Mataimakin AgriLink" },
  assistantWelcome: {
    en: "Hi! I can help with questions about how AgriLink works, shopping tips, or writing a better listing. What do you need?",
    ig: "Ndewo! Enwere m ike inyere gị aka na ajụjụ gbasara otu AgriLink si arụ ọrụ, ndụmọdụ ịzụ ahịa, ma ọ bụ ide ihe ire ka mma. Gịnị ka ị chọrọ?",
    yo: "Bawo! Mo lè ràn ọ́ lọ́wọ́ pẹ̀lú àwọn ìbéèrè nípa bí AgriLink ṣe ń ṣiṣẹ́, ìmọ̀ràn ríra ọjà, tàbí kíkọ ọ̀rọ̀ tí ó tà dáradára. Kí ni o nílò?",
    ha: "Sannu! Zan iya taimaka maka da tambayoyi game da yadda AgriLink ke aiki, shawarwarin siyayya, ko rubuta jerin abu mafi kyau. Me kake bukata?",
  },
  assistantPlaceholder: { en: "Ask me anything about AgriLink…", ig: "Jụọ m ihe ọ bụla gbasara AgriLink…", yo: "Bi mi ohunkóhun nípa AgriLink…", ha: "Tambaye ni komai game da AgriLink…" },
  assistantThinking: { en: "Thinking…", ig: "Na-eche…", yo: "Ń ronú…", ha: "Ana tunani…" },
  assistantError: {
    en: "Sorry, I couldn't respond just now. Please try again.",
    ig: "Ndo, enweghị m ike ịza ugbu a. Biko nwaa ọzọ.",
    yo: "Má bínú, n kò lè dáhùn báyìí. Jọ̀wọ́ gbìyànjú lẹ́ẹ̀kansí.",
    ha: "Yi hakuri, ban iya amsawa yanzu ba. Don Allah sake gwadawa.",
  },
  openAssistant: { en: "Chat with AgriLink Assistant", ig: "Kparịta ụka na Onye Enyemaka AgriLink", yo: "Bá Olùrànlọ́wọ́ AgriLink Sọ̀rọ̀", ha: "Yi Hira Da Mataimakin AgriLink" },
  closeAssistantLabel: { en: "Close", ig: "Mechie", yo: "Ti", ha: "Rufe" },
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
