import { lookupLabel } from '@/i18n';

// AUTOMATICALLY GENERATED TYPES - DO NOT EDIT

export type LookupValue = { key: string; label: string };
/** A raw record URL (applookup reference). NEVER render this directly
 *  in JSX — it is a URL, not a display value. Show the enriched `*Name`
 *  field or resolve it via the entity map instead. Assignable to/from
 *  string everywhere; the `& {}` keeps the alias NAME visible in tsc
 *  error messages (a plain primitive alias gets normalized away). */
export type RecordUrl = string & {};
export type GeoLocation = { lat: number; long: number; info?: string };

export type AttachmentType = 'file' | 'note' | 'url' | 'json';
export interface Attachment {
  id: string;
  type: AttachmentType;
  label: string | null;
  value: string | null;
  active: boolean;
  createdat?: string | null;
  updatedat?: string | null;
}

export interface AttachmentInput {
  type: AttachmentType;
  label?: string;
  value: string;
  active?: boolean;
}

export interface Hersteller {
  record_id: string;
  /** The API field. */
  created_at: string;
  updated_at: string | null;
  /** Alias of created_at, filled by the read helpers. The API sends
   *  snake_case only — reading `createdat` off a raw record yields
   *  undefined, which type-checks and then crashes at runtime. */
  createdat: string;
  updatedat: string | null;
  fields: {
    name?: string;
    land?: string;
    website?: string;
    beschreibung?: string;
  };
}

export interface Keyboards {
  record_id: string;
  /** The API field. */
  created_at: string;
  updated_at: string | null;
  /** Alias of created_at, filled by the read helpers. The API sends
   *  snake_case only — reading `createdat` off a raw record yields
   *  undefined, which type-checks and then crashes at runtime. */
  createdat: string;
  updatedat: string | null;
  fields: {
    bezeichnung?: string;
    hersteller?: RecordUrl; // applookup -> URL zu 'Hersteller' Record
    typ?: LookupValue;
    schaltertyp?: string;
    layout?: LookupValue;
    tastenanzahl?: number;
    verbindungsart?: LookupValue[];
    farbe?: string;
    zustand?: LookupValue;
    bild?: string;
    kaufdatum?: string; // Format: YYYY-MM-DD oder ISO String
    kaufpreis?: number;
    seriennummer?: string;
    notizen?: string;
  };
}

export const APP_IDS = {
  HERSTELLER: '6abd1872a1ac77890a696005',
  KEYBOARDS: '6abd1875658a9d8bedfc08f5',
} as const;


export const LOOKUP_OPTIONS: Record<string, Record<string, {key: string, label: string}[]>> = {
  'keyboards': {
    typ: [{ key: "mechanisch", get label() { return lookupLabel('keyboards', 'typ', "mechanisch") ?? "Mechanisch"; } }, { key: "membran", get label() { return lookupLabel('keyboards', 'typ', "membran") ?? "Membran"; } }, { key: "hybrid", get label() { return lookupLabel('keyboards', 'typ', "hybrid") ?? "Hybrid"; } }, { key: "optisch", get label() { return lookupLabel('keyboards', 'typ', "optisch") ?? "Optisch"; } }, { key: "elektrostatisch", get label() { return lookupLabel('keyboards', 'typ', "elektrostatisch") ?? "Elektrostatisch"; } }],
    layout: [{ key: "qwertz", get label() { return lookupLabel('keyboards', 'layout', "qwertz") ?? "QWERTZ"; } }, { key: "qwerty", get label() { return lookupLabel('keyboards', 'layout', "qwerty") ?? "QWERTY"; } }, { key: "azerty", get label() { return lookupLabel('keyboards', 'layout', "azerty") ?? "AZERTY"; } }, { key: "sonstiges", get label() { return lookupLabel('keyboards', 'layout', "sonstiges") ?? "Sonstiges"; } }],
    verbindungsart: [{ key: "usb", get label() { return lookupLabel('keyboards', 'verbindungsart', "usb") ?? "Kabelgebunden (USB)"; } }, { key: "kabellos", get label() { return lookupLabel('keyboards', 'verbindungsart', "kabellos") ?? "Kabellos (2,4 GHz)"; } }, { key: "bluetooth", get label() { return lookupLabel('keyboards', 'verbindungsart', "bluetooth") ?? "Bluetooth"; } }],
    zustand: [{ key: "neu", get label() { return lookupLabel('keyboards', 'zustand', "neu") ?? "Neu"; } }, { key: "sehr_gut", get label() { return lookupLabel('keyboards', 'zustand', "sehr_gut") ?? "Sehr gut"; } }, { key: "gut", get label() { return lookupLabel('keyboards', 'zustand', "gut") ?? "Gut"; } }, { key: "akzeptabel", get label() { return lookupLabel('keyboards', 'zustand', "akzeptabel") ?? "Akzeptabel"; } }, { key: "defekt", get label() { return lookupLabel('keyboards', 'zustand', "defekt") ?? "Defekt"; } }],
  },
};

// Optimistic LookupValue writes: never re-type a label — resolve the schema
// option instead (its label is a locale-aware getter; falls back to the key).
// WRONG: status: { key: 'offen', label: 'Offen' }   (frozen in one language)
// RIGHT: status: lookupOption('<appKey>', 'status', 'offen')
export function lookupOption(app: string, field: string, key: string): LookupValue {
  return LOOKUP_OPTIONS[app]?.[field]?.find(o => o.key === key) ?? { key, label: key };
}

export const FIELD_TYPES: Record<string, Record<string, string>> = {
  'hersteller': {
    'name': 'string/text',
    'land': 'string/text',
    'website': 'string/url',
    'beschreibung': 'string/textarea',
  },
  'keyboards': {
    'bezeichnung': 'string/text',
    'hersteller': 'applookup/select',
    'typ': 'lookup/select',
    'schaltertyp': 'string/text',
    'layout': 'lookup/select',
    'tastenanzahl': 'number',
    'verbindungsart': 'multiplelookup/checkbox',
    'farbe': 'string/text',
    'zustand': 'lookup/radio',
    'bild': 'file',
    'kaufdatum': 'date/date',
    'kaufpreis': 'number',
    'seriennummer': 'string/text',
    'notizen': 'string/textarea',
  },
};

export const HUB_TOPOLOGY: Record<string, { field: string; entity: string }[]> = {
};

type StripLookup<T> = {
  [K in keyof T]: T[K] extends LookupValue | undefined ? string | LookupValue | undefined
    : T[K] extends LookupValue[] | undefined ? string[] | LookupValue[] | undefined
    : T[K];
};

// Helper Types for creating new records (lookup fields as plain strings for API)
export type CreateHersteller = StripLookup<Hersteller['fields']>;
export type CreateKeyboards = StripLookup<Keyboards['fields']>;