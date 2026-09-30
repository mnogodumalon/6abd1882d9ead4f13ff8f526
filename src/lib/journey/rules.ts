/**
 * Field rules — GENERATED from the app metadata. Do not edit.
 *
 * The mechanical truth about every field: what kind it is, whether the
 * platform's base view marks it required, which lookup keys exist, where an
 * applookup points, what the label is. `useStepForm` validates against these
 * rules and phrases its messages with the real labels; `toWirePayload` uses
 * them to shape the create payload; `SHAPES` tells a page which input FORM
 * fits the data (a date pair wants a calendar, not two fields) — it is a
 * signal, not a gate.
 */
import { appLabel, fieldLabel, lookupLabel } from '@/i18n';
import { policyLabel } from './policy';
import { LOOKUP_OPTIONS } from '@/types/app';

export type EntityKey = 'hersteller' | 'keyboards';

/** The text fields of each entity — what a search may run over (generated;
 *  `never` for an entity without text of its own, e.g. a link table). */
export interface StringFields {
  "hersteller": "name" | "land" | "website" | "beschreibung";
  "keyboards": "bezeichnung" | "schaltertyp" | "farbe" | "seriennummer" | "notizen";
}
export type StringFieldKey<E extends EntityKey> = E extends keyof StringFields ? StringFields[E] : never;

/** The applookup fields of each entity (generated). A pick stored through
 *  `form.set` on one of these must carry its display name — at compile time
 *  (`StepForm.set`), because the review would otherwise show the id. */
export interface RecordFields {
  "hersteller": never;
  "keyboards": "hersteller";
}
export type RecordFieldKey<E extends EntityKey> = E extends keyof RecordFields ? RecordFields[E] : never;

export type FieldKind =
  | 'text'
  | 'textarea'
  | 'email'
  | 'tel'
  | 'url'
  | 'number'
  | 'bool'
  | 'date'
  | 'datetime'
  | 'lookup'
  | 'multilookup'
  | 'record'
  | 'multirecord'
  | 'file'
  | 'geo';

export interface FieldRule {
  key: string;
  fulltype: string;
  kind: FieldKind;
  /** From the app's base view. A public page may override this per field. */
  required: boolean;
  /** Build-time label — `labelOf()` prefers the runtime i18n bundle. */
  label: string;
  /** Whether a journey may write it (`file` is upload-only, never via a journey). */
  writable: boolean;
  maxLength?: number;
  /** lookup / multilookup: the ONLY valid write values. */
  options?: string[];
  /** record / multirecord: the target app (always) and its entity key (when inside this appgroup). */
  targetAppId?: string;
  targetEntity?: EntityKey;
  format?: 'currency';
  /** HTML autocomplete token derived from the field name (given-name, email, tel, …). */
  autoComplete?: string;
}

export interface EntityInfo {
  key: EntityKey;
  appId: string;
  label: string;
  /** PascalCase plural — `get<pascal>()` on the service. */
  pascal: string;
  /** The single-record suffix — `create<single>()` on the service. */
  single: string;
}

/** Input-form signals per entity: which data shape each field (pair) has.
 *  `range`  — two date fields that form a stay/period → AvailabilityRangePicker
 *  `choice` — a lookup with few options → ChoiceGroup pills instead of a select
 *  `record` — an applookup → EntitySelectStep with search, never a raw id field
 *  `stock`  — a quantity that has a stock/capacity counterpart → show it, warn on overshoot */
export type Shape =
  | { kind: 'range'; from: string; to: string }
  | { kind: 'choice'; field: string; count: number }
  | { kind: 'record'; field: string; targetEntity?: EntityKey }
  | { kind: 'stock'; field: string };

export const ENTITIES: Record<EntityKey, EntityInfo> = {
  "hersteller": {
    "key": "hersteller",
    "appId": "6abd1872a1ac77890a696005",
    "label": "Hersteller",
    "pascal": "Hersteller",
    "single": "HerstellerEntry"
  },
  "keyboards": {
    "key": "keyboards",
    "appId": "6abd1875658a9d8bedfc08f5",
    "label": "Keyboards",
    "pascal": "Keyboards",
    "single": "Keyboard"
  }
};

export const FIELD_RULES: Record<EntityKey, Record<string, FieldRule>> = {
  "hersteller": {
    "name": {
      "key": "name",
      "fulltype": "string/text",
      "kind": "text",
      "required": true,
      "label": "Herstellername",
      "writable": true,
      "maxLength": 4000,
      "autoComplete": "name"
    },
    "land": {
      "key": "land",
      "fulltype": "string/text",
      "kind": "text",
      "required": false,
      "label": "Land",
      "writable": true,
      "maxLength": 4000,
      "autoComplete": "country-name"
    },
    "website": {
      "key": "website",
      "fulltype": "string/url",
      "kind": "url",
      "required": false,
      "label": "Website",
      "writable": true,
      "autoComplete": "url"
    },
    "beschreibung": {
      "key": "beschreibung",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Beschreibung",
      "writable": true
    }
  },
  "keyboards": {
    "bezeichnung": {
      "key": "bezeichnung",
      "fulltype": "string/text",
      "kind": "text",
      "required": true,
      "label": "Bezeichnung",
      "writable": true,
      "maxLength": 4000
    },
    "hersteller": {
      "key": "hersteller",
      "fulltype": "applookup/select",
      "kind": "record",
      "required": false,
      "label": "Hersteller",
      "writable": true,
      "targetAppId": "6abd1872a1ac77890a696005",
      "targetEntity": "hersteller"
    },
    "typ": {
      "key": "typ",
      "fulltype": "lookup/select",
      "kind": "lookup",
      "required": false,
      "label": "Typ",
      "writable": true,
      "options": [
        "mechanisch",
        "membran",
        "hybrid",
        "optisch",
        "elektrostatisch"
      ]
    },
    "schaltertyp": {
      "key": "schaltertyp",
      "fulltype": "string/text",
      "kind": "text",
      "required": false,
      "label": "Schaltertyp",
      "writable": true,
      "maxLength": 4000
    },
    "layout": {
      "key": "layout",
      "fulltype": "lookup/select",
      "kind": "lookup",
      "required": false,
      "label": "Layout",
      "writable": true,
      "options": [
        "qwertz",
        "qwerty",
        "azerty",
        "sonstiges"
      ]
    },
    "tastenanzahl": {
      "key": "tastenanzahl",
      "fulltype": "number",
      "kind": "number",
      "required": false,
      "label": "Anzahl der Tasten",
      "writable": true
    },
    "verbindungsart": {
      "key": "verbindungsart",
      "fulltype": "multiplelookup/checkbox",
      "kind": "multilookup",
      "required": false,
      "label": "Verbindungsart",
      "writable": true,
      "options": [
        "usb",
        "kabellos",
        "bluetooth"
      ]
    },
    "farbe": {
      "key": "farbe",
      "fulltype": "string/text",
      "kind": "text",
      "required": false,
      "label": "Farbe",
      "writable": true,
      "maxLength": 4000
    },
    "zustand": {
      "key": "zustand",
      "fulltype": "lookup/radio",
      "kind": "lookup",
      "required": false,
      "label": "Zustand",
      "writable": true,
      "options": [
        "neu",
        "sehr_gut",
        "gut",
        "akzeptabel",
        "defekt"
      ]
    },
    "bild": {
      "key": "bild",
      "fulltype": "file",
      "kind": "file",
      "required": false,
      "label": "Bild",
      "writable": false
    },
    "kaufdatum": {
      "key": "kaufdatum",
      "fulltype": "date/date",
      "kind": "date",
      "required": false,
      "label": "Kaufdatum",
      "writable": true
    },
    "kaufpreis": {
      "key": "kaufpreis",
      "fulltype": "number",
      "kind": "number",
      "required": false,
      "label": "Kaufpreis (€)",
      "writable": true,
      "format": "currency"
    },
    "seriennummer": {
      "key": "seriennummer",
      "fulltype": "string/text",
      "kind": "text",
      "required": false,
      "label": "Seriennummer",
      "writable": true,
      "maxLength": 4000
    },
    "notizen": {
      "key": "notizen",
      "fulltype": "string/textarea",
      "kind": "textarea",
      "required": false,
      "label": "Notizen",
      "writable": true
    }
  }
};

export const SHAPES: Record<EntityKey, Shape[]> = {
  "hersteller": [],
  "keyboards": [
    {
      "kind": "choice",
      "field": "typ",
      "count": 5
    },
    {
      "kind": "choice",
      "field": "layout",
      "count": 4
    },
    {
      "kind": "choice",
      "field": "zustand",
      "count": 5
    },
    {
      "kind": "record",
      "field": "hersteller",
      "targetEntity": "hersteller"
    }
  ]
};

/** The fields a record of this entity is recognised by (a person: first and
 *  last name; else its title-like text field) — the same choice the dashboard's
 *  enrichment makes for `<key>Name`. `useRecordSearch` resolves an applookup to
 *  this name (`ctx.ref('gast')` in `toItem`). */
export const DISPLAY_FIELDS: Record<EntityKey, string[]> = {
  "hersteller": [
    "name"
  ],
  "keyboards": [
    "bezeichnung"
  ]
};

/** The display name of a record: its display fields joined, else the first
 *  non-empty text value, else ''. */
/** A display-field value as text: strings as they are, a lookup `{ key, label }`
 *  (either door hydrates lookups to objects) by its label — an entity whose
 *  only title-like field is a lookup/select otherwise had no name at all. */
function displayPart(v: unknown): string {
  if (typeof v === 'string') return v.trim();
  if (v && typeof v === 'object' && 'label' in v) {
    const l = (v as { label?: unknown }).label;
    return l === null || l === undefined ? '' : String(l).trim();
  }
  return '';
}

export function displayNameOf(entity: EntityKey, fields: Record<string, unknown>): string {
  const parts = (DISPLAY_FIELDS[entity] ?? [])
    .map(k => displayPart(fields[k]))
    .filter(v => v !== '');
  if (parts.length > 0) return parts.join(' ');
  for (const [k, rule] of Object.entries(FIELD_RULES[entity] ?? {})) {
    if (rule.kind !== 'text' && rule.kind !== 'email') continue;
    const v = fields[k];
    if (typeof v === 'string' && v.trim() !== '') return v.trim();
  }
  return '';
}

export function ruleOf(entity: EntityKey, key: string): FieldRule | undefined {
  return FIELD_RULES[entity]?.[key];
}

/** The field label as the user sees it — the owner's policy label first (a
 *  public page's "Felder anpassen"), runtime bundle second, generated label last. */
export function labelOf(entity: EntityKey, key: string): string {
  const own = policyLabel(entity, key);
  if (own) return own;
  const fromBundle = fieldLabel(entity, key);
  if (fromBundle !== key) return fromBundle;
  return ruleOf(entity, key)?.label ?? key;
}

export function entityLabel(entity: EntityKey): string {
  const fromBundle = appLabel(entity);
  if (fromBundle !== entity) return fromBundle;
  return ENTITIES[entity]?.label ?? entity;
}

/** Lookup options with runtime labels — the only legitimate source of `{key,label}` pairs. */
export function optionsOf(entity: EntityKey, key: string): Array<{ key: string; label: string }> {
  const generated = (LOOKUP_OPTIONS as Record<string, Record<string, Array<{ key: string; label: string }>>>)[entity]?.[key];
  if (generated && generated.length) return generated.map(o => ({ key: o.key, label: o.label }));
  const keys = ruleOf(entity, key)?.options ?? [];
  return keys.map(k => ({ key: k, label: lookupLabel(entity, key, k) ?? k }));
}

export function isEmptyValue(v: unknown): boolean {
  if (v === undefined || v === null) return true;
  if (typeof v === 'string') return v.trim() === '';
  if (Array.isArray(v)) return v.length === 0;
  if (typeof v === 'object' && 'from' in (v as object) && 'to' in (v as object)) {
    const r = v as { from: unknown; to: unknown };
    return isEmptyValue(r.from) && isEmptyValue(r.to);
  }
  return false;
}
