// in-memory data store for PHC Bhada National Vector Borne Disease Control Programme
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseIndianDate, formatIndianDateStr, validateDateDdMmYyyy } from './dateParser.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, 'db.json');

export const masterData = [
  {
    "upkendra": "आलमला",
    "employeeName": "श्रीमती पुनम रावसाहेब काळे",
    "designation": "आशा स्वयंसेविका (ASHA)",
    "bsCode": "54F6V3",
    "villageList": [
      "आलमला"
    ]
  },
  {
    "upkendra": "आलमला",
    "employeeName": "श्रीमती शिल्पा पुनम थोरात",
    "designation": "आशा स्वयंसेविका (ASHA)",
    "bsCode": "54F6V5",
    "villageList": [
      "उंबडगा बू"
    ]
  },
  {
    "upkendra": "आलमला",
    "employeeName": "श्रीमती राधा सुरेष पांचळ",
    "designation": "आशा स्वयंसेविका (ASHA)",
    "bsCode": "54F6V4",
    "villageList": [
      "आलमला"
    ]
  },
  {
    "upkendra": "आलमला",
    "employeeName": "श्रीमती मनोरमा प्रल्हाद सुवर्णकार",
    "designation": "आशा स्वयंसेविका (ASHA)",
    "bsCode": "54F6V2",
    "villageList": [
      "आलमला"
    ]
  },
  {
    "upkendra": "आलमला",
    "employeeName": "श्रीमती आनिता राजाराम बनसोडे",
    "designation": "आशा स्वयंसेविका (ASHA)",
    "bsCode": "54F6V6",
    "villageList": [
      "उंबडगा खू"
    ]
  },
  {
    "upkendra": "आलमला",
    "employeeName": "श्रीमती दैवशाला गोविंद शिरसाट",
    "designation": "आशा स्वयंसेविका (ASHA)",
    "bsCode": "54F6V1",
    "villageList": [
      "आलमला"
    ]
  },
  {
    "upkendra": "आलमला",
    "employeeName": "श्रीमती जावंडरे एस.डी.",
    "designation": "आरोग्य सेविका (ANM)",
    "bsCode": "54F6A",
    "villageList": [
      "आलमला",
      "आलमला तांडा",
      "उंबडगा बू",
      "उंबडगा खू"
    ]
  },
  {
    "upkendra": "आलमला",
    "employeeName": "श्री सगर आभिजीत",
    "designation": "आरोग्य सेवक (MPW)",
    "bsCode": "54S6",
    "villageList": [
      "आलमला",
      "आलमला तांडा",
      "उंबडगा बू",
      "उंबडगा खू"
    ]
  },
  {
    "upkendra": "कोरंगळा",
    "employeeName": "श्रीमती कैसल्या विष्णू ढोक",
    "designation": "आशा स्वयंसेविका (ASHA)",
    "bsCode": "54F5V4",
    "villageList": [
      "समदर्गा"
    ]
  },
  {
    "upkendra": "कोरंगळा",
    "employeeName": "श्रीमती छाया हेमाद्रीपंत काळे",
    "designation": "आशा स्वयंसेविका (ASHA)",
    "bsCode": "54F5V3",
    "villageList": [
      "समदर्गा"
    ]
  },
  {
    "upkendra": "कोरंगळा",
    "employeeName": "श्रीमती नजमुन अल्लाबक्श दरोगे",
    "designation": "आशा स्वयंसेविका (ASHA)",
    "bsCode": "54F5V1",
    "villageList": [
      "कोरंगळा"
    ]
  },
  {
    "upkendra": "कोरंगळा",
    "employeeName": "श्रीमती दुर्गा वैजीनाथ चांडसुरे",
    "designation": "आशा स्वयंसेविका (ASHA)",
    "bsCode": "54F5V5",
    "villageList": [
      "येल्लोरी"
    ]
  },
  {
    "upkendra": "कोरंगळा",
    "employeeName": "श्रीमती सविता गोपाळ रिंगनकर",
    "designation": "आशा स्वयंसेविका (ASHA)",
    "bsCode": "54F5V6",
    "villageList": [
      "येल्लोरी"
    ]
  },
  {
    "upkendra": "कोरंगळा",
    "employeeName": "श्रीमती सुनिता शहाजी घाडगे",
    "designation": "आशा स्वयंसेविका (ASHA)",
    "bsCode": "54F5V7",
    "villageList": [
      "येल्लोरी वाडी"
    ]
  },
  {
    "upkendra": "कोरंगळा",
    "employeeName": "श्रीमती मंगल हिरामन चव्हाण",
    "designation": "आशा स्वयंसेविका (ASHA)",
    "bsCode": "54F5V8",
    "villageList": [
      "औसा तांडा"
    ]
  },
  {
    "upkendra": "कोरंगळा",
    "employeeName": "श्रीमती विमल श्रीहरी जंगाले",
    "designation": "आशा स्वयंसेविका (ASHA)",
    "bsCode": "54F5V2",
    "villageList": [
      "कोरंगळा"
    ]
  },
  {
    "upkendra": "कोरंगळा",
    "employeeName": "श्रीमती नागमोडे बी.डी.",
    "designation": "आरोग्य सेविका (ANM)",
    "bsCode": "54F5A",
    "villageList": [
      "कोरंगळा",
      "औसा तांडा",
      "येल्लोरी वाडी",
      "येल्लोरी",
      "समदर्गा"
    ]
  },
  {
    "upkendra": "कोरंगळा",
    "employeeName": "श्री विश्वंभर शिंदे",
    "designation": "आरोग्य सेवक (MPW)",
    "bsCode": "54S5",
    "villageList": [
      "कोरंगळा",
      "औसा तांडा",
      "येल्लोरी वाडी",
      "येल्लोरी",
      "समदर्गा"
    ]
  },
  {
    "upkendra": "बोरगाव",
    "employeeName": "श्रीमती सारीका बब्रुवान गजनेत्री",
    "designation": "आशा स्वयंसेविका (ASHA)",
    "bsCode": "54F2V3",
    "villageList": [
      "काळमाथा"
    ]
  },
  {
    "upkendra": "बोरगाव",
    "employeeName": "श्रीमती ललिता बालाजी साळुंके",
    "designation": "आशा स्वयंसेविका (ASHA)",
    "bsCode": "54F2V2",
    "villageList": [
      "बोरगांव"
    ]
  },
  {
    "upkendra": "बोरगाव",
    "employeeName": "श्रीमती उमा दयानंद डामगीरे",
    "designation": "आशा स्वयंसेविका (ASHA)",
    "bsCode": "54F2V1",
    "villageList": [
      "बोरगांव"
    ]
  },
  {
    "upkendra": "बोरगाव",
    "employeeName": "श्रीमती तस्लीम सय्यद फकीर",
    "designation": "आशा स्वयंसेविका (ASHA)",
    "bsCode": "54F2V3",
    "villageList": [
      "काळमाथा"
    ]
  },
  {
    "upkendra": "बोरगाव",
    "employeeName": "श्रीमती आर्चना दगडु गोरे",
    "designation": "आशा स्वयंसेविका (ASHA)",
    "bsCode": "54F2V5",
    "villageList": [
      "कवठा",
      "कवठा तांडा"
    ]
  },
  {
    "upkendra": "बोरगाव",
    "employeeName": "श्रीमती वंदना तीर्थोबा कांबळे",
    "designation": "आरोग्य सेविका (ANM)",
    "bsCode": "54F2",
    "villageList": [
      "बोरगांव",
      "कवठा",
      "कवठा तांडा",
      "काळमाथा"
    ]
  },
  {
    "upkendra": "बोरगाव",
    "employeeName": "श्री युनुस शेख",
    "designation": "आरोग्य सेवक (MPW)",
    "bsCode": "54S2",
    "villageList": [
      "बोरगांव",
      "कवठा",
      "कवठा तांडा",
      "काळमाथा"
    ]
  },
  {
    "upkendra": "भादा",
    "employeeName": "श्रीमती शिवकन्या शंकर कुर्डे",
    "designation": "आशा स्वयंसेविका (ASHA)",
    "bsCode": "54F1V7",
    "villageList": [
      "हाळदुर्ग"
    ]
  },
  {
    "upkendra": "भादा",
    "employeeName": "श्रीमती महादेवी सुखदेव वाडकर",
    "designation": "आशा स्वयंसेविका (ASHA)",
    "bsCode": "54F1V1",
    "villageList": [
      "भादा"
    ]
  },
  {
    "upkendra": "भादा",
    "employeeName": "श्रीमती उषा शिवहरी कुंजीर",
    "designation": "आशा स्वयंसेविका (ASHA)",
    "bsCode": "54F1V5",
    "villageList": [
      "भादा"
    ]
  },
  {
    "upkendra": "भादा",
    "employeeName": "श्रीमती जयश्री नंदकुमार बुरबुरे",
    "designation": "आशा स्वयंसेविका (ASHA)",
    "bsCode": "54F1V2",
    "villageList": [
      "भादा"
    ]
  },
  {
    "upkendra": "भादा",
    "employeeName": "श्रीमती रेखा मोहन ढवळे",
    "designation": "आशा स्वयंसेविका (ASHA)",
    "bsCode": "54F1V3",
    "villageList": [
      "भादा"
    ]
  },
  {
    "upkendra": "भादा",
    "employeeName": "श्रीमती सुवर्णमाला जगन्नाथ राउत",
    "designation": "आशा स्वयंसेविका (ASHA)",
    "bsCode": "54F1V4",
    "villageList": [
      "भादा"
    ]
  },
  {
    "upkendra": "भादा",
    "employeeName": "श्रीमती रुक्मीन किसन गव्हाणे",
    "designation": "आशा स्वयंसेविका (ASHA)",
    "bsCode": "54F1V6",
    "villageList": [
      "शिंदेवाडी"
    ]
  },
  {
    "upkendra": "भादा",
    "employeeName": "श्रीमती सिंधू बापू तुंदारे",
    "designation": "आशा स्वयंसेविका (ASHA)",
    "bsCode": "54F1V8",
    "villageList": [
      "ब-हाणपूर"
    ]
  },
  {
    "upkendra": "भादा",
    "employeeName": "श्रीमती शिंदे पी एस",
    "designation": "आरोग्य सेविका (ANM)",
    "bsCode": "54F1",
    "villageList": [
      "भादा",
      "ब-हाणपूर",
      "हाळदुर्ग",
      "शिंदेवाडी"
    ]
  },
  {
    "upkendra": "भादा",
    "employeeName": "श्री रवी लिपारे",
    "designation": "आरोग्य सेवक (MPW)",
    "bsCode": "54S1A1",
    "villageList": [
      "भादा",
      "ब-हाणपूर",
      "हाळदुर्ग",
      "शिंदेवाडी"
    ]
  },
  {
    "upkendra": "भादा",
    "employeeName": "श्री शिरीष रामहरी शिंदे",
    "designation": "आरोग्य सेवक (MPW)",
    "bsCode": "54S1A2",
    "villageList": [
      "भादा",
      "ब-हाणपूर",
      "हाळदुर्ग",
      "शिंदेवाडी"
    ]
  },
  {
    "upkendra": "भेटा",
    "employeeName": "श्रीमती पठाण फरीदा अहेमद",
    "designation": "आशा स्वयंसेविका (ASHA)",
    "bsCode": "54F3V4",
    "villageList": [
      "आंदोरा"
    ]
  },
  {
    "upkendra": "भेटा",
    "employeeName": "श्रीमती गोसीया गैबी पठाण",
    "designation": "आशा स्वयंसेविका (ASHA)",
    "bsCode": "54F3V5",
    "villageList": [
      "आंदोरा"
    ]
  },
  {
    "upkendra": "भेटा",
    "employeeName": "श्रीमती शालू रंगराव वानवडे",
    "designation": "आशा स्वयंसेविका (ASHA)",
    "bsCode": "54F3V2",
    "villageList": [
      "भेटा",
      "नाव्होली"
    ]
  },
  {
    "upkendra": "भेटा",
    "employeeName": "श्रीमती पिंपरे चंद्रकला शंकर",
    "designation": "आशा स्वयंसेविका (ASHA)",
    "bsCode": "54F3V6",
    "villageList": [
      "भेटा"
    ]
  },
  {
    "upkendra": "भेटा",
    "employeeName": "श्रीमती गंगणे कविता सुरेष",
    "designation": "आशा स्वयंसेविका (ASHA)",
    "bsCode": "54F3V3",
    "villageList": [
      "भेटा"
    ]
  },
  {
    "upkendra": "भेटा",
    "employeeName": "श्रीमती चंद्रकला राजेंद्र पुरी",
    "designation": "आशा स्वयंसेविका (ASHA)",
    "bsCode": "54F3V6",
    "villageList": [
      "वडजी"
    ]
  },
  {
    "upkendra": "भेटा",
    "employeeName": "श्रीमती जाधव आर सी",
    "designation": "आरोग्य सेविका (ANM)",
    "bsCode": "54F3",
    "villageList": [
      "भेटा",
      "आंदोरा",
      "वडजी",
      "नाव्होली"
    ]
  },
  {
    "upkendra": "भेटा",
    "employeeName": "श्री परमेश्वर काळे",
    "designation": "आरोग्य सेवक (MPW)",
    "bsCode": "54S3",
    "villageList": [
      "भेटा",
      "आंदोरा",
      "वडजी",
      "नाव्होली"
    ]
  },
  {
    "upkendra": "लखनगाव",
    "employeeName": "श्रीमती ललिता जनार्धन आडे",
    "designation": "आशा स्वयंसेविका (ASHA)",
    "bsCode": "54F7V3",
    "villageList": [
      "सत्तधरवाडी",
      "कुलकर्णी तांडा"
    ]
  },
  {
    "upkendra": "लखनगाव",
    "employeeName": "श्रीमती मनिषा सिद्धाप्पा कवटे",
    "designation": "आशा स्वयंसेविका (ASHA)",
    "bsCode": "54F7V4",
    "villageList": [
      "सत्तधरवाडी"
    ]
  },
  {
    "upkendra": "लखनगाव",
    "employeeName": "श्रीमती माधुरी पोफळे",
    "designation": "आशा स्वयंसेविका (ASHA)",
    "bsCode": "54F7V7",
    "villageList": [
      "उटी बु."
    ]
  },
  {
    "upkendra": "लखनगाव",
    "employeeName": "श्रीमती रिहाना महताब शेख",
    "designation": "आशा स्वयंसेविका (ASHA)",
    "bsCode": "54F7V2",
    "villageList": [
      "उटी बु."
    ]
  },
  {
    "upkendra": "लखनगाव",
    "employeeName": "श्रीमती संगीता प्रेमसिंग राठोड",
    "designation": "आशा स्वयंसेविका (ASHA)",
    "bsCode": "54F7V5",
    "villageList": [
      "सोनपट्टी तांडा"
    ]
  },
  {
    "upkendra": "लखनगाव",
    "employeeName": "श्रीमती माया लिंबाजी वाघमारे",
    "designation": "आशा स्वयंसेविका (ASHA)",
    "bsCode": "54F7V1",
    "villageList": [
      "लखनगांव"
    ]
  },
  {
    "upkendra": "लखनगाव",
    "employeeName": "श्रीमती ज्योती परशुराम इटकर",
    "designation": "आशा स्वयंसेविका (ASHA)",
    "bsCode": "54F7V6",
    "villageList": [
      "लखनगांव"
    ]
  },
  {
    "upkendra": "लखनगाव",
    "employeeName": "श्रीमती जगताप ए टी",
    "designation": "आरोग्य सेविका (ANM)",
    "bsCode": "54F7",
    "villageList": [
      "लखनगांव",
      "सोनपट्टी तांडा",
      "उटी बु.",
      "सत्तधरवाडी",
      "कुलकर्णी तांडा"
    ]
  },
  {
    "upkendra": "लखनगाव",
    "employeeName": "श्री वनराज जाधव",
    "designation": "आरोग्य सेवक (MPW)",
    "bsCode": "54S7",
    "villageList": [
      "लखनगांव",
      "सोनपट्टी तांडा",
      "उटी बु.",
      "सत्तधरवाडी",
      "कुलकर्णी तांडा"
    ]
  },
  {
    "upkendra": "लखनगाव",
    "employeeName": "श्री उजळंबे राजेंद्र सुभाष",
    "designation": "आरोग्य सेवक (MPW)",
    "bsCode": "54S7A1",
    "villageList": [
      "लखनगांव",
      "सोनपट्टी तांडा",
      "उटी बु.",
      "सत्तधरवाडी",
      "कुलकर्णी तांडा"
    ]
  },
  {
    "upkendra": "लखनगाव",
    "employeeName": "श्री रवी लिपारे",
    "designation": "आरोग्य सेवक (MPW)",
    "bsCode": "54S7",
    "villageList": [
      "लखनगांव",
      "सोनपट्टी तांडा",
      "उटी बु.",
      "सत्तधरवाडी",
      "कुलकर्णी तांडा"
    ]
  },
  {
    "upkendra": "शिवली",
    "employeeName": "श्रीमती रईसा आब्दूल तांबोळी",
    "designation": "आशा स्वयंसेविका (ASHA)",
    "bsCode": "54F4V2",
    "villageList": [
      "शिवली"
    ]
  },
  {
    "upkendra": "शिवली",
    "employeeName": "श्रीमती उर्मीला मधुकर नागरसोगे",
    "designation": "आशा स्वयंसेविका (ASHA)",
    "bsCode": "54F4V4",
    "villageList": [
      "शिवली"
    ]
  },
  {
    "upkendra": "शिवली",
    "employeeName": "श्रीमती तारामती चंद्रकांत फुटाणे",
    "designation": "आशा स्वयंसेविका (ASHA)",
    "bsCode": "54F4V3",
    "villageList": [
      "शिवली"
    ]
  },
  {
    "upkendra": "शिवली",
    "employeeName": "श्रीमती जयश्री हरिश्चंद्र जाधव",
    "designation": "आशा स्वयंसेविका (ASHA)",
    "bsCode": "54F4V5",
    "villageList": [
      "वरवडा"
    ]
  },
  {
    "upkendra": "शिवली",
    "employeeName": "श्रीमती पल्लवी किशोर कदम",
    "designation": "आशा स्वयंसेविका (ASHA)",
    "bsCode": "54F4V7",
    "villageList": [
      "वरवडा"
    ]
  },
  {
    "upkendra": "शिवली",
    "employeeName": "श्रीमती माया बाबुराव माने",
    "designation": "आशा स्वयंसेविका (ASHA)",
    "bsCode": "54F4V6",
    "villageList": [
      "जायफळ"
    ]
  },
  {
    "upkendra": "शिवली",
    "employeeName": "श्रीमती आशा राजाराम पावले",
    "designation": "आशा स्वयंसेविका (ASHA)",
    "bsCode": "54F4V1",
    "villageList": [
      "शिवली"
    ]
  },
  {
    "upkendra": "शिवली",
    "employeeName": "श्रीमती पंचशीला गोरख भांगे",
    "designation": "आरोग्य सेविका (ANM)",
    "bsCode": "54F4",
    "villageList": [
      "शिवली",
      "वरवडा",
      "जायफळ"
    ]
  },
  {
    "upkendra": "शिवली",
    "employeeName": "श्री अनिल एकनाथ भराडे",
    "designation": "आरोग्य सेवक (MPW)",
    "bsCode": "54S4",
    "villageList": [
      "शिवली",
      "वरवडा",
      "जायफळ"
    ]
  },
  {
    "upkendra": "प्रा.आ.केंद्र",
    "employeeName": "बाह्य रुग्ण विभाग",
    "designation": "वैद्यकीय अधिकारी (OPD)",
    "bsCode": "54P",
    "villageList": [
      "Phc भादा"
    ]
  }
];

// ================= SUBCENTER MASTER =================
export const subcenterMaster = [
  {
    "id": "SC_ALMALA",
    "name": "आलमला",
    "headquarter": "आलमला",
    "contactPerson": "श्रीमती जावंडरे एस.डी. (ANM) / श्री सगर आभिजीत (MPW)",
    "population": 5200,
    "houses": 1040,
    "contactPhone": "",
    "villages": [
      "आलमला",
      "उंबडगा बू",
      "उंबडगा खू",
      "आलमला तांडा"
    ]
  },
  {
    "id": "SC_KORANGALA",
    "name": "कोरंगळा",
    "headquarter": "कोरंगळा",
    "contactPerson": "श्रीमती नागमोडे बी.डी. (ANM) / श्री विश्वंभर शिंदे (MPW)",
    "population": 6400,
    "houses": 1280,
    "contactPhone": "",
    "villages": [
      "समदर्गा",
      "कोरंगळा",
      "येल्लोरी",
      "येल्लोरी वाडी",
      "औसा तांडा"
    ]
  },
  {
    "id": "SC_BORGAON",
    "name": "बोरगाव",
    "headquarter": "बोरगांव",
    "contactPerson": "श्रीमती वंदना तीर्थोबा कांबळे (ANM) / श्री युनुस शेख (MPW)",
    "population": 4900,
    "houses": 980,
    "contactPhone": "",
    "villages": [
      "काळमाथा",
      "बोरगांव",
      "कवठा",
      "कवठा तांडा"
    ]
  },
  {
    "id": "SC_BHADA",
    "name": "भादा",
    "headquarter": "भादा",
    "contactPerson": "श्रीमती शिंदे पी एस (ANM) / श्री रवी लिपारे, श्री शिरीष शिंदे (MPW)",
    "population": 7500,
    "houses": 1500,
    "contactPhone": "",
    "villages": [
      "हाळदुर्ग",
      "भादा",
      "शिंदेवाडी",
      "ब-हाणपूर"
    ]
  },
  {
    "id": "SC_BHETA",
    "name": "भेटा",
    "headquarter": "भेटा",
    "contactPerson": "श्रीमती जाधव आर सी (ANM) / श्री परमेश्वर काळे (MPW)",
    "population": 5100,
    "houses": 1020,
    "contactPhone": "",
    "villages": [
      "आंदोरा",
      "भेटा",
      "नाव्होली",
      "वडजी"
    ]
  },
  {
    "id": "SC_LAKHANGAON",
    "name": "लखनगाव",
    "headquarter": "लखनगांव",
    "contactPerson": "श्रीमती जगताप ए टी (ANM) / श्री वनराज जाधव, श्री उजळंबे राजेंद्र सुभाष, श्री रवी लिपारे (MPW)",
    "population": 5800,
    "houses": 1160,
    "contactPhone": "",
    "villages": [
      "सत्तधरवाडी",
      "कुलकर्णी तांडा",
      "उटी बु.",
      "सोनपट्टी तांडा",
      "लखनगांव"
    ]
  },
  {
    "id": "SC_SHIVLI",
    "name": "शिवली",
    "headquarter": "शिवली",
    "contactPerson": "श्रीमती पंचशीला गोरख भांगे (ANM) / श्री अनिल एकनाथ भराडे (MPW)",
    "population": 4800,
    "houses": 960,
    "contactPhone": "",
    "villages": [
      "शिवली",
      "वरवडा",
      "जायफळ"
    ]
  },
  {
    "id": "SC_PHC_OPD",
    "name": "प्रा.आ.केंद्र",
    "headquarter": "प्राथमिक आरोग्य केंद्र भादा",
    "contactPerson": "वैद्यकीय अधिकारी (OPD)",
    "population": 39700,
    "houses": 7940,
    "contactPhone": "",
    "villages": [
      "Phc भादा"
    ]
  }
];

// ================= VILLAGES MASTER (with Population and No. of Houses) =================
export const villagesMaster = [
  {
    "id": "VIL_01",
    "villageName": "आलमला",
    "subcenter": "आलमला",
    "population": 1300,
    "houses": 260,
    "annualSmearTarget": 130,
    "ashaName": "श्रीमती पुनम रावसाहेब काळे, श्रीमती राधा सुरेष पांचळ, श्रीमती मनोरमा प्रल्हाद सुवर्णकार, श्रीमती दैवशाला गोविंद शिरसाट",
    "assignedEmployees": [
      "श्रीमती पुनम रावसाहेब काळे (ASHA)",
      "श्रीमती राधा सुरेष पांचळ (ASHA)",
      "श्रीमती मनोरमा प्रल्हाद सुवर्णकार (ASHA)",
      "श्रीमती दैवशाला गोविंद शिरसाट (ASHA)",
      "श्रीमती जावंडरे एस.डी. (ANM)",
      "श्री सगर आभिजीत (MPW)"
    ]
  },
  {
    "id": "VIL_02",
    "villageName": "उंबडगा बू",
    "subcenter": "आलमला",
    "population": 1300,
    "houses": 260,
    "annualSmearTarget": 130,
    "ashaName": "श्रीमती शिल्पा पुनम थोरात",
    "assignedEmployees": [
      "श्रीमती शिल्पा पुनम थोरात (ASHA)",
      "श्रीमती जावंडरे एस.डी. (ANM)",
      "श्री सगर आभिजीत (MPW)"
    ]
  },
  {
    "id": "VIL_03",
    "villageName": "उंबडगा खू",
    "subcenter": "आलमला",
    "population": 1300,
    "houses": 260,
    "annualSmearTarget": 130,
    "ashaName": "श्रीमती आनिता राजाराम बनसोडे",
    "assignedEmployees": [
      "श्रीमती आनिता राजाराम बनसोडे (ASHA)",
      "श्रीमती जावंडरे एस.डी. (ANM)",
      "श्री सगर आभिजीत (MPW)"
    ]
  },
  {
    "id": "VIL_04",
    "villageName": "आलमला तांडा",
    "subcenter": "आलमला",
    "population": 1300,
    "houses": 260,
    "annualSmearTarget": 130,
    "ashaName": "",
    "assignedEmployees": [
      "श्रीमती जावंडरे एस.डी. (ANM)",
      "श्री सगर आभिजीत (MPW)"
    ]
  },
  {
    "id": "VIL_05",
    "villageName": "समदर्गा",
    "subcenter": "कोरंगळा",
    "population": 1280,
    "houses": 256,
    "annualSmearTarget": 128,
    "ashaName": "श्रीमती कैसल्या विष्णू ढोक, श्रीमती छाया हेमाद्रीपंत काळे",
    "assignedEmployees": [
      "श्रीमती कैसल्या विष्णू ढोक (ASHA)",
      "श्रीमती छाया हेमाद्रीपंत काळे (ASHA)",
      "श्रीमती नागमोडे बी.डी. (ANM)",
      "श्री विश्वंभर शिंदे (MPW)"
    ]
  },
  {
    "id": "VIL_06",
    "villageName": "कोरंगळा",
    "subcenter": "कोरंगळा",
    "population": 1280,
    "houses": 256,
    "annualSmearTarget": 128,
    "ashaName": "श्रीमती नजमुन अल्लाबक्श दरोगे, श्रीमती विमल श्रीहरी जंगाले",
    "assignedEmployees": [
      "श्रीमती नजमुन अल्लाबक्श दरोगे (ASHA)",
      "श्रीमती विमल श्रीहरी जंगाले (ASHA)",
      "श्रीमती नागमोडे बी.डी. (ANM)",
      "श्री विश्वंभर शिंदे (MPW)"
    ]
  },
  {
    "id": "VIL_07",
    "villageName": "येल्लोरी",
    "subcenter": "कोरंगळा",
    "population": 1280,
    "houses": 256,
    "annualSmearTarget": 128,
    "ashaName": "श्रीमती दुर्गा वैजीनाथ चांडसुरे, श्रीमती सविता गोपाळ रिंगनकर",
    "assignedEmployees": [
      "श्रीमती दुर्गा वैजीनाथ चांडसुरे (ASHA)",
      "श्रीमती सविता गोपाळ रिंगनकर (ASHA)",
      "श्रीमती नागमोडे बी.डी. (ANM)",
      "श्री विश्वंभर शिंदे (MPW)"
    ]
  },
  {
    "id": "VIL_08",
    "villageName": "येल्लोरी वाडी",
    "subcenter": "कोरंगळा",
    "population": 1280,
    "houses": 256,
    "annualSmearTarget": 128,
    "ashaName": "श्रीमती सुनिता शहाजी घाडगे",
    "assignedEmployees": [
      "श्रीमती सुनिता शहाजी घाडगे (ASHA)",
      "श्रीमती नागमोडे बी.डी. (ANM)",
      "श्री विश्वंभर शिंदे (MPW)"
    ]
  },
  {
    "id": "VIL_09",
    "villageName": "औसा तांडा",
    "subcenter": "कोरंगळा",
    "population": 1280,
    "houses": 256,
    "annualSmearTarget": 128,
    "ashaName": "श्रीमती मंगल हिरामन चव्हाण",
    "assignedEmployees": [
      "श्रीमती मंगल हिरामन चव्हाण (ASHA)",
      "श्रीमती नागमोडे बी.डी. (ANM)",
      "श्री विश्वंभर शिंदे (MPW)"
    ]
  },
  {
    "id": "VIL_10",
    "villageName": "काळमाथा",
    "subcenter": "बोरगाव",
    "population": 1225,
    "houses": 245,
    "annualSmearTarget": 123,
    "ashaName": "श्रीमती सारीका बब्रुवान गजनेत्री, श्रीमती तस्लीम सय्यद फकीर",
    "assignedEmployees": [
      "श्रीमती सारीका बब्रुवान गजनेत्री (ASHA)",
      "श्रीमती तस्लीम सय्यद फकीर (ASHA)",
      "श्रीमती वंदना तीर्थोबा कांबळे (ANM)",
      "श्री युनुस शेख (MPW)"
    ]
  },
  {
    "id": "VIL_11",
    "villageName": "बोरगांव",
    "subcenter": "बोरगाव",
    "population": 1225,
    "houses": 245,
    "annualSmearTarget": 123,
    "ashaName": "श्रीमती ललिता बालाजी साळुंके, श्रीमती उमा दयानंद डामगीरे",
    "assignedEmployees": [
      "श्रीमती ललिता बालाजी साळुंके (ASHA)",
      "श्रीमती उमा दयानंद डामगीरे (ASHA)",
      "श्रीमती वंदना तीर्थोबा कांबळे (ANM)",
      "श्री युनुस शेख (MPW)"
    ]
  },
  {
    "id": "VIL_12",
    "villageName": "कवठा",
    "subcenter": "बोरगाव",
    "population": 1225,
    "houses": 245,
    "annualSmearTarget": 123,
    "ashaName": "श्रीमती आर्चना दगडु गोरे",
    "assignedEmployees": [
      "श्रीमती आर्चना दगडु गोरे (ASHA)",
      "श्रीमती वंदना तीर्थोबा कांबळे (ANM)",
      "श्री युनुस शेख (MPW)"
    ]
  },
  {
    "id": "VIL_13",
    "villageName": "कवठा तांडा",
    "subcenter": "बोरगाव",
    "population": 1225,
    "houses": 245,
    "annualSmearTarget": 123,
    "ashaName": "श्रीमती आर्चना दगडु गोरे",
    "assignedEmployees": [
      "श्रीमती आर्चना दगडु गोरे (ASHA)",
      "श्रीमती वंदना तीर्थोबा कांबळे (ANM)",
      "श्री युनुस शेख (MPW)"
    ]
  },
  {
    "id": "VIL_14",
    "villageName": "हाळदुर्ग",
    "subcenter": "भादा",
    "population": 1875,
    "houses": 375,
    "annualSmearTarget": 188,
    "ashaName": "श्रीमती शिवकन्या शंकर कुर्डे",
    "assignedEmployees": [
      "श्रीमती शिवकन्या शंकर कुर्डे (ASHA)",
      "श्रीमती शिंदे पी एस (ANM)",
      "श्री रवी लिपारे (MPW)",
      "श्री शिरीष रामहरी शिंदे (MPW)"
    ]
  },
  {
    "id": "VIL_15",
    "villageName": "भादा",
    "subcenter": "भादा",
    "population": 1875,
    "houses": 375,
    "annualSmearTarget": 188,
    "ashaName": "श्रीमती महादेवी सुखदेव वाडकर, श्रीमती उषा शिवहरी कुंजीर, श्रीमती जयश्री नंदकुमार बुरबुरे, श्रीमती रेखा मोहन ढवळे, श्रीमती सुवर्णमाला जगन्नाथ राउत",
    "assignedEmployees": [
      "श्रीमती महादेवी सुखदेव वाडकर (ASHA)",
      "श्रीमती उषा शिवहरी कुंजीर (ASHA)",
      "श्रीमती जयश्री नंदकुमार बुरबुरे (ASHA)",
      "श्रीमती रेखा मोहन ढवळे (ASHA)",
      "श्रीमती सुवर्णमाला जगन्नाथ राउत (ASHA)",
      "श्रीमती शिंदे पी एस (ANM)",
      "श्री रवी लिपारे (MPW)",
      "श्री शिरीष रामहरी शिंदे (MPW)"
    ]
  },
  {
    "id": "VIL_16",
    "villageName": "शिंदेवाडी",
    "subcenter": "भादा",
    "population": 1875,
    "houses": 375,
    "annualSmearTarget": 188,
    "ashaName": "श्रीमती रुक्मीन किसन गव्हाणे",
    "assignedEmployees": [
      "श्रीमती रुक्मीन किसन गव्हाणे (ASHA)",
      "श्रीमती शिंदे पी एस (ANM)",
      "श्री रवी लिपारे (MPW)",
      "श्री शिरीष रामहरी शिंदे (MPW)"
    ]
  },
  {
    "id": "VIL_17",
    "villageName": "ब-हाणपूर",
    "subcenter": "भादा",
    "population": 1875,
    "houses": 375,
    "annualSmearTarget": 188,
    "ashaName": "श्रीमती सिंधू बापू तुंदारे",
    "assignedEmployees": [
      "श्रीमती सिंधू बापू तुंदारे (ASHA)",
      "श्रीमती शिंदे पी एस (ANM)",
      "श्री रवी लिपारे (MPW)",
      "श्री शिरीष रामहरी शिंदे (MPW)"
    ]
  },
  {
    "id": "VIL_18",
    "villageName": "आंदोरा",
    "subcenter": "भेटा",
    "population": 1275,
    "houses": 255,
    "annualSmearTarget": 128,
    "ashaName": "श्रीमती पठाण फरीदा अहेमद, श्रीमती गोसीया गैबी पठाण",
    "assignedEmployees": [
      "श्रीमती पठाण फरीदा अहेमद (ASHA)",
      "श्रीमती गोसीया गैबी पठाण (ASHA)",
      "श्रीमती जाधव आर सी (ANM)",
      "श्री परमेश्वर काळे (MPW)"
    ]
  },
  {
    "id": "VIL_19",
    "villageName": "भेटा",
    "subcenter": "भेटा",
    "population": 1275,
    "houses": 255,
    "annualSmearTarget": 128,
    "ashaName": "श्रीमती शालू रंगराव वानवडे, श्रीमती पिंपरे चंद्रकला शंकर, श्रीमती गंगणे कविता सुरेष",
    "assignedEmployees": [
      "श्रीमती शालू रंगराव वानवडे (ASHA)",
      "श्रीमती पिंपरे चंद्रकला शंकर (ASHA)",
      "श्रीमती गंगणे कविता सुरेष (ASHA)",
      "श्रीमती जाधव आर सी (ANM)",
      "श्री परमेश्वर काळे (MPW)"
    ]
  },
  {
    "id": "VIL_20",
    "villageName": "नाव्होली",
    "subcenter": "भेटा",
    "population": 1275,
    "houses": 255,
    "annualSmearTarget": 128,
    "ashaName": "श्रीमती शालू रंगराव वानवडे",
    "assignedEmployees": [
      "श्रीमती शालू रंगराव वानवडे (ASHA)",
      "श्रीमती जाधव आर सी (ANM)",
      "श्री परमेश्वर काळे (MPW)"
    ]
  },
  {
    "id": "VIL_21",
    "villageName": "वडजी",
    "subcenter": "भेटा",
    "population": 1275,
    "houses": 255,
    "annualSmearTarget": 128,
    "ashaName": "श्रीमती चंद्रकला राजेंद्र पुरी",
    "assignedEmployees": [
      "श्रीमती चंद्रकला राजेंद्र पुरी (ASHA)",
      "श्रीमती जाधव आर सी (ANM)",
      "श्री परमेश्वर काळे (MPW)"
    ]
  },
  {
    "id": "VIL_22",
    "villageName": "सत्तधरवाडी",
    "subcenter": "लखनगाव",
    "population": 1160,
    "houses": 232,
    "annualSmearTarget": 116,
    "ashaName": "श्रीमती ललिता जनार्धन आडे, श्रीमती मनिषा सिद्धाप्पा कवटे",
    "assignedEmployees": [
      "श्रीमती ललिता जनार्धन आडे (ASHA)",
      "श्रीमती मनिषा सिद्धाप्पा कवटे (ASHA)",
      "श्रीमती जगताप ए टी (ANM)",
      "श्री वनराज जाधव (MPW)",
      "श्री उजळंबे राजेंद्र सुभाष (MPW)",
      "श्री रवी लिपारे (MPW)"
    ]
  },
  {
    "id": "VIL_23",
    "villageName": "कुलकर्णी तांडा",
    "subcenter": "लखनगाव",
    "population": 1160,
    "houses": 232,
    "annualSmearTarget": 116,
    "ashaName": "श्रीमती ललिता जनार्धन आडे",
    "assignedEmployees": [
      "श्रीमती ललिता जनार्धन आडे (ASHA)",
      "श्रीमती जगताप ए टी (ANM)",
      "श्री वनराज जाधव (MPW)",
      "श्री उजळंबे राजेंद्र सुभाष (MPW)",
      "श्री रवी लिपारे (MPW)"
    ]
  },
  {
    "id": "VIL_24",
    "villageName": "उटी बु.",
    "subcenter": "लखनगाव",
    "population": 1160,
    "houses": 232,
    "annualSmearTarget": 116,
    "ashaName": "श्रीमती माधुरी पोफळे, श्रीमती रिहाना महताब शेख",
    "assignedEmployees": [
      "श्रीमती माधुरी पोफळे (ASHA)",
      "श्रीमती रिहाना महताब शेख (ASHA)",
      "श्रीमती जगताप ए टी (ANM)",
      "श्री वनराज जाधव (MPW)",
      "श्री उजळंबे राजेंद्र सुभाष (MPW)",
      "श्री रवी लिपारे (MPW)"
    ]
  },
  {
    "id": "VIL_25",
    "villageName": "सोनपट्टी तांडा",
    "subcenter": "लखनगाव",
    "population": 1160,
    "houses": 232,
    "annualSmearTarget": 116,
    "ashaName": "श्रीमती संगीता प्रेमसिंग राठोड",
    "assignedEmployees": [
      "श्रीमती संगीता प्रेमसिंग राठोड (ASHA)",
      "श्रीमती जगताप ए टी (ANM)",
      "श्री वनराज जाधव (MPW)",
      "श्री उजळंबे राजेंद्र सुभाष (MPW)",
      "श्री रवी लिपारे (MPW)"
    ]
  },
  {
    "id": "VIL_26",
    "villageName": "लखनगांव",
    "subcenter": "लखनगाव",
    "population": 1160,
    "houses": 232,
    "annualSmearTarget": 116,
    "ashaName": "श्रीमती माया लिंबाजी वाघमारे, श्रीमती ज्योती परशुराम इटकर",
    "assignedEmployees": [
      "श्रीमती माया लिंबाजी वाघमारे (ASHA)",
      "श्रीमती ज्योती परशुराम इटकर (ASHA)",
      "श्रीमती जगताप ए टी (ANM)",
      "श्री वनराज जाधव (MPW)",
      "श्री उजळंबे राजेंद्र सुभाष (MPW)",
      "श्री रवी लिपारे (MPW)"
    ]
  },
  {
    "id": "VIL_27",
    "villageName": "शिवली",
    "subcenter": "शिवली",
    "population": 1600,
    "houses": 320,
    "annualSmearTarget": 160,
    "ashaName": "श्रीमती रईसा आब्दूल तांबोळी, श्रीमती उर्मीला मधुकर नागरसोगे, श्रीमती तारामती चंद्रकांत फुटाणे, श्रीमती आशा राजाराम पावले",
    "assignedEmployees": [
      "श्रीमती रईसा आब्दूल तांबोळी (ASHA)",
      "श्रीमती उर्मीला मधुकर नागरसोगे (ASHA)",
      "श्रीमती तारामती चंद्रकांत फुटाणे (ASHA)",
      "श्रीमती आशा राजाराम पावले (ASHA)",
      "श्रीमती पंचशीला गोरख भांगे (ANM)",
      "श्री अनिल एकनाथ भराडे (MPW)"
    ]
  },
  {
    "id": "VIL_28",
    "villageName": "वरवडा",
    "subcenter": "शिवली",
    "population": 1600,
    "houses": 320,
    "annualSmearTarget": 160,
    "ashaName": "श्रीमती जयश्री हरिश्चंद्र जाधव, श्रीमती पल्लवी किशोर कदम",
    "assignedEmployees": [
      "श्रीमती जयश्री हरिश्चंद्र जाधव (ASHA)",
      "श्रीमती पल्लवी किशोर कदम (ASHA)",
      "श्रीमती पंचशीला गोरख भांगे (ANM)",
      "श्री अनिल एकनाथ भराडे (MPW)"
    ]
  },
  {
    "id": "VIL_29",
    "villageName": "जायफळ",
    "subcenter": "शिवली",
    "population": 1600,
    "houses": 320,
    "annualSmearTarget": 160,
    "ashaName": "श्रीमती माया बाबुराव माने",
    "assignedEmployees": [
      "श्रीमती माया बाबुराव माने (ASHA)",
      "श्रीमती पंचशीला गोरख भांगे (ANM)",
      "श्री अनिल एकनाथ भराडे (MPW)"
    ]
  },
  {
    "id": "VIL_30",
    "villageName": "Phc भादा",
    "subcenter": "प्रा.आ.केंद्र",
    "population": 5000,
    "houses": 1000,
    "annualSmearTarget": 500,
    "ashaName": "",
    "assignedEmployees": [
      "बाह्य रुग्ण विभाग (MO)"
    ]
  }
];

// ================= SUBCENTER-WISE EMPLOYEE MASTER (ANM, MPW, ASHA, MO) =================
export const employeeMaster = [
  {
    "id": "EMP_001",
    "upkendra": "आलमला",
    "employeeName": "श्रीमती पुनम रावसाहेब काळे",
    "designation": "आशा स्वयंसेविका (ASHA)",
    "category": "ASHA",
    "bsCode": "54F6V3",
    "mobile": "",
    "villageList": [
      "आलमला"
    ]
  },
  {
    "id": "EMP_002",
    "upkendra": "आलमला",
    "employeeName": "श्रीमती शिल्पा पुनम थोरात",
    "designation": "आशा स्वयंसेविका (ASHA)",
    "category": "ASHA",
    "bsCode": "54F6V5",
    "mobile": "",
    "villageList": [
      "उंबडगा बू"
    ]
  },
  {
    "id": "EMP_003",
    "upkendra": "आलमला",
    "employeeName": "श्रीमती राधा सुरेष पांचळ",
    "designation": "आशा स्वयंसेविका (ASHA)",
    "category": "ASHA",
    "bsCode": "54F6V4",
    "mobile": "",
    "villageList": [
      "आलमला"
    ]
  },
  {
    "id": "EMP_004",
    "upkendra": "आलमला",
    "employeeName": "श्रीमती मनोरमा प्रल्हाद सुवर्णकार",
    "designation": "आशा स्वयंसेविका (ASHA)",
    "category": "ASHA",
    "bsCode": "54F6V2",
    "mobile": "",
    "villageList": [
      "आलमला"
    ]
  },
  {
    "id": "EMP_005",
    "upkendra": "आलमला",
    "employeeName": "श्रीमती आनिता राजाराम बनसोडे",
    "designation": "आशा स्वयंसेविका (ASHA)",
    "category": "ASHA",
    "bsCode": "54F6V6",
    "mobile": "",
    "villageList": [
      "उंबडगा खू"
    ]
  },
  {
    "id": "EMP_006",
    "upkendra": "आलमला",
    "employeeName": "श्रीमती दैवशाला गोविंद शिरसाट",
    "designation": "आशा स्वयंसेविका (ASHA)",
    "category": "ASHA",
    "bsCode": "54F6V1",
    "mobile": "",
    "villageList": [
      "आलमला"
    ]
  },
  {
    "id": "EMP_007",
    "upkendra": "आलमला",
    "employeeName": "श्रीमती जावंडरे एस.डी.",
    "designation": "आरोग्य सेविका (ANM)",
    "category": "ANM",
    "bsCode": "54F6A",
    "mobile": "",
    "villageList": [
      "आलमला",
      "आलमला तांडा",
      "उंबडगा बू",
      "उंबडगा खू"
    ]
  },
  {
    "id": "EMP_008",
    "upkendra": "आलमला",
    "employeeName": "श्री सगर आभिजीत",
    "designation": "आरोग्य सेवक (MPW)",
    "category": "MPW",
    "bsCode": "54S6",
    "mobile": "",
    "villageList": [
      "आलमला",
      "आलमला तांडा",
      "उंबडगा बू",
      "उंबडगा खू"
    ]
  },
  {
    "id": "EMP_009",
    "upkendra": "कोरंगळा",
    "employeeName": "श्रीमती कैसल्या विष्णू ढोक",
    "designation": "आशा स्वयंसेविका (ASHA)",
    "category": "ASHA",
    "bsCode": "54F5V4",
    "mobile": "",
    "villageList": [
      "समदर्गा"
    ]
  },
  {
    "id": "EMP_010",
    "upkendra": "कोरंगळा",
    "employeeName": "श्रीमती छाया हेमाद्रीपंत काळे",
    "designation": "आशा स्वयंसेविका (ASHA)",
    "category": "ASHA",
    "bsCode": "54F5V3",
    "mobile": "",
    "villageList": [
      "समदर्गा"
    ]
  },
  {
    "id": "EMP_011",
    "upkendra": "कोरंगळा",
    "employeeName": "श्रीमती नजमुन अल्लाबक्श दरोगे",
    "designation": "आशा स्वयंसेविका (ASHA)",
    "category": "ASHA",
    "bsCode": "54F5V1",
    "mobile": "",
    "villageList": [
      "कोरंगळा"
    ]
  },
  {
    "id": "EMP_012",
    "upkendra": "कोरंगळा",
    "employeeName": "श्रीमती दुर्गा वैजीनाथ चांडसुरे",
    "designation": "आशा स्वयंसेविका (ASHA)",
    "category": "ASHA",
    "bsCode": "54F5V5",
    "mobile": "",
    "villageList": [
      "येल्लोरी"
    ]
  },
  {
    "id": "EMP_013",
    "upkendra": "कोरंगळा",
    "employeeName": "श्रीमती सविता गोपाळ रिंगनकर",
    "designation": "आशा स्वयंसेविका (ASHA)",
    "category": "ASHA",
    "bsCode": "54F5V6",
    "mobile": "",
    "villageList": [
      "येल्लोरी"
    ]
  },
  {
    "id": "EMP_014",
    "upkendra": "कोरंगळा",
    "employeeName": "श्रीमती सुनिता शहाजी घाडगे",
    "designation": "आशा स्वयंसेविका (ASHA)",
    "category": "ASHA",
    "bsCode": "54F5V7",
    "mobile": "",
    "villageList": [
      "येल्लोरी वाडी"
    ]
  },
  {
    "id": "EMP_015",
    "upkendra": "कोरंगळा",
    "employeeName": "श्रीमती मंगल हिरामन चव्हाण",
    "designation": "आशा स्वयंसेविका (ASHA)",
    "category": "ASHA",
    "bsCode": "54F5V8",
    "mobile": "",
    "villageList": [
      "औसा तांडा"
    ]
  },
  {
    "id": "EMP_016",
    "upkendra": "कोरंगळा",
    "employeeName": "श्रीमती विमल श्रीहरी जंगाले",
    "designation": "आशा स्वयंसेविका (ASHA)",
    "category": "ASHA",
    "bsCode": "54F5V2",
    "mobile": "",
    "villageList": [
      "कोरंगळा"
    ]
  },
  {
    "id": "EMP_017",
    "upkendra": "कोरंगळा",
    "employeeName": "श्रीमती नागमोडे बी.डी.",
    "designation": "आरोग्य सेविका (ANM)",
    "category": "ANM",
    "bsCode": "54F5A",
    "mobile": "",
    "villageList": [
      "कोरंगळा",
      "औसा तांडा",
      "येल्लोरी वाडी",
      "येल्लोरी",
      "समदर्गा"
    ]
  },
  {
    "id": "EMP_018",
    "upkendra": "कोरंगळा",
    "employeeName": "श्री विश्वंभर शिंदे",
    "designation": "आरोग्य सेवक (MPW)",
    "category": "MPW",
    "bsCode": "54S5",
    "mobile": "",
    "villageList": [
      "कोरंगळा",
      "औसा तांडा",
      "येल्लोरी वाडी",
      "येल्लोरी",
      "समदर्गा"
    ]
  },
  {
    "id": "EMP_019",
    "upkendra": "बोरगाव",
    "employeeName": "श्रीमती सारीका बब्रुवान गजनेत्री",
    "designation": "आशा स्वयंसेविका (ASHA)",
    "category": "ASHA",
    "bsCode": "54F2V3",
    "mobile": "",
    "villageList": [
      "काळमाथा"
    ]
  },
  {
    "id": "EMP_020",
    "upkendra": "बोरगाव",
    "employeeName": "श्रीमती ललिता बालाजी साळुंके",
    "designation": "आशा स्वयंसेविका (ASHA)",
    "category": "ASHA",
    "bsCode": "54F2V2",
    "mobile": "",
    "villageList": [
      "बोरगांव"
    ]
  },
  {
    "id": "EMP_021",
    "upkendra": "बोरगाव",
    "employeeName": "श्रीमती उमा दयानंद डामगीरे",
    "designation": "आशा स्वयंसेविका (ASHA)",
    "category": "ASHA",
    "bsCode": "54F2V1",
    "mobile": "",
    "villageList": [
      "बोरगांव"
    ]
  },
  {
    "id": "EMP_022",
    "upkendra": "बोरगाव",
    "employeeName": "श्रीमती तस्लीम सय्यद फकीर",
    "designation": "आशा स्वयंसेविका (ASHA)",
    "category": "ASHA",
    "bsCode": "54F2V3",
    "mobile": "",
    "villageList": [
      "काळमाथा"
    ]
  },
  {
    "id": "EMP_023",
    "upkendra": "बोरगाव",
    "employeeName": "श्रीमती आर्चना दगडु गोरे",
    "designation": "आशा स्वयंसेविका (ASHA)",
    "category": "ASHA",
    "bsCode": "54F2V5",
    "mobile": "",
    "villageList": [
      "कवठा",
      "कवठा तांडा"
    ]
  },
  {
    "id": "EMP_024",
    "upkendra": "बोरगाव",
    "employeeName": "श्रीमती वंदना तीर्थोबा कांबळे",
    "designation": "आरोग्य सेविका (ANM)",
    "category": "ANM",
    "bsCode": "54F2",
    "mobile": "",
    "villageList": [
      "बोरगांव",
      "कवठा",
      "कवठा तांडा",
      "काळमाथा"
    ]
  },
  {
    "id": "EMP_025",
    "upkendra": "बोरगाव",
    "employeeName": "श्री युनुस शेख",
    "designation": "आरोग्य सेवक (MPW)",
    "category": "MPW",
    "bsCode": "54S2",
    "mobile": "",
    "villageList": [
      "बोरगांव",
      "कवठा",
      "कवठा तांडा",
      "काळमाथा"
    ]
  },
  {
    "id": "EMP_026",
    "upkendra": "भादा",
    "employeeName": "श्रीमती शिवकन्या शंकर कुर्डे",
    "designation": "आशा स्वयंसेविका (ASHA)",
    "category": "ASHA",
    "bsCode": "54F1V7",
    "mobile": "",
    "villageList": [
      "हाळदुर्ग"
    ]
  },
  {
    "id": "EMP_027",
    "upkendra": "भादा",
    "employeeName": "श्रीमती महादेवी सुखदेव वाडकर",
    "designation": "आशा स्वयंसेविका (ASHA)",
    "category": "ASHA",
    "bsCode": "54F1V1",
    "mobile": "",
    "villageList": [
      "भादा"
    ]
  },
  {
    "id": "EMP_028",
    "upkendra": "भादा",
    "employeeName": "श्रीमती उषा शिवहरी कुंजीर",
    "designation": "आशा स्वयंसेविका (ASHA)",
    "category": "ASHA",
    "bsCode": "54F1V5",
    "mobile": "",
    "villageList": [
      "भादा"
    ]
  },
  {
    "id": "EMP_029",
    "upkendra": "भादा",
    "employeeName": "श्रीमती जयश्री नंदकुमार बुरबुरे",
    "designation": "आशा स्वयंसेविका (ASHA)",
    "category": "ASHA",
    "bsCode": "54F1V2",
    "mobile": "",
    "villageList": [
      "भादा"
    ]
  },
  {
    "id": "EMP_030",
    "upkendra": "भादा",
    "employeeName": "श्रीमती रेखा मोहन ढवळे",
    "designation": "आशा स्वयंसेविका (ASHA)",
    "category": "ASHA",
    "bsCode": "54F1V3",
    "mobile": "",
    "villageList": [
      "भादा"
    ]
  },
  {
    "id": "EMP_031",
    "upkendra": "भादा",
    "employeeName": "श्रीमती सुवर्णमाला जगन्नाथ राउत",
    "designation": "आशा स्वयंसेविका (ASHA)",
    "category": "ASHA",
    "bsCode": "54F1V4",
    "mobile": "",
    "villageList": [
      "भादा"
    ]
  },
  {
    "id": "EMP_032",
    "upkendra": "भादा",
    "employeeName": "श्रीमती रुक्मीन किसन गव्हाणे",
    "designation": "आशा स्वयंसेविका (ASHA)",
    "category": "ASHA",
    "bsCode": "54F1V6",
    "mobile": "",
    "villageList": [
      "शिंदेवाडी"
    ]
  },
  {
    "id": "EMP_033",
    "upkendra": "भादा",
    "employeeName": "श्रीमती सिंधू बापू तुंदारे",
    "designation": "आशा स्वयंसेविका (ASHA)",
    "category": "ASHA",
    "bsCode": "54F1V8",
    "mobile": "",
    "villageList": [
      "ब-हाणपूर"
    ]
  },
  {
    "id": "EMP_034",
    "upkendra": "भादा",
    "employeeName": "श्रीमती शिंदे पी एस",
    "designation": "आरोग्य सेविका (ANM)",
    "category": "ANM",
    "bsCode": "54F1",
    "mobile": "",
    "villageList": [
      "भादा",
      "ब-हाणपूर",
      "हाळदुर्ग",
      "शिंदेवाडी"
    ]
  },
  {
    "id": "EMP_035",
    "upkendra": "भादा",
    "employeeName": "श्री रवी लिपारे",
    "designation": "आरोग्य सेवक (MPW)",
    "category": "MPW",
    "bsCode": "54S1A1",
    "mobile": "",
    "villageList": [
      "भादा",
      "ब-हाणपूर",
      "हाळदुर्ग",
      "शिंदेवाडी"
    ]
  },
  {
    "id": "EMP_036",
    "upkendra": "भादा",
    "employeeName": "श्री शिरीष रामहरी शिंदे",
    "designation": "आरोग्य सेवक (MPW)",
    "category": "MPW",
    "bsCode": "54S1A2",
    "mobile": "",
    "villageList": [
      "भादा",
      "ब-हाणपूर",
      "हाळदुर्ग",
      "शिंदेवाडी"
    ]
  },
  {
    "id": "EMP_037",
    "upkendra": "भेटा",
    "employeeName": "श्रीमती पठाण फरीदा अहेमद",
    "designation": "आशा स्वयंसेविका (ASHA)",
    "category": "ASHA",
    "bsCode": "54F3V4",
    "mobile": "",
    "villageList": [
      "आंदोरा"
    ]
  },
  {
    "id": "EMP_038",
    "upkendra": "भेटा",
    "employeeName": "श्रीमती गोसीया गैबी पठाण",
    "designation": "आशा स्वयंसेविका (ASHA)",
    "category": "ASHA",
    "bsCode": "54F3V5",
    "mobile": "",
    "villageList": [
      "आंदोरा"
    ]
  },
  {
    "id": "EMP_039",
    "upkendra": "भेटा",
    "employeeName": "श्रीमती शालू रंगराव वानवडे",
    "designation": "आशा स्वयंसेविका (ASHA)",
    "category": "ASHA",
    "bsCode": "54F3V2",
    "mobile": "",
    "villageList": [
      "भेटा",
      "नाव्होली"
    ]
  },
  {
    "id": "EMP_040",
    "upkendra": "भेटा",
    "employeeName": "श्रीमती पिंपरे चंद्रकला शंकर",
    "designation": "आशा स्वयंसेविका (ASHA)",
    "category": "ASHA",
    "bsCode": "54F3V6",
    "mobile": "",
    "villageList": [
      "भेटा"
    ]
  },
  {
    "id": "EMP_041",
    "upkendra": "भेटा",
    "employeeName": "श्रीमती गंगणे कविता सुरेष",
    "designation": "आशा स्वयंसेविका (ASHA)",
    "category": "ASHA",
    "bsCode": "54F3V3",
    "mobile": "",
    "villageList": [
      "भेटा"
    ]
  },
  {
    "id": "EMP_042",
    "upkendra": "भेटा",
    "employeeName": "श्रीमती चंद्रकला राजेंद्र पुरी",
    "designation": "आशा स्वयंसेविका (ASHA)",
    "category": "ASHA",
    "bsCode": "54F3V6",
    "mobile": "",
    "villageList": [
      "वडजी"
    ]
  },
  {
    "id": "EMP_043",
    "upkendra": "भेटा",
    "employeeName": "श्रीमती जाधव आर सी",
    "designation": "आरोग्य सेविका (ANM)",
    "category": "ANM",
    "bsCode": "54F3",
    "mobile": "",
    "villageList": [
      "भेटा",
      "आंदोरा",
      "वडजी",
      "नाव्होली"
    ]
  },
  {
    "id": "EMP_044",
    "upkendra": "भेटा",
    "employeeName": "श्री परमेश्वर काळे",
    "designation": "आरोग्य सेवक (MPW)",
    "category": "MPW",
    "bsCode": "54S3",
    "mobile": "",
    "villageList": [
      "भेटा",
      "आंदोरा",
      "वडजी",
      "नाव्होली"
    ]
  },
  {
    "id": "EMP_045",
    "upkendra": "लखनगाव",
    "employeeName": "श्रीमती ललिता जनार्धन आडे",
    "designation": "आशा स्वयंसेविका (ASHA)",
    "category": "ASHA",
    "bsCode": "54F7V3",
    "mobile": "",
    "villageList": [
      "सत्तधरवाडी",
      "कुलकर्णी तांडा"
    ]
  },
  {
    "id": "EMP_046",
    "upkendra": "लखनगाव",
    "employeeName": "श्रीमती मनिषा सिद्धाप्पा कवटे",
    "designation": "आशा स्वयंसेविका (ASHA)",
    "category": "ASHA",
    "bsCode": "54F7V4",
    "mobile": "",
    "villageList": [
      "सत्तधरवाडी"
    ]
  },
  {
    "id": "EMP_047",
    "upkendra": "लखनगाव",
    "employeeName": "श्रीमती माधुरी पोफळे",
    "designation": "आशा स्वयंसेविका (ASHA)",
    "category": "ASHA",
    "bsCode": "54F7V7",
    "mobile": "",
    "villageList": [
      "उटी बु."
    ]
  },
  {
    "id": "EMP_048",
    "upkendra": "लखनगाव",
    "employeeName": "श्रीमती रिहाना महताब शेख",
    "designation": "आशा स्वयंसेविका (ASHA)",
    "category": "ASHA",
    "bsCode": "54F7V2",
    "mobile": "",
    "villageList": [
      "उटी बु."
    ]
  },
  {
    "id": "EMP_049",
    "upkendra": "लखनगाव",
    "employeeName": "श्रीमती संगीता प्रेमसिंग राठोड",
    "designation": "आशा स्वयंसेविका (ASHA)",
    "category": "ASHA",
    "bsCode": "54F7V5",
    "mobile": "",
    "villageList": [
      "सोनपट्टी तांडा"
    ]
  },
  {
    "id": "EMP_050",
    "upkendra": "लखनगाव",
    "employeeName": "श्रीमती माया लिंबाजी वाघमारे",
    "designation": "आशा स्वयंसेविका (ASHA)",
    "category": "ASHA",
    "bsCode": "54F7V1",
    "mobile": "",
    "villageList": [
      "लखनगांव"
    ]
  },
  {
    "id": "EMP_051",
    "upkendra": "लखनगाव",
    "employeeName": "श्रीमती ज्योती परशुराम इटकर",
    "designation": "आशा स्वयंसेविका (ASHA)",
    "category": "ASHA",
    "bsCode": "54F7V6",
    "mobile": "",
    "villageList": [
      "लखनगांव"
    ]
  },
  {
    "id": "EMP_052",
    "upkendra": "लखनगाव",
    "employeeName": "श्रीमती जगताप ए टी",
    "designation": "आरोग्य सेविका (ANM)",
    "category": "ANM",
    "bsCode": "54F7",
    "mobile": "",
    "villageList": [
      "लखनगांव",
      "सोनपट्टी तांडा",
      "उटी बु.",
      "सत्तधरवाडी",
      "कुलकर्णी तांडा"
    ]
  },
  {
    "id": "EMP_053",
    "upkendra": "लखनगाव",
    "employeeName": "श्री वनराज जाधव",
    "designation": "आरोग्य सेवक (MPW)",
    "category": "MPW",
    "bsCode": "54S7",
    "mobile": "",
    "villageList": [
      "लखनगांव",
      "सोनपट्टी तांडा",
      "उटी बु.",
      "सत्तधरवाडी",
      "कुलकर्णी तांडा"
    ]
  },
  {
    "id": "EMP_053A",
    "upkendra": "लखनगाव",
    "employeeName": "श्री उजळंबे राजेंद्र सुभाष",
    "designation": "आरोग्य सेवक (MPW)",
    "category": "MPW",
    "bsCode": "54S7A1",
    "mobile": "",
    "villageList": [
      "लखनगांव",
      "सोनपट्टी तांडा",
      "उटी बु.",
      "सत्तधरवाडी",
      "कुलकर्णी तांडा"
    ]
  },
  {
    "id": "EMP_053B",
    "upkendra": "लखनगाव",
    "employeeName": "श्री रवी लिपारे",
    "designation": "आरोग्य सेवक (MPW)",
    "category": "MPW",
    "bsCode": "54S7",
    "mobile": "",
    "villageList": [
      "लखनगांव",
      "सोनपट्टी तांडा",
      "उटी बु.",
      "सत्तधरवाडी",
      "कुलकर्णी तांडा"
    ]
  },
  {
    "id": "EMP_054",
    "upkendra": "शिवली",
    "employeeName": "श्रीमती रईसा आब्दूल तांबोळी",
    "designation": "आशा स्वयंसेविका (ASHA)",
    "category": "ASHA",
    "bsCode": "54F4V2",
    "mobile": "",
    "villageList": [
      "शिवली"
    ]
  },
  {
    "id": "EMP_055",
    "upkendra": "शिवली",
    "employeeName": "श्रीमती उर्मीला मधुकर नागरसोगे",
    "designation": "आशा स्वयंसेविका (ASHA)",
    "category": "ASHA",
    "bsCode": "54F4V4",
    "mobile": "",
    "villageList": [
      "शिवली"
    ]
  },
  {
    "id": "EMP_056",
    "upkendra": "शिवली",
    "employeeName": "श्रीमती तारामती चंद्रकांत फुटाणे",
    "designation": "आशा स्वयंसेविका (ASHA)",
    "category": "ASHA",
    "bsCode": "54F4V3",
    "mobile": "",
    "villageList": [
      "शिवली"
    ]
  },
  {
    "id": "EMP_057",
    "upkendra": "शिवली",
    "employeeName": "श्रीमती जयश्री हरिश्चंद्र जाधव",
    "designation": "आशा स्वयंसेविका (ASHA)",
    "category": "ASHA",
    "bsCode": "54F4V5",
    "mobile": "",
    "villageList": [
      "वरवडा"
    ]
  },
  {
    "id": "EMP_058",
    "upkendra": "शिवली",
    "employeeName": "श्रीमती पल्लवी किशोर कदम",
    "designation": "आशा स्वयंसेविका (ASHA)",
    "category": "ASHA",
    "bsCode": "54F4V7",
    "mobile": "",
    "villageList": [
      "वरवडा"
    ]
  },
  {
    "id": "EMP_059",
    "upkendra": "शिवली",
    "employeeName": "श्रीमती माया बाबुराव माने",
    "designation": "आशा स्वयंसेविका (ASHA)",
    "category": "ASHA",
    "bsCode": "54F4V6",
    "mobile": "",
    "villageList": [
      "जायफळ"
    ]
  },
  {
    "id": "EMP_060",
    "upkendra": "शिवली",
    "employeeName": "श्रीमती आशा राजाराम पावले",
    "designation": "आशा स्वयंसेविका (ASHA)",
    "category": "ASHA",
    "bsCode": "54F4V1",
    "mobile": "",
    "villageList": [
      "शिवली"
    ]
  },
  {
    "id": "EMP_061",
    "upkendra": "शिवली",
    "employeeName": "श्रीमती पंचशीला गोरख भांगे",
    "designation": "आरोग्य सेविका (ANM)",
    "category": "ANM",
    "bsCode": "54F4",
    "mobile": "",
    "villageList": [
      "शिवली",
      "वरवडा",
      "जायफळ"
    ]
  },
  {
    "id": "EMP_062",
    "upkendra": "शिवली",
    "employeeName": "श्री अनिल एकनाथ भराडे",
    "designation": "आरोग्य सेवक (MPW)",
    "category": "MPW",
    "bsCode": "54S4",
    "mobile": "",
    "villageList": [
      "शिवली",
      "वरवडा",
      "जायफळ"
    ]
  },
  {
    "id": "EMP_063",
    "upkendra": "प्रा.आ.केंद्र",
    "employeeName": "बाह्य रुग्ण विभाग",
    "designation": "वैद्यकीय अधिकारी (OPD)",
    "category": "MO",
    "bsCode": "54P",
    "mobile": "",
    "villageList": [
      "Phc भादा"
    ]
  }
];

// ================= TRANSFER FACILITY HISTORY =================
export const transferHistory = [];

// Synchronize masterData whenever employeeMaster changes
export function syncMasterData() {
  masterData.length = 0;
  employeeMaster.forEach(e => {
    masterData.push({
      upkendra: e.upkendra,
      employeeName: e.employeeName,
      designation: e.designation,
      bsCode: e.bsCode,
      villageList: Array.isArray(e.villageList) ? [...e.villageList] : []
    });
  });
}

// Transfer an employee to another village / subcenter and update all linked records
export function transferEmployee(empIdOrObj, targetUpkendra, newVillages, newBsCode, reason, orderNo) {
  let empId = empIdOrObj;
  if (typeof empIdOrObj === 'object' && empIdOrObj !== null) {
    empId = empIdOrObj.employeeId || empIdOrObj.id;
    targetUpkendra = empIdOrObj.toSubcenter || empIdOrObj.targetUpkendra || empIdOrObj.subcenter;
    newVillages = empIdOrObj.appliedVillages || empIdOrObj.newVillages || empIdOrObj.villageList || empIdOrObj.targetVillages || empIdOrObj.targetVillage;
    newBsCode = empIdOrObj.newBsCode || empIdOrObj.bsCode;
    reason = empIdOrObj.reason;
    orderNo = empIdOrObj.orderNumber || empIdOrObj.orderNo;
  }

  // Normalize newVillages to array
  if (typeof newVillages === 'string') {
    newVillages = newVillages.split(',').map(s => s.trim()).filter(Boolean);
  }
  if (!Array.isArray(newVillages)) {
    newVillages = [];
  }

  const emp = employeeMaster.find(e => e.id === empId || e.employeeName === empId);
  if (!emp) return { success: false, message: `कर्मचारी '${empId}' सापडला नाही.` };

  const prevUpkendra = emp.upkendra || "भादा";
  const prevVillages = [...(emp.villageList || [])];
  const now = new Date();
  const pad = n => String(n).padStart(2, '0');
  const dateFormatted = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()}`;

  // If targetUpkendra is not specified, automatically deduce it from the first selected target village
  if (!targetUpkendra && newVillages.length > 0) {
    const vMatch = villagesMaster.find(v => v.villageName === newVillages[0]);
    if (vMatch && vMatch.subcenter) {
      targetUpkendra = vMatch.subcenter;
    } else {
      targetUpkendra = prevUpkendra;
    }
  }
  if (!targetUpkendra) {
    targetUpkendra = prevUpkendra;
  }

  // 1. UPDATE EMPLOYEE MASTER
  emp.upkendra = targetUpkendra.trim();
  emp.villageList = [...newVillages];
  if (newBsCode && String(newBsCode).trim()) {
    emp.bsCode = String(newBsCode).trim();
  }

  // 2. UPDATE LINKED RECORDS IN villagesMaster
  // Remove employee from previously assigned villages if they are no longer assigned
  prevVillages.forEach(pVilName => {
    if (!newVillages.includes(pVilName)) {
      const vRec = villagesMaster.find(v => v.villageName === pVilName);
      if (vRec) {
        if (Array.isArray(vRec.assignedEmployees)) {
          vRec.assignedEmployees = vRec.assignedEmployees.filter(en => {
            if (en === emp.employeeName) return false;
            if (en.startsWith(emp.employeeName + ' ') || en.startsWith(emp.employeeName + '(')) return false;
            return true;
          });
        }
        if (vRec.ashaName && (vRec.ashaName === emp.employeeName || vRec.ashaName.startsWith(emp.employeeName))) {
          vRec.ashaName = "";
        }
      }
    }
  });

  // Add employee to new villages in villagesMaster
  newVillages.forEach(nVilName => {
    let vRec = villagesMaster.find(v => v.villageName === nVilName);
    if (vRec) {
      if (!Array.isArray(vRec.assignedEmployees)) {
        vRec.assignedEmployees = [];
      }
      if (!vRec.assignedEmployees.includes(emp.employeeName)) {
        vRec.assignedEmployees.push(emp.employeeName);
      }
      // If the employee is an ASHA worker, update ashaName for this village
      if (emp.category === 'ASHA' || (emp.designation && emp.designation.includes('आशा'))) {
        vRec.ashaName = emp.employeeName;
      }
    } else {
      // If village is new to the master, add it to villagesMaster
      villagesMaster.push({
        id: `VIL_${Date.now()}_${Math.floor(Math.random()*1000)}`,
        villageName: nVilName,
        subcenter: emp.upkendra,
        population: 0,
        houses: 0,
        annualSmearTarget: 0,
        ashaName: (emp.category === 'ASHA' ? emp.employeeName : ''),
        assignedEmployees: [emp.employeeName]
      });
    }
  });

  // 3. UPDATE LINKED RECORDS IN subcenterMaster
  // Ensure target subcenter has the new villages
  if (emp.upkendra) {
    let sc = subcenterMaster.find(s => s.name === emp.upkendra);
    if (sc) {
      if (!Array.isArray(sc.villages)) sc.villages = [];
      newVillages.forEach(vName => {
        if (!sc.villages.includes(vName)) sc.villages.push(vName);
      });
    }
  }

  // 4. RECORD AUDIT LOG IN transferHistory
  const logEntry = {
    id: `TR_${Date.now()}`,
    timestamp: now.toISOString(),
    dateFormatted,
    employeeName: emp.employeeName,
    designation: emp.designation,
    fromUpkendra: prevUpkendra,
    toUpkendra: emp.upkendra,
    previousVillages: prevVillages,
    newVillages: [...(emp.villageList || [])],
    bsCode: emp.bsCode,
    reason: reason || "प्रशासकीय बदली व कार्यक्षेत्र गाव वाटप",
    orderNo: orderNo || `PHC/बदली/${Date.now().toString().slice(-4)}`,
    transferredBy: "वैद्यकीय अधिकारी, प्रा.आ.केंद्र भादा"
  };
  transferHistory.unshift(logEntry);

  // 5. SYNCHRONIZE WITH masterData FOR LEGACY REGISTERS & REPORTS
  syncMasterData();
  saveDbToDisk();

  return {
    success: true,
    message: `${emp.employeeName} (${emp.designation}) यांची नवीन गाव(वे) [${emp.villageList.join(', ') || 'गावे नाही'}] व उपकेंद्र ${emp.upkendra} येथे नियुक्ती यशस्वीरित्या झाली असून सर्व संबंधित रेकॉर्ड्स अद्ययावत केले आहेत!`,
    employee: emp,
    transferLog: logEntry,
    linkedRecordsUpdated: {
      employeeMaster: true,
      villagesMaster: true,
      subcenterMaster: true,
      masterData: true,
      transferHistory: true
    }
  };
}

// Update villages applied for an employee and sync linked records
export function updateEmployeeVillages(empId, villageList) {
  const emp = employeeMaster.find(e => e.id === empId || e.employeeName === empId);
  if (!emp) return { success: false, message: `कर्मचारी '${empId}' सापडला नाही.` };

  const prevVillages = [...(emp.villageList || [])];
  const newVillages = Array.isArray(villageList) ? [...villageList] : [];
  emp.villageList = newVillages;

  // Sync villagesMaster assignedEmployees
  prevVillages.forEach(pVilName => {
    if (!newVillages.includes(pVilName)) {
      const vRec = villagesMaster.find(v => v.villageName === pVilName);
      if (vRec && Array.isArray(vRec.assignedEmployees)) {
        vRec.assignedEmployees = vRec.assignedEmployees.filter(en => {
          if (en === emp.employeeName) return false;
          if (en.startsWith(emp.employeeName + ' ') || en.startsWith(emp.employeeName + '(')) return false;
          return true;
        });
      }
      if (vRec && vRec.ashaName && (vRec.ashaName === emp.employeeName || vRec.ashaName.startsWith(emp.employeeName))) {
        vRec.ashaName = "";
      }
    }
  });

  newVillages.forEach(nVilName => {
    let vRec = villagesMaster.find(v => v.villageName === nVilName);
    if (vRec) {
      if (!Array.isArray(vRec.assignedEmployees)) vRec.assignedEmployees = [];
      if (!vRec.assignedEmployees.includes(emp.employeeName)) {
        vRec.assignedEmployees.push(emp.employeeName);
      }
      if (emp.category === 'ASHA' || (emp.designation && emp.designation.includes('आशा'))) {
        vRec.ashaName = emp.employeeName;
      }
    }
  });

  syncMasterData();
  saveDbToDisk();
  return {
    success: true,
    message: `${emp.employeeName} यांच्या कार्यक्षेत्र गावांची यादी व लिंक्ड रेकॉर्ड्स अद्ययावत झाली!`,
    employee: emp
  };
}

// Save or add employee
export function saveEmployee(data) {
  if (!data) return { success: false, message: "डेटा आवश्यक आहे." };
  const empName = (data.employeeName || data.name || "").trim();
  if (!empName) return { success: false, message: "कर्मचारी नाव आवश्यक आहे." };
  data.employeeName = empName;
  if (data.appliedVillages && !data.villageList) data.villageList = data.appliedVillages;

  let emp = employeeMaster.find(e => e.id === data.id);
  if (!emp && data.id) {
    emp = employeeMaster.find(e => e.employeeName === data.employeeName && e.upkendra === data.upkendra);
  }

  const category = data.category || (
    data.designation?.includes("सेविका") || data.designation?.includes("ANM") ? "ANM" :
    data.designation?.includes("आशा") || data.designation?.includes("ASHA") ? "ASHA" :
    data.designation?.includes("वैद्यकीय") || data.designation?.includes("MO") ? "MO" : "MPW"
  );

  if (emp) {
    emp.employeeName = data.employeeName.trim();
    if (data.upkendra) emp.upkendra = data.upkendra.trim();
    if (data.designation) emp.designation = data.designation.trim();
    emp.category = category;
    if (data.bsCode) emp.bsCode = data.bsCode.trim();
    if (data.mobile) emp.mobile = data.mobile.trim();
    if (Array.isArray(data.villageList)) emp.villageList = [...data.villageList];
  } else {
    const newId = data.id || `EMP_${Date.now()}`;
    emp = {
      id: newId,
      upkendra: data.upkendra || "भादा",
      employeeName: data.employeeName.trim(),
      designation: data.designation || (category === 'ANM' ? 'आरोग्य सेविका (ANM)' : category === 'ASHA' ? 'आशा स्वयंसेविका (ASHA)' : 'आरोग्य सेवक (MPW)'),
      category: category,
      bsCode: data.bsCode || String(100 + employeeMaster.length + 1),
      mobile: data.mobile || "",
      villageList: Array.isArray(data.villageList) ? [...data.villageList] : []
    };
    employeeMaster.push(emp);
  }

  syncMasterData();
  saveDbToDisk();
  return { success: true, message: `कर्मचारी '${emp.employeeName}' यशस्वीरित्या जतन झाले!`, employee: emp };
}

// Delete employee
export function deleteEmployee(empId) {
  const idx = employeeMaster.findIndex(e => e.id === empId || e.employeeName === empId);
  if (idx === -1) return { success: false, message: "कर्मचारी सापडला नाही." };
  const removed = employeeMaster.splice(idx, 1)[0];
  syncMasterData();
  saveDbToDisk();
  return { success: true, message: `कर्मचारी '${removed.employeeName}' हटवण्यात आले.`, employee: removed };
}

// Save or add subcenter
export function saveSubcenter(data) {
  if (!data || !data.name) return { success: false, message: "उपकेंद्र नाव आवश्यक आहे." };
  let sc = subcenterMaster.find(s => s.id === data.id || s.name === data.name);
  if (sc) {
    sc.name = data.name.trim();
    if (data.headquarter) sc.headquarter = data.headquarter.trim();
    if (data.contactPerson) sc.contactPerson = data.contactPerson.trim();
    if (data.contactPhone) sc.contactPhone = data.contactPhone.trim();
    if (data.population != null) sc.population = parseInt(data.population) || 0;
    if (data.houses != null) sc.houses = parseInt(data.houses) || 0;
    if (Array.isArray(data.villages)) sc.villages = [...data.villages];
  } else {
    sc = {
      id: data.id || `SC_${Date.now()}`,
      name: data.name.trim(),
      headquarter: data.headquarter || data.name.trim(),
      contactPerson: data.contactPerson || "",
      contactPhone: data.contactPhone || "",
      population: parseInt(data.population) || 0,
      houses: parseInt(data.houses) || 0,
      villages: Array.isArray(data.villages) ? [...data.villages] : []
    };
    subcenterMaster.push(sc);
  }
  saveDbToDisk();
  return { success: true, message: `उपकेंद्र '${sc.name}' यशस्वीरित्या जतन झाले!`, subcenter: sc };
}

// Delete subcenter
export function deleteSubcenter(scId) {
  const idx = subcenterMaster.findIndex(s => s.id === scId || s.name === scId);
  if (idx === -1) return { success: false, message: "उपकेंद्र सापडले नाही." };
  const removed = subcenterMaster.splice(idx, 1)[0];
  saveDbToDisk();
  return { success: true, message: `उपकेंद्र '${removed.name}' हटवण्यात आले.`, subcenter: removed };
}

// Save or add village
export function saveVillage(data) {
  if (!data) return { success: false, message: "डेटा आवश्यक आहे." };
  const vilName = (data.villageName || data.name || "").trim();
  if (!vilName) return { success: false, message: "गावाचे नाव आवश्यक आहे." };
  data.villageName = vilName;
  if (data.upkendra && !data.subcenter) data.subcenter = data.upkendra;
  if (data.target != null && data.annualSmearTarget == null) data.annualSmearTarget = data.target;
  if (data.ashaWorker && !data.ashaName) data.ashaName = data.ashaWorker;

  let vil = villagesMaster.find(v => v.id === data.id || (v.villageName === data.villageName && v.subcenter === data.subcenter));
  if (vil) {
    vil.villageName = data.villageName.trim();
    if (data.subcenter) vil.subcenter = data.subcenter.trim();
    if (data.population != null) vil.population = parseInt(data.population) || 0;
    if (data.houses != null) vil.houses = parseInt(data.houses) || 0;
    if (data.annualSmearTarget != null) vil.annualSmearTarget = parseInt(data.annualSmearTarget) || 0;
    if (data.ashaName) vil.ashaName = data.ashaName.trim();
    if (Array.isArray(data.assignedEmployees)) vil.assignedEmployees = [...data.assignedEmployees];
  } else {
    vil = {
      id: data.id || `VIL_${Date.now()}`,
      villageName: data.villageName.trim(),
      subcenter: data.subcenter || "भादा",
      population: parseInt(data.population) || 0,
      houses: parseInt(data.houses) || 0,
      annualSmearTarget: parseInt(data.annualSmearTarget) || Math.round((parseInt(data.population) || 0) * 0.1),
      ashaName: data.ashaName || "",
      assignedEmployees: Array.isArray(data.assignedEmployees) ? [...data.assignedEmployees] : []
    };
    villagesMaster.push(vil);
  }
  saveDbToDisk();
  return { success: true, message: `गाव '${vil.villageName}' यशस्वीरित्या जतन झाले!`, village: vil };
}

// Delete village
export function deleteVillage(vilId) {
  const idx = villagesMaster.findIndex(v => v.id === vilId || v.villageName === vilId);
  if (idx === -1) return { success: false, message: "गाव सापडले नाही." };
  const removed = villagesMaster.splice(idx, 1)[0];
  saveDbToDisk();
  return { success: true, message: `गाव '${removed.villageName}' हटवण्यात आले.`, village: removed };
}

// Import Google Sheet / CSV Master Data
export function importMasterDataFromCsv(csvText) {
  if (!csvText || typeof csvText !== 'string') {
    return { success: false, message: "CSV डेटा रिकामा आहे." };
  }

  const lines = csvText.trim().split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length < 2) {
    return { success: false, message: "CSV मध्ये किमान एक डेटा ओळ असणे आवश्यक आहे." };
  }

  function parseCsvLine(line) {
    let inQuotes = false;
    let token = "";
    const cols = [];
    for (let j = 0; j < line.length; j++) {
      const c = line[j];
      if (c === '"') inQuotes = !inQuotes;
      else if (c === ',' && !inQuotes) {
        cols.push(token.trim());
        token = "";
      } else {
        token += c;
      }
    }
    cols.push(token.trim());
    return cols;
  }

  const headerCols = parseCsvLine(lines[0]).map(c => c.replace(/^"|"$/g, '').trim().toLowerCase());
  let upkendraIdx = headerCols.findIndex(c => c.includes('उपकेंद्र') || c.includes('subcenter'));
  let nameIdx = headerCols.findIndex(c => c.includes('कर्मचारी') || c.includes('name'));
  let desigIdx = headerCols.findIndex(c => c.includes('पदनाम') || c.includes('designation'));
  let codeIdx = headerCols.findIndex(c => c.includes('code') || c.includes('कोड'));
  let vilIdx = headerCols.findIndex(c => c.includes('गाव') || c.includes('village'));

  if (upkendraIdx === -1) upkendraIdx = 0;
  if (nameIdx === -1) nameIdx = 1;
  if (desigIdx === -1) desigIdx = 2;
  if (codeIdx === -1) codeIdx = 3;
  if (vilIdx === -1) vilIdx = 4;

  let addedCount = 0;
  let updatedCount = 0;

  for (let i = 1; i < lines.length; i++) {
    const cols = parseCsvLine(lines[i]).map(c => c.replace(/^"|"$/g, '').trim());
    if (cols.length < 2 || !cols[nameIdx]) continue;

    const upkendra = cols[upkendraIdx] || "भादा";
    const employeeName = cols[nameIdx];
    const rawDesig = cols[desigIdx] || "";
    const bsCode = cols[codeIdx] || "";
    const villagesRaw = cols[vilIdx] || "";
    const villageList = villagesRaw.split(',').map(v => v.trim()).filter(Boolean);

    let category = "MPW";
    let designation = "आरोग्य सेवक (MPW)";
    if (rawDesig.includes("आशा") || rawDesig.toLowerCase().includes("asha")) {
      category = "ASHA";
      designation = "आशा स्वयंसेविका (ASHA)";
    } else if (rawDesig.includes("सेविका") || rawDesig.toLowerCase().includes("anm")) {
      category = "ANM";
      designation = "आरोग्य सेविका (ANM)";
    } else if (rawDesig.includes("वैद्यकीय") || rawDesig.includes("प्रा.आ.केंद्र") || rawDesig.toLowerCase().includes("mo") || rawDesig.includes("रुग्ण")) {
      category = "MO";
      designation = "वैद्यकीय अधिकारी (OPD)";
    }

    let emp = employeeMaster.find(e => e.employeeName.trim() === employeeName && e.upkendra.trim() === upkendra);
    if (!emp) {
      emp = employeeMaster.find(e => e.employeeName.trim() === employeeName);
    }

    if (emp) {
      emp.upkendra = upkendra;
      emp.employeeName = employeeName;
      emp.designation = designation;
      emp.category = category;
      if (bsCode) emp.bsCode = bsCode;
      if (villageList.length > 0) emp.villageList = villageList;
      updatedCount++;
    } else {
      emp = {
        id: `EMP_${String(employeeMaster.length + 1).padStart(3, '0')}`,
        upkendra: upkendra,
        employeeName: employeeName,
        designation: designation,
        category: category,
        bsCode: bsCode || String(100 + employeeMaster.length + 1),
        mobile: "",
        villageList: villageList
      };
      employeeMaster.push(emp);
      addedCount++;
    }

    // Sync into villagesMaster
    villageList.forEach(vName => {
      let vRec = villagesMaster.find(v => v.villageName === vName);
      if (!vRec) {
        vRec = {
          id: `VIL_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          villageName: vName,
          subcenter: upkendra,
          population: 0,
          houses: 0,
          annualSmearTarget: 0,
          ashaName: category === 'ASHA' ? employeeName : "",
          assignedEmployees: [`${employeeName} (${category})`]
        };
        villagesMaster.push(vRec);
      } else {
        if (!Array.isArray(vRec.assignedEmployees)) vRec.assignedEmployees = [];
        const label = `${employeeName} (${category})`;
        if (!vRec.assignedEmployees.includes(label) && !vRec.assignedEmployees.includes(employeeName)) {
          vRec.assignedEmployees.push(label);
        }
        if (category === 'ASHA' && !vRec.ashaName) {
          vRec.ashaName = employeeName;
        }
      }
    });
  }

  syncMasterData();
  saveDbToDisk();

  return {
    success: true,
    totalProcessed: lines.length - 1,
    added: addedCount,
    updated: updatedCount,
    totalEmployees: employeeMaster.length,
    message: `गुगल शीट डेटा यशस्वीरित्या इम्पोर्ट झाला! (एकूण ${lines.length - 1} नोंदी: ${addedCount} नवीन जोडले, ${updatedCount} अद्ययावत केले, एकूण कर्मचारी: ${employeeMaster.length})`
  };
}


const MONTH_SPECS_2026 = [
  { name: "जानेवारी २०२६", days: 31, f1EndDay: 15 },
  { name: "फेब्रुवारी २०२६", days: 28, f1EndDay: 14 },
  { name: "मार्च २०२६", days: 31, f1EndDay: 15 },
  { name: "एप्रिल २०२६", days: 30, f1EndDay: 15 },
  { name: "मे २०२६", days: 31, f1EndDay: 15 },
  { name: "जून २०२६", days: 30, f1EndDay: 15 },
  { name: "जुलै २०२६", days: 31, f1EndDay: 15 },
  { name: "ऑगस्ट २०२६", days: 31, f1EndDay: 15 },
  { name: "सप्टेंबर २०२६", days: 30, f1EndDay: 15 },
  { name: "ऑक्टोबर २०२६", days: 31, f1EndDay: 15 },
  { name: "नोव्हेंबर २०२६", days: 30, f1EndDay: 15 },
  { name: "डिसेंबर २०२६", days: 31, f1EndDay: 15 }
];

export const monthMaster = MONTH_SPECS_2026.map((m, idx) => ({
  name: m.name,
  f1Start: new Date(2026, idx, 1),
  f1End: new Date(2026, idx, m.f1EndDay),
  f2Start: new Date(2026, idx, m.f1EndDay + 1),
  f2End: new Date(2026, idx, m.days, 23, 59, 59),
  newOpd: 0,
  progNewOpd: 0,
  mpwHomeVisits: 0,
  progMpwHomeVisits: 0,
  anmHomeVisits: 0,
  progAnmHomeVisits: 0,
  ashaHomeVisits: 0,
  progAshaHomeVisits: 0,
  feverCases: 0,
  progFeverCases: 0,
  bloodSmears: 0,
  progBloodSmears: 0,
  treatedCases: 0,
  progTreatedCases: 0,
  chloroquineSpent: 0,
  progChloroquineSpent: 0
}));

export function getOpdBsVillagewiseSummary(monthName) {
  const clean = s => String(s || '').trim();
  let mIdx = monthMaster.findIndex(m => clean(m.name) === clean(monthName));
  if (mIdx === -1) mIdx = 8; // Default September 2026
  const monthObj = monthMaster[mIdx];
  const startDate = monthObj.f1Start;
  const endDate = monthObj.f2End;
  const yearStart = monthMaster[0].f1Start;

  function isOpdEntry(upkendra, employeeName, designation) {
    const up = String(upkendra || '').toLowerCase();
    const emp = String(employeeName || '').toLowerCase();
    const des = String(designation || '').toLowerCase();
    return (
      up.includes('opd') || up.includes('दवाखाना') || up.includes('बाह्य') ||
      emp.includes('opd') || emp.includes('वैद्यकीय') || emp.includes('mo') ||
      des.includes('वैद्यकीय') || des.includes('mo') || des.includes('opd')
    );
  }

  // Filter villageDetails for current month
  const monthVillageRows = villageDetails.filter(v => {
    const d = new Date(v[2]);
    return d >= startDate && d <= endDate;
  });

  // Filter villageDetails for YTD (from Jan 1 to end of current month)
  const ytdVillageRows = villageDetails.filter(v => {
    const d = new Date(v[2]);
    return d >= yearStart && d <= endDate;
  });

  // Filter bsDataEntry for current month
  const monthBsRows = bsDataEntry.filter(r => {
    const d = new Date(r[1]);
    return d >= startDate && d <= endDate;
  });

  // Filter bsDataEntry for YTD
  const ytdBsRows = bsDataEntry.filter(r => {
    const d = new Date(r[1]);
    return d >= yearStart && d <= endDate;
  });

  let monthlyTotal = 0;
  let monthlyMale = 0;
  let monthlyFemale = 0;
  const monthlyVillagesMap = {};

  monthVillageRows.forEach(v => {
    // v: [uniqueId, employeeName, dateObj, villageName, sampleCount, maleCount, femaleCount, upkendra]
    const upkendra = v[7];
    const employeeName = v[1];
    const empData = (typeof employeeMaster !== 'undefined' ? employeeMaster.find(e => e.employeeName === employeeName || e.name === employeeName) : null) ||
                    (typeof masterData !== 'undefined' ? masterData.find(m => m.employeeName === employeeName) : null) || {};
    const designation = empData.designation || '';

    if (isOpdEntry(upkendra, employeeName, designation)) {
      const count = parseInt(v[4]) || 0;
      const male = parseInt(v[5]) || 0;
      const female = parseInt(v[6]) || 0;
      monthlyTotal += count;
      monthlyMale += male;
      monthlyFemale += female;

      const vName = v[3] || 'भादा (OPD)';
      if (!monthlyVillagesMap[vName]) {
        monthlyVillagesMap[vName] = { villageName: vName, count: 0, male: 0, female: 0, upkendra: upkendra || 'भादा (OPD)' };
      }
      monthlyVillagesMap[vName].count += count;
      monthlyVillagesMap[vName].male += male;
      monthlyVillagesMap[vName].female += female;
    }
  });

  // Check any bsDataEntry rows not already covered by villageDetails
  monthBsRows.forEach(r => {
    const hasVil = monthVillageRows.some(v => v[0] === r[0]);
    if (!hasVil && isOpdEntry(r[2], r[3], r[4])) {
      const count = parseInt(r[9]) || 0;
      const m = Math.floor(count * 0.52);
      const f = count - m;
      monthlyTotal += count;
      monthlyMale += m;
      monthlyFemale += f;

      const vName = 'भादा (OPD)';
      if (!monthlyVillagesMap[vName]) {
        monthlyVillagesMap[vName] = { villageName: vName, count: 0, male: 0, female: 0, upkendra: r[2] || 'भादा (OPD)' };
      }
      monthlyVillagesMap[vName].count += count;
      monthlyVillagesMap[vName].male += m;
      monthlyVillagesMap[vName].female += f;
    }
  });

  // Calculate YTD totals from Jan 1 up to end of selected month
  let ytdTotal = 0;
  let ytdMale = 0;
  let ytdFemale = 0;

  ytdVillageRows.forEach(v => {
    const upkendra = v[7];
    const employeeName = v[1];
    const empData = (typeof employeeMaster !== 'undefined' ? employeeMaster.find(e => e.employeeName === employeeName || e.name === employeeName) : null) ||
                    (typeof masterData !== 'undefined' ? masterData.find(m => m.employeeName === employeeName) : null) || {};
    const designation = empData.designation || '';

    if (isOpdEntry(upkendra, employeeName, designation)) {
      const count = parseInt(v[4]) || 0;
      const male = parseInt(v[5]) || 0;
      const female = parseInt(v[6]) || 0;
      ytdTotal += count;
      ytdMale += male;
      ytdFemale += female;
    }
  });

  ytdBsRows.forEach(r => {
    const hasVil = ytdVillageRows.some(v => v[0] === r[0]);
    if (!hasVil && isOpdEntry(r[2], r[3], r[4])) {
      const count = parseInt(r[9]) || 0;
      const m = Math.floor(count * 0.52);
      const f = count - m;
      ytdTotal += count;
      ytdMale += m;
      ytdFemale += f;
    }
  });

  const priorTotal = Math.max(0, ytdTotal - monthlyTotal);

  return {
    monthName: monthObj.name,
    monthlyTotal,
    monthlyMale,
    monthlyFemale,
    ytdTotal,
    ytdMale,
    ytdFemale,
    priorTotal,
    villages: Object.values(monthlyVillagesMap)
  };
}

// Initial pre-seeded Blood Slide Entries (BsDataEntry)
// [uniqueId, dateObj, upkendra, employeeName, designation, bsCode, bundleNumber, pasun, paraynt, total]
export const bsDataEntry = [];

// Initial pre-seeded Village Details (VillageDetails)
// [uniqueId, employeeName, dateObj, villageName, sampleCount, maleCount, femaleCount, upkendra]
export const villageDetails = [];

// Dummy data seeding removed - system starts with clean empty datasets and syncs with real-time data
export function seedInitialMalariaData() {
  console.log('[Store] seedInitialMalariaData called: Real-time mode active. No dummy data seeded.');
  return;
}

export function clearAllTransactionData() {
  bsDataEntry.length = 0;
  villageDetails.length = 0;
  transferHistory.length = 0;
  monthMaster.forEach(m => {
    m.newOpd = 0;
    m.progNewOpd = 0;
    m.mpwHomeVisits = 0;
    m.progMpwHomeVisits = 0;
    m.anmHomeVisits = 0;
    m.progAnmHomeVisits = 0;
    m.ashaHomeVisits = 0;
    m.progAshaHomeVisits = 0;
    m.feverCases = 0;
    m.progFeverCases = 0;
    m.bloodSmears = 0;
    m.progBloodSmears = 0;
    m.treatedCases = 0;
    m.progTreatedCases = 0;
    m.chloroquineSpent = 0;
    m.progChloroquineSpent = 0;
  });
  saveDbToDisk();
  return { success: true, message: "सर्व तात्पुरता/नमुना डेटा यशस्वीरित्या काढून टाकण्यात आला. प्रणाली रिअल-टाईम नोंदींसाठी सज्ज आहे." };
}

// ================= CSV BULK IMPORT HANDLERS =================

// 1. Import BsDataEntry CSV (कर्मचारीनिहाय रक्त नमुना डेटा)
export function importBsDataEntryCsv(csvText, replace = false) {
  if (!csvText || typeof csvText !== 'string') {
    return { success: false, message: "CSV मजकूर रिकामा आहे." };
  }

  const lines = csvText.trim().split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length < 2) {
    return { success: false, message: "किमान एक डेटा ओळ आवश्यक आहे." };
  }

  function parseLine(line) {
    let inQuotes = false;
    let token = "";
    const cols = [];
    for (let j = 0; j < line.length; j++) {
      const c = line[j];
      if (c === '"') inQuotes = !inQuotes;
      else if (c === ',' && !inQuotes) {
        cols.push(token.trim());
        token = "";
      } else {
        token += c;
      }
    }
    cols.push(token.trim());
    return cols;
  }

  if (replace) {
    bsDataEntry.length = 0;
  }

  const header = parseLine(lines[0]).map(c => c.replace(/^"|"$/g, '').trim().toLowerCase());
  let idIdx = header.findIndex(c => c.includes('id') || c.includes('क्रमांक') || c.includes('अ.क्र.'));
  let dateIdx = header.findIndex(c => c.includes('date') || c.includes('तारीख') || c.includes('दिनांक'));
  let upkendraIdx = header.findIndex(c => c.includes('upkendra') || c.includes('उपकेंद्र'));
  let nameIdx = header.findIndex(c => c.includes('name') || c.includes('कर्मचारी') || c.includes('नाव'));
  let desigIdx = header.findIndex(c => c.includes('designation') || c.includes('पद') || c.includes('पदनाम'));
  let codeIdx = header.findIndex(c => c.includes('code') || c.includes('कोड') || c.includes('bs code'));
  let bundleIdx = header.findIndex(c => c.includes('bundle') || c.includes('बंडल'));
  let pasunIdx = header.findIndex(c => c.includes('pasun') || c.includes('पासून') || c.includes('from'));
  let parayntIdx = header.findIndex(c => c.includes('paraynt') || c.includes('पर्यंत') || c.includes('to'));
  let totalIdx = header.findIndex(c => c.includes('total') || c.includes('एकूण') || c.includes('नमुने'));

  if (dateIdx === -1) dateIdx = 1;
  if (upkendraIdx === -1) upkendraIdx = 2;
  if (nameIdx === -1) nameIdx = 3;
  if (desigIdx === -1) desigIdx = 4;
  if (codeIdx === -1) codeIdx = 5;
  if (bundleIdx === -1) bundleIdx = 6;
  if (pasunIdx === -1) pasunIdx = 7;
  if (parayntIdx === -1) parayntIdx = 8;
  if (totalIdx === -1) totalIdx = 9;

  let added = 0;
  let validDateCount = 0;
  let autoNormalizedCount = 0;
  let invalidDateCount = 0;

  for (let i = 1; i < lines.length; i++) {
    const cols = parseLine(lines[i]).map(c => c.replace(/^"|"$/g, '').trim());
    if (cols.length < 4 || !cols[nameIdx]) continue;

    const empName = cols[nameIdx];
    const upkendra = cols[upkendraIdx] || "भादा";
    const rawDate = cols[dateIdx];
    const uniqueId = (idIdx !== -1 && cols[idIdx] && cols[idIdx].startsWith('BS_')) ? cols[idIdx] : '';
    
    // Parse date safely supporting dd-mm-yyyy, dd-mm-yy, dd/mm/yyyy, d/m/yyyy, and entryId fallback
    const dateCheck = validateDateDdMmYyyy(rawDate, uniqueId);
    if (dateCheck.isStrictDdMmYyyy) validDateCount++;
    else if (dateCheck.isAutoNormalized) autoNormalizedCount++;
    else invalidDateCount++;

    const dateObj = dateCheck.isValid ? dateCheck.parsedDate : parseIndianDate(rawDate, uniqueId);

    const designation = cols[desigIdx] || "आरोग्य सेवक (MPW)";
    const bsCode = cols[codeIdx] || "54";
    const bundleNumber = cols[bundleIdx] || `B_2026_${bsDataEntry.length + 1}`;
    const pasun = parseInt(cols[pasunIdx]) || 1;
    const paraynt = parseInt(cols[parayntIdx]) || pasun;
    const total = cols[totalIdx] ? parseInt(cols[totalIdx]) : (paraynt - pasun + 1);
    const finalId = uniqueId || `BS_${dateObj.getFullYear()}${String(dateObj.getMonth() + 1).padStart(2, '0')}${String(dateObj.getDate()).padStart(2, '0')}_${bsCode}_${bsDataEntry.length + 1}`;

    bsDataEntry.push([
      finalId,
      dateObj,
      upkendra,
      empName,
      designation,
      bsCode,
      bundleNumber,
      pasun,
      paraynt,
      Math.max(1, total)
    ]);
    added++;
  }

  saveDbToDisk();

  return {
    success: true,
    added,
    totalRecords: bsDataEntry.length,
    dateStats: {
      validDateCount,
      autoNormalizedCount,
      invalidDateCount
    },
    message: `BsDataEntry मध्ये ${added} रक्त नमुना नोंदी यशस्वीरित्या अपलोड व सिंक झाल्या! (वैध dd-mm-yyyy: ${validDateCount}, ऑटो-फॉर्मेट: ${autoNormalizedCount})`
  };
}

// 2. Import VillageDetails CSV (गावनिहाय रक्त नमुना डेटा)
export function importVillageDetailsCsv(csvText, replace = false) {
  if (!csvText || typeof csvText !== 'string') {
    return { success: false, message: "CSV मजकूर रिकामा आहे." };
  }

  const lines = csvText.trim().split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length < 2) {
    return { success: false, message: "किमान एक डेटा ओळ आवश्यक आहे." };
  }

  function parseLine(line) {
    let inQuotes = false;
    let token = "";
    const cols = [];
    for (let j = 0; j < line.length; j++) {
      const c = line[j];
      if (c === '"') inQuotes = !inQuotes;
      else if (c === ',' && !inQuotes) {
        cols.push(token.trim());
        token = "";
      } else {
        token += c;
      }
    }
    cols.push(token.trim());
    return cols;
  }

  if (replace) {
    villageDetails.length = 0;
  }

  const header = parseLine(lines[0]).map(c => c.replace(/^"|"$/g, '').trim().toLowerCase());
  let idIdx = header.findIndex(c => c.includes('id') || c.includes('bs_id') || c.includes('क्रमांक'));
  let nameIdx = header.findIndex(c => c.includes('कर्मचारी') || c.includes('employee') || c.includes('name'));
  let dateIdx = header.findIndex(c => c.includes('date') || c.includes('तारीख') || c.includes('दिनांक'));
  let vilIdx = header.findIndex(c => c.includes('गाव') || c.includes('village'));
  let sampleIdx = header.findIndex(c => c.includes('नमुने') || c.includes('sample') || c.includes('total') || c.includes('एकूण'));
  let maleIdx = header.findIndex(c => c.includes('पुरुष') || c.includes('male'));
  let femaleIdx = header.findIndex(c => c.includes('स्त्री') || c.includes('महिला') || c.includes('female'));
  let upkendraIdx = header.findIndex(c => c.includes('उपकेंद्र') || c.includes('subcenter'));

  if (idIdx === -1) idIdx = 0;
  if (nameIdx === -1) nameIdx = 1;
  if (dateIdx === -1) dateIdx = 2;
  if (vilIdx === -1) vilIdx = 3;
  if (sampleIdx === -1) sampleIdx = 4;
  if (maleIdx === -1) maleIdx = 5;
  if (femaleIdx === -1) femaleIdx = 6;
  if (upkendraIdx === -1) upkendraIdx = 7;

  let added = 0;
  let validDateCount = 0;
  let autoNormalizedCount = 0;
  let invalidDateCount = 0;

  for (let i = 1; i < lines.length; i++) {
    const cols = parseLine(lines[i]).map(c => c.replace(/^"|"$/g, '').trim());
    if (cols.length < 3) continue;

    const uniqueId = cols[idIdx] || `BS_VIL_${villageDetails.length + 1}`;
    const empName = cols[nameIdx] || "";
    const rawDate = cols[dateIdx];
    
    const dateCheck = validateDateDdMmYyyy(rawDate, uniqueId);
    if (dateCheck.isStrictDdMmYyyy) validDateCount++;
    else if (dateCheck.isAutoNormalized) autoNormalizedCount++;
    else invalidDateCount++;

    const dateObj = dateCheck.isValid ? dateCheck.parsedDate : parseIndianDate(rawDate, uniqueId);

    const villageName = cols[vilIdx] || "भादा";
    const sampleCount = parseInt(cols[sampleIdx]) || 1;
    const maleCount = (maleIdx !== -1 && cols[maleIdx]) ? parseInt(cols[maleIdx]) : Math.ceil(sampleCount * 0.52);
    const femaleCount = (femaleIdx !== -1 && cols[femaleIdx]) ? parseInt(cols[femaleIdx]) : (sampleCount - maleCount);
    const upkendra = cols[upkendraIdx] || "भादा";

    villageDetails.push([
      uniqueId,
      empName,
      dateObj,
      villageName,
      sampleCount,
      maleCount,
      femaleCount,
      upkendra
    ]);
    added++;
  }

  saveDbToDisk();

  return {
    success: true,
    added,
    totalRecords: villageDetails.length,
    dateStats: {
      validDateCount,
      autoNormalizedCount,
      invalidDateCount
    },
    message: `VillageDetails मध्ये ${added} गावनिहाय रक्त नमुना नोंदी यशस्वीरित्या अपलोड झाल्या! (वैध dd-mm-yyyy: ${validDateCount}, ऑटो-फॉर्मेट: ${autoNormalizedCount})`
  };
}

// 3. Import MonthMaster CSV (मासिक व पंधरवडा निर्देशांक मास्टर डेटा)
export function importMonthMasterCsv(csvText) {
  if (!csvText || typeof csvText !== 'string') {
    return { success: false, message: "CSV मजकूर रिकामा आहे." };
  }

  const lines = csvText.trim().split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length < 2) {
    return { success: false, message: "किमान एक डेटा ओळ आवश्यक आहे." };
  }

  function parseLine(line) {
    let inQuotes = false;
    let token = "";
    const cols = [];
    for (let j = 0; j < line.length; j++) {
      const c = line[j];
      if (c === '"') inQuotes = !inQuotes;
      else if (c === ',' && !inQuotes) {
        cols.push(token.trim());
        token = "";
      } else {
        token += c;
      }
    }
    cols.push(token.trim());
    return cols;
  }

  const header = parseLine(lines[0]).map(c => c.replace(/^"|"$/g, '').trim().toLowerCase());
  let nameIdx = header.findIndex(c => c.includes('महिना') || c.includes('month'));
  let opdIdx = header.findIndex(c => c.includes('opd') || c.includes('बाह्यरुग्ण') || c.includes('ओपीडी'));
  let feverIdx = header.findIndex(c => c.includes('तापाचे') || c.includes('fever'));
  let smearIdx = header.findIndex(c => c.includes('नमुणे') || c.includes('स्लाइड') || c.includes('smear') || c.includes('रक्त'));
  let treatedIdx = header.findIndex(c => c.includes('उपचारीत') || c.includes('treated'));
  let cqIdx = header.findIndex(c => c.includes('क्लोरोक्वीन') || c.includes('chloroquine') || c.includes('cq'));
  let mpwIdx = header.findIndex(c => c.includes('mpw') || c.includes('आरोग्य सेवक गृहभेटी') || c.includes('सेवक'));
  let anmIdx = header.findIndex(c => c.includes('anm') || c.includes('आरोग्य सेविका गृहभेटी') || c.includes('सेविका'));
  let ashaIdx = header.findIndex(c => c.includes('asha') || c.includes('आशा गृहभेटी'));

  if (nameIdx === -1) nameIdx = 0;

  let updated = 0;
  for (let i = 1; i < lines.length; i++) {
    const cols = parseLine(lines[i]).map(c => c.replace(/^"|"$/g, '').trim());
    if (cols.length < 2 || !cols[nameIdx]) continue;

    const monthName = cols[nameIdx];
    const mObj = monthMaster.find(m => m.name.toLowerCase().includes(monthName.toLowerCase()) || monthName.toLowerCase().includes(m.name.toLowerCase()));
    if (mObj) {
      if (opdIdx !== -1 && cols[opdIdx]) mObj.newOpd = parseInt(cols[opdIdx]) || 0;
      if (feverIdx !== -1 && cols[feverIdx]) mObj.feverCases = parseInt(cols[feverIdx]) || 0;
      if (smearIdx !== -1 && cols[smearIdx]) mObj.bloodSmears = parseInt(cols[smearIdx]) || 0;
      if (treatedIdx !== -1 && cols[treatedIdx]) mObj.treatedCases = parseInt(cols[treatedIdx]) || 0;
      if (cqIdx !== -1 && cols[cqIdx]) mObj.chloroquineSpent = parseInt(cols[cqIdx]) || 0;
      if (mpwIdx !== -1 && cols[mpwIdx]) mObj.mpwHomeVisits = parseInt(cols[mpwIdx]) || 0;
      if (anmIdx !== -1 && cols[anmIdx]) mObj.anmHomeVisits = parseInt(cols[anmIdx]) || 0;
      if (ashaIdx !== -1 && cols[ashaIdx]) mObj.ashaHomeVisits = parseInt(cols[ashaIdx]) || 0;
      updated++;
    }
  }

  saveDbToDisk();

  return {
    success: true,
    updated,
    totalMonths: monthMaster.length,
    message: `MonthMaster मधील ${updated} महिन्यांचे निर्देशांक (OPD, MPW/ANM गृहभेटी, रक्त नमुणे, इत्यादी) यशस्वीरित्या अद्ययावत झाले!`
  };
}

export const importantLinks = [
  {
    name: "GitHub Repository (प्रकल्प सोर्स कोड व दस्तऐवजीकरण)",
    desc: "PHC Bhada NVBDCP Malaria Management System GitHub ओपन सोर्स रिपॉझिटरी, इश्यू ट्रॅकर व रिलीज",
    url: process.env.GITHUB_REPO_URL || "https://github.com/phcbhada/nvbdcp-malaria-management-system",
    icon: "🐙",
    isGithub: true
  },
  {
    name: "NVBDCP Official Portal",
    desc: "राष्ट्रीय कीटकजन्य रोग नियंत्रण कार्यक्रम, भारत सरकार अधिकृत पोर्टल",
    url: "https://nvbdcp.gov.in/",
    icon: "🦟"
  },
  {
    name: "सार्वजनिक आरोग्य विभाग, महाराष्ट्र",
    desc: "महाराष्ट्र शासन सार्वजनिक आरोग्य विभागाची अधिकृत वेबसाईट",
    url: "https://arogya.maharashtra.gov.in/",
    icon: "🏛️"
  },
  {
    name: "IHIP - एकात्मिक आरोग्य माहिती मंच",
    desc: "Integrated Health Information Platform (IDSP - ताप व साथीचे रोग सर्व्हेक्षण)",
    url: "https://ihip.nhp.gov.in/",
    icon: "📊"
  },
  {
    name: "आरोग्य संपदा पोर्टल",
    desc: "महाराष्ट्र राज्य औषध व साधनसामग्री व्यवस्थापन पोर्टल",
    url: "https://arogyasampada.maha-arogya.gov.in/",
    icon: "💊"
  },
  {
    name: "जिल्हा परिषद आरोग्य विभाग, धाराशिव / लातूर",
    desc: "जिल्हा हिवताप नियंत्रण अधिकारी व आरोग्य प्रशासन कक्ष",
    url: "https://latur.gov.in/",
    icon: "🏥"
  },
  {
    name: "मलेरिया मार्गदर्शक पुस्तिका २०२६",
    desc: "हिवताप रुग्ण निदान, रक्त नमुना संकलन आणि उपचार प्रोटोकॉल",
    url: "#",
    icon: "📘"
  }
];

export const downloadsData = {
  root: {
    folders: [
      { id: "circulars", name: "शासकीय निर्णय व परिपत्रके (GR & Circulars)" },
      { id: "formats", name: "विहित नमुने व अहवाल फॉर्म्स (Reporting Formats)" },
      { id: "guidelines", name: "मार्गदर्शक सूचना व कार्यपद्धती (Guidelines)" }
    ],
    files: [
      { name: "प्रा.आ.केंद्र भादा - मलेरिया कृती आराखडा २०२६.pdf", url: "#" },
      { name: "रक्त नमुना संकलन व तपासणी दैनिक नोंदवही नमुना.pdf", url: "#" }
    ]
  },
  circulars: {
    folders: [],
    files: [
      { name: "हिवताप दुरीकरण राष्ट्रीय धोरण परिपत्रक २०२६.pdf", url: "#" },
      { name: "आशा कार्यकर्ती मोबदला सुधारित दर पत्रक.pdf", url: "#" },
      { name: "कीटकनाशक फवारणी मार्गदर्शक शासन निर्णय.pdf", url: "#" }
    ]
  },
  formats: {
    folders: [],
    files: [
      { name: "मासिक मलेरिया अहवाल फॉर्म M-1 (MPW / ANM).xlsx", url: "#" },
      { name: "मासिक मलेरिया अहवाल फॉर्म M-2 (PHC Level).xlsx", url: "#" },
      { name: "दैनिक ताप रुग्ण रक्त स्लाइड प्रेषण पत्र नमुना.docx", url: "#" },
      { name: "कारणे दाखवा नोटीस विहित नमुना.docx", url: "#" }
    ]
  },
  guidelines: {
    folders: [],
    files: [
      { name: "रक्त नमुना (Blood Slide) तयार करण्याचे प्रमाणित नियम.pdf", url: "#" },
      { name: "RDT किट तपासणी आणि निकाल नोंदवही मार्गदर्शक.pdf", url: "#" },
      { name: "गप्पी मासे पैदास व वितरण मार्गदर्शिका.pdf", url: "#" }
    ]
  }
};

export const photosData = {
  root: {
    folders: [
      { id: "world_malaria_day", name: "जागतिक मलेरिया दिन २०२६ जनजागृती" },
      { id: "spray_campaign", name: "कीटकनाशक फवारणी व गप्पी मासे मोहीम" }
    ],
    files: [
      {
        name: "रक्त_तपासणी_शिबीर",
        url: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=600&q=80",
        fullUrl: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1400&q=80",
        description: "प्राथमिक आरोग्य केंद्र भादा येथे आयोजित विशेष ताप रुग्ण रक्त नमुना तपासणी शिबीर"
      },
      {
        name: "आरोग्य_कर्मचारी_बैठक",
        url: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=600&q=80",
        fullUrl: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1400&q=80",
        description: "उपकेंद्रनिहाय आरोग्य सेवक, सेविका व आशा कार्यकर्त्यांची मासिक आढावा बैठक"
      },
      {
        name: "प्रयोगशाळा_तपासणी",
        url: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=600&q=80",
        fullUrl: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1400&q=80",
        description: "रक्त नमुन्यांची सूक्ष्मदर्शक तपासणी व स्लाइड स्ट्रेनिंग प्रक्रिया"
      }
    ]
  },
  world_malaria_day: {
    folders: [],
    files: [
      {
        name: "प्रभातफेरी_रॅली",
        url: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=600&q=80",
        fullUrl: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1400&q=80",
        description: "भादा गावात शालेय विद्यार्थी व आशा कार्यकर्त्यांची मलेरिया निर्मूलन जनजागृती रॅली"
      },
      {
        name: "फलक_प्रदर्शन",
        url: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=600&q=80",
        fullUrl: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1400&q=80",
        description: "डासांपासून होणाऱ्या आजारांविषयी माहिती फलक व घडीपत्रिकांचे वाटप"
      }
    ]
  },
  spray_campaign: {
    folders: [],
    files: [
      {
        name: "गप्पी_मासे_वितरण",
        url: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=600&q=80",
        fullUrl: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1400&q=80",
        description: "साचलेल्या पाण्याच्या डबक्यांमध्ये व विहिरींमध्ये डास आळी निर्मूलनासाठी गप्पी मासे सोडणे"
      }
    ]
  }
};

export const generatedReports = new Map();

export const googleSheetConfig = {
  spreadsheetId: process.env.GOOGLE_SHEET_ID || "1rYpDm1xjCAnf9LvpCZcK3E6U5zGyEkFEM5A4DQ38EKM",
  webhookUrl: process.env.GOOGLE_SHEET_WEBHOOK_URL || "https://script.google.com/macros/s/AKfycbzJ0JAGctl88Fu_GY5kDOAcvWfiHyR3G_PDnvohCgDHcoQnNa9OlUSnSRgSE-mg-0q96w/exec",
  githubRepoUrl: process.env.GITHUB_REPO_URL || "https://phbhada-pixel.github.io/Samples01/",
  autoSync: true,
  lastSyncTime: null,
  syncStatus: "रिअल-टाईम सिंक सक्षम (Real-time Synced)"
};

export function formatBsEntry(row) {
  const d = new Date(row[1]);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return {
    id: row[0],
    date: row[1],
    dateStr: `${day}-${month}-${year}`,
    slashDateStr: `${day}/${month}/${year}`,
    isoDate: `${year}-${month}-${day}`,
    upkendra: row[2],
    employeeName: row[3],
    designation: row[4],
    bsCode: row[5],
    bundleNumber: row[6],
    pasun: row[7],
    paraynt: row[8],
    total: row[9]
  };
}

export function formatVillageDetail(row) {
  const d = new Date(row[2]);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return {
    id: row[0],
    employeeName: row[1],
    date: row[2],
    dateStr: `${day}-${month}-${year}`,
    slashDateStr: `${day}/${month}/${year}`,
    villageName: row[3],
    sampleCount: row[4],
    maleCount: row[5],
    femaleCount: row[6],
    upkendra: row[7]
  };
}

export function getEmployeeVillageDistributionSummary() {
  // Aggregate village level data
  const villageMap = new Map();
  villagesMaster.forEach(v => {
    villageMap.set(v.villageName.trim(), {
      villageName: v.villageName.trim(),
      subcenter: v.subcenter || '',
      population: v.population || 0,
      houses: v.houses || 0,
      annualSmearTarget: v.annualSmearTarget || 0,
      ashaList: [],
      anmList: [],
      mpwList: [],
      moList: [],
      employeeList: [],
      ashaCount: 0,
      anmCount: 0,
      mpwCount: 0,
      moCount: 0,
      totalEmployees: 0,
      totalSmears: 0,
      maleSmears: 0,
      femaleSmears: 0
    });
  });

  // Map employee assignments
  const employeeStats = [];
  const desigCounts = {
    asha: 0,
    anm: 0,
    mpw: 0,
    mo: 0,
    other: 0
  };

  const subcenterMap = new Map();
  subcenterMaster.forEach(s => {
    subcenterMap.set(s.name.trim(), {
      name: s.name.trim(),
      headquarter: s.headquarter || s.name,
      population: s.population || 0,
      houses: s.houses || 0,
      villageCount: (s.villages || []).length,
      villages: s.villages || [],
      employeeCount: 0,
      ashaCount: 0,
      anmCount: 0,
      mpwCount: 0,
      moCount: 0,
      totalSmears: 0
    });
  });

  // Calculate smears per employee and per village from historical data
  const empSmearMap = new Map();
  const empActivePassiveMap = new Map();
  bsDataEntry.forEach(row => {
    const empName = String(row[3]).trim();
    const count = parseInt(row[9]) || 0;
    const desig = String(row[4] || '');
    empSmearMap.set(empName, (empSmearMap.get(empName) || 0) + count);
    
    if (!empActivePassiveMap.has(empName)) {
      empActivePassiveMap.set(empName, { active: 0, passive: 0 });
    }
    const rec = empActivePassiveMap.get(empName);
    if (desig.includes('OPD') || desig.includes('प्रा.आ.केंद्र')) {
      rec.passive += count;
    } else {
      rec.active += count;
    }
  });

  const villageSmearMap = new Map();
  villageDetails.forEach(row => {
    const vName = String(row[3]).trim();
    const count = parseInt(row[4]) || 0;
    const m = parseInt(row[5]) || 0;
    const f = parseInt(row[6]) || 0;
    if (!villageSmearMap.has(vName)) {
      villageSmearMap.set(vName, { total: 0, male: 0, female: 0 });
    }
    const curr = villageSmearMap.get(vName);
    curr.total += count;
    curr.male += m;
    curr.female += f;
  });

  // Process all employees
  employeeMaster.forEach(emp => {
    const desigStr = emp.designation || '';
    let category = 'other';
    if (desigStr.includes('आशा') || desigStr.includes('ASHA')) {
      category = 'asha';
      desigCounts.asha++;
    } else if (desigStr.includes('आरोग्य सेविका') || desigStr.includes('ANM')) {
      category = 'anm';
      desigCounts.anm++;
    } else if (desigStr.includes('आरोग्य सेवक') || desigStr.includes('MPW')) {
      category = 'mpw';
      desigCounts.mpw++;
    } else if (desigStr.includes('वैद्यकीय') || desigStr.includes('OPD') || desigStr.includes('Phc') || desigStr.includes('प्रा.आ.')) {
      category = 'mo';
      desigCounts.mo++;
    } else {
      desigCounts.other++;
    }

    const vList = emp.villageList || [];
    const empSmears = empSmearMap.get(emp.employeeName.trim()) || 0;
    const ap = empActivePassiveMap.get(emp.employeeName.trim()) || { active: 0, passive: 0 };

    employeeStats.push({
      id: emp.id,
      employeeName: emp.employeeName,
      upkendra: emp.upkendra,
      designation: emp.designation,
      category: category,
      bsCode: emp.bsCode || '',
      villageCount: vList.length,
      villageList: vList,
      totalSmears: empSmears,
      activeSmears: ap.active,
      passiveSmears: ap.passive
    });

    // Link to Subcenter
    const sc = subcenterMap.get(emp.upkendra.trim());
    if (sc) {
      sc.employeeCount++;
      if (category === 'asha') sc.ashaCount++;
      else if (category === 'anm') sc.anmCount++;
      else if (category === 'mpw') sc.mpwCount++;
      else if (category === 'mo') sc.moCount++;
      sc.totalSmears += empSmears;
    }

    // Link to Villages
    vList.forEach(vNameRaw => {
      const vName = vNameRaw.trim();
      let vObj = villageMap.get(vName);
      if (!vObj) {
        vObj = {
          villageName: vName,
          subcenter: emp.upkendra,
          population: 0,
          houses: 0,
          annualSmearTarget: 0,
          ashaList: [],
          anmList: [],
          mpwList: [],
          moList: [],
          employeeList: [],
          ashaCount: 0,
          anmCount: 0,
          mpwCount: 0,
          moCount: 0,
          totalEmployees: 0,
          totalSmears: 0,
          maleSmears: 0,
          femaleSmears: 0
        };
        villageMap.set(vName, vObj);
      }

      vObj.employeeList.push({
        name: emp.employeeName,
        designation: emp.designation,
        bsCode: emp.bsCode,
        category: category
      });
      vObj.totalEmployees++;

      if (category === 'asha') {
        vObj.ashaList.push(emp.employeeName);
        vObj.ashaCount++;
      } else if (category === 'anm') {
        vObj.anmList.push(emp.employeeName);
        vObj.anmCount++;
      } else if (category === 'mpw') {
        vObj.mpwList.push(emp.employeeName);
        vObj.mpwCount++;
      } else if (category === 'mo') {
        vObj.moList.push(emp.employeeName);
        vObj.moCount++;
      }
    });
  });

  // Attach smear metrics to village objects
  const villagesList = Array.from(villageMap.values()).map(v => {
    const sm = villageSmearMap.get(v.villageName) || { total: 0, male: 0, female: 0 };
    v.totalSmears = sm.total;
    v.maleSmears = sm.male;
    v.femaleSmears = sm.female;
    return v;
  });

  // Designation distribution data for Pie Chart
  const designationPieData = [
    { name: 'आशा स्वयंसेविका (ASHA)', count: desigCounts.asha, color: '#805ad5' },
    { name: 'आरोग्य सेविका (ANM)', count: desigCounts.anm, color: '#38a169' },
    { name: 'आरोग्य सेवक (MPW)', count: desigCounts.mpw, color: '#3182ce' },
    { name: 'वैद्यकीय अधिकारी / OPD', count: desigCounts.mo, color: '#dd6b20' }
  ].filter(d => d.count > 0);

  const subcentersList = Array.from(subcenterMap.values());

  const totalSmearsAll = Array.from(empSmearMap.values()).reduce((a, b) => a + b, 0);

  return {
    overallStats: {
      totalEmployees: employeeMaster.length,
      totalVillages: villagesList.length,
      totalSubcenters: subcentersList.length,
      totalSmears: totalSmearsAll,
      avgVillagesPerWorker: employeeMaster.length ? (villagesList.length / employeeMaster.length).toFixed(2) : '0'
    },
    villages: villagesList,
    employees: employeeStats,
    subcenters: subcentersList,
    designationDistribution: designationPieData
  };
}

// ================= DISK PERSISTENCE ENGINE (db.json) =================
export function saveDbToDisk() {
  try {
    const dataToSave = {
      bsDataEntry: bsDataEntry.map(r => [
        r[0],
        r[1] instanceof Date ? r[1].toISOString() : r[1],
        r[2], r[3], r[4], r[5], r[6], r[7], r[8], r[9]
      ]),
      villageDetails: villageDetails.map(r => [
        r[0], r[1],
        r[2] instanceof Date ? r[2].toISOString() : r[2],
        r[3], r[4], r[5], r[6], r[7]
      ]),
      monthMaster: monthMaster.map(m => ({
        ...m,
        f1Start: m.f1Start instanceof Date ? m.f1Start.toISOString() : m.f1Start,
        f1End: m.f1End instanceof Date ? m.f1End.toISOString() : m.f1End,
        f2Start: m.f2Start instanceof Date ? m.f2Start.toISOString() : m.f2Start,
        f2End: m.f2End instanceof Date ? m.f2End.toISOString() : m.f2End
      })),
      employeeMaster,
      subcenterMaster,
      villagesMaster,
      masterData,
      transferHistory,
      googleSheetConfig
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(dataToSave, null, 2), 'utf8');
  } catch (err) {
    console.error('[Store] Error saving db.json to disk:', err);
  }
}

export function loadDbFromDisk() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf8');
      if (raw && raw.trim()) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed.bsDataEntry) && parsed.bsDataEntry.length > 0) {
          bsDataEntry.length = 0;
          parsed.bsDataEntry.forEach(r => {
            bsDataEntry.push([
              r[0],
              new Date(r[1]),
              r[2], r[3], r[4], r[5], r[6], r[7], r[8], r[9]
            ]);
          });
        }
        if (Array.isArray(parsed.villageDetails) && parsed.villageDetails.length > 0) {
          villageDetails.length = 0;
          parsed.villageDetails.forEach(r => {
            villageDetails.push([
              r[0], r[1],
              new Date(r[2]),
              r[3], r[4], r[5], r[6], r[7]
            ]);
          });
        }
        if (Array.isArray(parsed.monthMaster) && parsed.monthMaster.length > 0) {
          parsed.monthMaster.forEach((savedM, i) => {
            if (monthMaster[i]) {
              Object.assign(monthMaster[i], savedM, {
                f1Start: new Date(savedM.f1Start || monthMaster[i].f1Start),
                f1End: new Date(savedM.f1End || monthMaster[i].f1End),
                f2Start: new Date(savedM.f2Start || monthMaster[i].f2Start),
                f2End: new Date(savedM.f2End || monthMaster[i].f2End)
              });
            }
          });
        }
        if (Array.isArray(parsed.employeeMaster) && parsed.employeeMaster.length > 0) {
          employeeMaster.length = 0;
          parsed.employeeMaster.forEach(e => employeeMaster.push(e));
        }
        if (Array.isArray(parsed.subcenterMaster) && parsed.subcenterMaster.length > 0) {
          subcenterMaster.length = 0;
          parsed.subcenterMaster.forEach(s => subcenterMaster.push(s));
        }
        if (Array.isArray(parsed.villagesMaster) && parsed.villagesMaster.length > 0) {
          villagesMaster.length = 0;
          parsed.villagesMaster.forEach(v => villagesMaster.push(v));
        }
        if (Array.isArray(parsed.masterData) && parsed.masterData.length > 0) {
          masterData.length = 0;
          parsed.masterData.forEach(m => masterData.push(m));
        }
        if (Array.isArray(parsed.transferHistory) && parsed.transferHistory.length > 0) {
          transferHistory.length = 0;
          parsed.transferHistory.forEach(t => transferHistory.push(t));
        }
        if (parsed.googleSheetConfig && typeof parsed.googleSheetConfig === 'object') {
          Object.assign(googleSheetConfig, parsed.googleSheetConfig);
        }
        console.log(`[Store] Loaded persistent database from disk: ${bsDataEntry.length} BS records, ${villageDetails.length} village details.`);
      }
    }
  } catch (err) {
    console.error('[Store] Error loading db.json from disk:', err);
  }
}

export function recalculateAllMonthProgressives() {
  let runOpd = 0;
  let runSmears = 0;
  let runCq = 0;
  let runMpw = 0;
  let runAnm = 0;
  let runAsha = 0;

  for (let i = 0; i < monthMaster.length; i++) {
    const m = monthMaster[i];

    // Auto-populate Blood Smears from OPD section (बाह्यरुग्ण विभाग रक्त नमुने) for this month
    // "monthly report data entry madhye ghetlele raktnamuna he tya mahinyat bahyrugn vibhag rakt namune auto save vhave"
    const opdSummary = getOpdBsVillagewiseSummary(m.name);
    if (opdSummary && opdSummary.monthlyTotal > 0 && (!m.bloodSmears || m.bloodSmears === 0 || !m.bloodSmearsManual)) {
      m.bloodSmears = opdSummary.monthlyTotal;
    }

    // "tasech 🩸 घेतलेले रक्त नमुणे (Blood Smears)=🌡️ तापाचे रुग्ण (Fever Cases)=💊 उपचारीत रुग्ण (Treated Cases)"
    const mSmears = parseInt(m.bloodSmears) || 0;
    m.bloodSmears = mSmears;
    m.feverCases = mSmears;
    m.treatedCases = mSmears;

    const mOpd = parseInt(m.newOpd != null ? m.newOpd : (m.opd || 0)) || 0;
    const mCq = parseInt(m.chloroquineSpent) || 0;
    const mMpw = parseInt(m.mpwHomeVisits) || 0;
    const mAnm = parseInt(m.anmHomeVisits) || 0;
    const mAsha = parseInt(m.ashaHomeVisits) || 0;

    m.priorOpdSum = runOpd;
    m.priorFeverSum = runSmears;
    m.priorSmearsSum = runSmears;
    m.priorTreatedSum = runSmears;
    m.priorCqSum = runCq;
    m.priorMpwSum = runMpw;
    m.priorAnmSum = runAnm;
    m.priorAshaSum = runAsha;

    runOpd += mOpd;
    runSmears += mSmears;
    runCq += mCq;
    runMpw += mMpw;
    runAnm += mAnm;
    runAsha += mAsha;

    m.progNewOpd = runOpd;
    m.progFeverCases = runSmears;
    m.progBloodSmears = runSmears;
    m.progTreatedCases = runSmears;
    m.progChloroquineSpent = runCq;
    m.progMpwHomeVisits = runMpw;
    m.progAnmHomeVisits = runAnm;
    m.progAshaHomeVisits = runAsha;
  }
}

// Auto-load existing database from disk upon startup
loadDbFromDisk();
recalculateAllMonthProgressives();




