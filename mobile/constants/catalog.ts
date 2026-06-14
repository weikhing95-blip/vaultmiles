export interface CatalogEntry {
  id: string;
  bank: string;
  name: string;
  min: number;
  blockPts: number;
  blockMiles: number;
  fee: number;
  note: string;
}

export const CATALOG: CatalogEntry[] = [
  { id: "krisflyer", bank: "Direct",        name: "KrisFlyer Miles",                 min: 0,     blockPts: 1,     blockMiles: 1,     fee: 0,     note: "Already in your account" },
  { id: "dbs",       bank: "DBS",           name: "DBS Points",                      min: 5000,  blockPts: 5000,  blockMiles: 10000, fee: 27.25, note: "Altitude points never expire" },
  { id: "uob",       bank: "UOB",           name: "UNI$",                            min: 5000,  blockPts: 5000,  blockMiles: 10000, fee: 27,    note: "UNI$ expire after 2 years" },
  { id: "ocbc90n",   bank: "OCBC",          name: "90°N Miles / Travel$",            min: 1000,  blockPts: 1000,  blockMiles: 1000,  fee: 0,     note: "1:1, no fee" },
  { id: "ocbcd",     bank: "OCBC",          name: "OCBC$ (Rewards / Premier VI)",    min: 25000, blockPts: 25000, blockMiles: 10000, fee: 25,    note: "For Rewards & Premier VI cards" },
  { id: "citytyp",   bank: "Citi",          name: "ThankYou Points",                 min: 25000, blockPts: 25000, blockMiles: 10000, fee: 27.25, note: "2.5:1 ratio" },
  { id: "citimiles", bank: "Citi",          name: "Citi Miles (PremierMiles)",       min: 1000,  blockPts: 1,     blockMiles: 1,     fee: 27.25, note: "1:1 ratio" },
  { id: "hsbc",      bank: "HSBC",          name: "Reward Points",                   min: 30000, blockPts: 3,     blockMiles: 1,     fee: 0,     note: "Instant transfer" },
  { id: "sc1",       bank: "Std Chartered", name: "360° Tier 1 (Beyond/Journey/VI)", min: 25000, blockPts: 25000, blockMiles: 10000, fee: 27.25, note: "Preferential 2.5:1 tier" },
  { id: "sc2",       bank: "Std Chartered", name: "360° Tier 2 (Smart/Rewards+)",   min: 34500, blockPts: 34500, blockMiles: 10000, fee: 27.25, note: "3.45:1 tier" },
  { id: "amex",      bank: "Amex",          name: "Membership Rewards",              min: 1000,  blockPts: 2,     blockMiles: 1,     fee: 0,     note: "~2:1 after Feb 2026" },
];

export const BANK_COLORS: Record<string, string> = {
  Direct: "#C4974A",
  DBS: "#E31837",
  UOB: "#003087",
  OCBC: "#EE2E24",
  Citi: "#003B9F",
  HSBC: "#DB0011",
  "Std Chartered": "#0B9444",
  Amex: "#016FD0",
};

export const BANK_TO_ID: Record<string, string> = {
  KrisFlyer: "krisflyer",
  DBS: "dbs",
  UOB: "uob",
  "OCBC 90N": "ocbc90n",
  "OCBC Rewards": "ocbcd",
  "Citi ThankYou": "citytyp",
  "Citi Miles": "citimiles",
  HSBC: "hsbc",
  "SC Tier1": "sc1",
  "SC Tier2": "sc2",
  Amex: "amex",
};
