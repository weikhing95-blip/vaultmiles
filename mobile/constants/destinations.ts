export interface DestinationMiles {
  eco: number | null;
  premEco: number | null;
  biz: number | null;
  first: number | null;
}

export interface Destination {
  city: string;
  country: string;
  region: string;
  miles: {
    saver: DestinationMiles;
    advantage: DestinationMiles;
    access: DestinationMiles;
  };
}

export const DESTINATIONS: Destination[] = [
  { city: "Kuala Lumpur", country: "MY", region: "Southeast Asia",
    miles: { saver: { eco: 8000, premEco: 12500, biz: 25000, first: null }, advantage: { eco: 10000, premEco: null, biz: 32500, first: null }, access: { eco: 11500, premEco: null, biz: 38000, first: null } } },
  { city: "Bali",         country: "ID", region: "Southeast Asia",
    miles: { saver: { eco: 8000, premEco: 12500, biz: 25000, first: null }, advantage: { eco: 10000, premEco: null, biz: 32500, first: null }, access: { eco: 11500, premEco: null, biz: 38000, first: null } } },
  { city: "Bangkok",      country: "TH", region: "Southeast Asia",
    miles: { saver: { eco: 13000, premEco: 20000, biz: 37500, first: null }, advantage: { eco: 16500, premEco: null, biz: 47500, first: null }, access: { eco: 19000, premEco: null, biz: 56000, first: null } } },
  { city: "Hong Kong",    country: "HK", region: "East Asia",
    miles: { saver: { eco: 17500, premEco: 27500, biz: 55000, first: 77000 }, advantage: { eco: 22000, premEco: null, biz: 70000, first: 97000 }, access: { eco: 25500, premEco: null, biz: 82000, first: 110000 } } },
  { city: "Tokyo",        country: "JP", region: "East Asia",
    miles: { saver: { eco: 25500, premEco: 37500, biz: 67500, first: 97500 }, advantage: { eco: 32000, premEco: null, biz: 85500, first: 122500 }, access: { eco: 37000, premEco: null, biz: 100000, first: 138000 } } },
  { city: "Seoul",        country: "KR", region: "East Asia",
    miles: { saver: { eco: 25500, premEco: 37500, biz: 67500, first: null }, advantage: { eco: 32000, premEco: null, biz: 85500, first: null }, access: { eco: 37000, premEco: null, biz: 100000, first: null } } },
  { city: "Melbourne",    country: "AU", region: "Oceania",
    miles: { saver: { eco: 29000, premEco: 42500, biz: 77500, first: 107500 }, advantage: { eco: 36500, premEco: null, biz: 97500, first: 135000 }, access: { eco: 42000, premEco: null, biz: 115000, first: 152000 } } },
  { city: "Sydney",       country: "AU", region: "Oceania",
    miles: { saver: { eco: 29000, premEco: 42500, biz: 77500, first: 107500 }, advantage: { eco: 36500, premEco: null, biz: 97500, first: 135000 }, access: { eco: 42000, premEco: null, biz: 115000, first: 152000 } } },
  { city: "London",       country: "GB", region: "Europe",
    miles: { saver: { eco: 44000, premEco: 66000, biz: 113750, first: 149500 }, advantage: { eco: 55500, premEco: null, biz: 143000, first: 188000 }, access: { eco: 64000, premEco: null, biz: 168000, first: 213000 } } },
  { city: "Paris",        country: "FR", region: "Europe",
    miles: { saver: { eco: 44000, premEco: 66000, biz: 113750, first: 149500 }, advantage: { eco: 55500, premEco: null, biz: 143000, first: 188000 }, access: { eco: 64000, premEco: null, biz: 168000, first: 213000 } } },
  { city: "New York",     country: "US", region: "Americas",
    miles: { saver: { eco: 63000, premEco: 95000, biz: 143750, first: 189500 }, advantage: { eco: 79500, premEco: null, biz: 181000, first: 238500 }, access: { eco: 92000, premEco: null, biz: 213000, first: 270000 } } },
  { city: "Los Angeles",  country: "US", region: "Americas",
    miles: { saver: { eco: 63000, premEco: 95000, biz: 143750, first: 189500 }, advantage: { eco: 79500, premEco: null, biz: 181000, first: 238500 }, access: { eco: 92000, premEco: null, biz: 213000, first: 270000 } } },
];

export const CABIN_OPTIONS = [
  { id: "eco",    label: "Economy",       short: "Eco"   },
  { id: "premEco",label: "Prem. Economy", short: "PEco"  },
  { id: "biz",    label: "Business",      short: "Biz"   },
  { id: "first",  label: "First/Suites",  short: "First" },
] as const;

export const REDEEM_OPTIONS = [
  { id: "saver",     label: "Saver",     desc: "Lowest miles · limited seats" },
  { id: "advantage", label: "Advantage", desc: "More seats · ~20–25% more miles" },
  { id: "access",    label: "Access",    desc: "Last seat · dynamic · highest cost" },
] as const;

export type CabinId = "eco" | "premEco" | "biz" | "first";
export type RedeemId = "saver" | "advantage" | "access";
