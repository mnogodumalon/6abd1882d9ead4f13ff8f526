/**
 * EntityCrud — pre-generated CRUD + overlay plumbing for the dashboard.
 * Compose it; NEVER re-roll dialog state, submit handlers, an overlay stack
 * or a RecordOverlayHost in the page — this file owns all of it.
 *
 * API at a glance:
 *   const data = useDashboardData();
 *   const crud = useEntityCrud(data, {
 *     // optional — the ONE semantic slot on the overlay: the record's next
 *     // workflow step. Return undefined for types without one.
 *     footer: (top) => top.type === 'hersteller'
 *       ? { label: …, onClick: () => … }
 *       : undefined,
 *   });
 *
 *   `top.type` is the SAME camelCase key as `crud.<entity>` — one spelling
 *   per entity, everywhere in this API.
 *   …
 *   crud.hersteller.openCreate({ …defaults })   // create dialog, prefilled — defaults are
 *                                       // shape-tolerant: bare lookup keys / record ids are fine
 *   crud.hersteller.openEdit(record)            // edit dialog (recordId + defaults wired)
 *   crud.hersteller.openDetail(record)          // record overlay — pass the RAW record,
 *                                       // enrichment is resolved inside
 *   crud.overlay                         // RecordOverlayStack<OverlayItem> for drills:
 *                                       // push / pop / replace / close
 *   crud.enriched.hersteller              // the display-ready array for EVERY entity —
 *                                       // Enriched* where relations exist, the raw array
 *                                       // otherwise. Reuse these; never call enrich*()
 *                                       // in the page, and never guess which entity has
 *                                       // one: they all do.
 *   {crud.surfaces}                      // render ONCE at the end of the page JSX:
 *                                       // all entity dialogs + the overlay host
 *
 * Built in (do NOT re-implement): optimistic update + Rückgängig counter-write
 * on edit, fetchAll-on-error, edit-from-overlay, and per-entity overlay bodies
 * (RecordHeader + <{Entity}Details> with every relation reachable and the
 * contextual "+" prefilled; list-field back-references additionally get a
 * "choose existing" picker that links an EXISTING record — built in, do not
 * re-roll). Drag writes (onEventDrop/onCardMove) stay YOURS:
 * optimistic setter first, PATCH in background, undoToast with counter-write.
 *
 * Overlay content per entity (the host renders these — you never compose
 * Details blocks yourself):
 *   hersteller: name, land, website, beschreibung  ·  ← keyboards (list + contextual +)
 *   keyboards: bezeichnung, hersteller, typ, schaltertyp, layout, tastenanzahl, verbindungsart, farbe, …  ·  → hersteller
 */
import { useState, useMemo, type ReactNode } from 'react';
import type { Hersteller, Keyboards } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { LivingAppsService, createRecordUrl } from '@/services/livingAppsService';
import { enrichKeyboards } from '@/lib/enrich';
import type { EnrichedKeyboards } from '@/types/enriched';
import { useDashboardData } from '@/hooks/useDashboardData';
import {
  useRecordOverlayStack, RecordOverlayHost, RecordHeader,
  type RecordOverlayStack,
} from '@/components/widgets/RecordView';
import { HerstellerDialog, type HerstellerDialogDefaults } from '@/components/dialogs/HerstellerDialog';
import { HerstellerDetails } from '@/components/details/HerstellerDetails';
import { KeyboardsDialog, type KeyboardsDialogDefaults } from '@/components/dialogs/KeyboardsDialog';
import { KeyboardsDetails } from '@/components/details/KeyboardsDetails';
import { AI_PHOTO_SCAN, AI_PHOTO_LOCATION } from '@/config/ai-features';
import { t, appLabel } from '@/i18n';
import { undoToast } from '@/lib/polish';
import { formatDate } from '@/lib/formatters';

// The overlay union — one branch per entity, `record` typed the way the data
// flows: Enriched* where enrichment exists, the raw record type otherwise.
// The host resolves enrichment itself; pages pass raw records everywhere.
export type OverlayItem =
  | { type: 'hersteller'; record: Hersteller }
  | { type: 'keyboards'; record: EnrichedKeyboards };

/** The useDashboardData() return — pass it in, never re-fetch inside. */
export type EntityCrudData = ReturnType<typeof useDashboardData>;

export interface EntityCrudOptions {
  /** Per-type overlay footer — the record's next workflow step. */
  footer?: (top: OverlayItem) => ReactNode | { label: ReactNode; onClick: () => void } | undefined;
  placement?: 'side' | 'center';
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export interface EntityCrudApi<TRecord, TDefaults> {
  /** Open the create dialog, optionally prefilled (shape-tolerant defaults). */
  openCreate: (defaults?: TDefaults) => void;
  /** Open the edit dialog for a record (recordId + defaults are wired). */
  openEdit: (record: TRecord) => void;
  /** Open the record overlay (raw record is fine — enrichment resolved inside). */
  openDetail: (record: TRecord) => void;
}

export interface EntityCrud {
  /** The overlay stack for drills: push / pop / replace / close. */
  overlay: RecordOverlayStack<OverlayItem>;
  /** Render ONCE at the end of the page JSX — all dialogs + the overlay host. */
  surfaces: ReactNode;
  hersteller: EntityCrudApi<Hersteller, HerstellerDialogDefaults>;
  keyboards: EntityCrudApi<Keyboards, KeyboardsDialogDefaults>;
  /** The display-ready array per entity: Enriched* where an enrich function
   *  exists, the raw array otherwise. One key per entity so no page has to
   *  know which is which. Reuse these; never re-enrich in the page. */
  enriched: { hersteller: Hersteller[]; keyboards: EnrichedKeyboards[] };
}

export function useEntityCrud(data: EntityCrudData, options?: EntityCrudOptions): EntityCrud {
  const overlay = useRecordOverlayStack<OverlayItem>();
  const [herstellerDialog, setHerstellerDialog] = useState<{ defaults?: HerstellerDialogDefaults; editing?: Hersteller } | null>(null);
  const [keyboardsDialog, setKeyboardsDialog] = useState<{ defaults?: KeyboardsDialogDefaults; editing?: Keyboards } | null>(null);
  const enrichedKeyboards = useMemo(() => enrichKeyboards(data.keyboards, { herstellerMap: data.herstellerMap }), [data.keyboards, data.herstellerMap]);

  function detailHersteller(record: Hersteller, push = false) {
    const item: OverlayItem = { type: 'hersteller', record };
    if (push) overlay.push(item); else overlay.replace(item);
  }

  async function submitHersteller(fields: Hersteller['fields']) {
    const editing = herstellerDialog?.editing;
    if (editing) {
      const prev = editing;
      data.setHersteller(list => list.map(r => (r.record_id === editing.record_id ? { ...r, fields } : r)));
      try {
        await LivingAppsService.updateHerstellerEntry(editing.record_id, fields);
      } catch (err) {
        data.fetchAll();
        throw err;
      }
      undoToast(`${appLabel('hersteller')} — ${t('crud_updated')}`, async () => {
        data.setHersteller(list => list.map(r => (r.record_id === prev.record_id ? prev : r)));
        try { await LivingAppsService.updateHerstellerEntry(prev.record_id, prev.fields); } catch { data.fetchAll(); }
      });
    } else {
      await LivingAppsService.createHerstellerEntry(fields);
      undoToast(`${appLabel('hersteller')} — ${t('crud_created')}`);
      data.fetchAll();
    }
  }

  function detailKeyboards(record: Keyboards, push = false) {
    const rec = enrichedKeyboards.find(r => r.record_id === record.record_id);
    if (!rec) return;
    const item: OverlayItem = { type: 'keyboards', record: rec };
    if (push) overlay.push(item); else overlay.replace(item);
  }

  async function submitKeyboards(fields: Keyboards['fields']) {
    const editing = keyboardsDialog?.editing;
    if (editing) {
      const prev = editing;
      data.setKeyboards(list => list.map(r => (r.record_id === editing.record_id ? { ...r, fields } : r)));
      try {
        await LivingAppsService.updateKeyboard(editing.record_id, fields);
      } catch (err) {
        data.fetchAll();
        throw err;
      }
      undoToast(`${appLabel('keyboards')} — ${t('crud_updated')}`, async () => {
        data.setKeyboards(list => list.map(r => (r.record_id === prev.record_id ? prev : r)));
        try { await LivingAppsService.updateKeyboard(prev.record_id, prev.fields); } catch { data.fetchAll(); }
      });
    } else {
      await LivingAppsService.createKeyboard(fields);
      undoToast(`${appLabel('keyboards')} — ${t('crud_created')}`);
      data.fetchAll();
    }
  }

  const surfaces = (
    <>
      <HerstellerDialog
        open={herstellerDialog !== null}
        onClose={() => setHerstellerDialog(null)}
        onSubmit={submitHersteller}
        defaultValues={herstellerDialog?.defaults}
        recordId={herstellerDialog?.editing?.record_id}
        enablePhotoScan={AI_PHOTO_SCAN['Hersteller']}
        enablePhotoLocation={AI_PHOTO_LOCATION['Hersteller']}
      />
      <KeyboardsDialog
        open={keyboardsDialog !== null}
        onClose={() => setKeyboardsDialog(null)}
        onSubmit={submitKeyboards}
        defaultValues={keyboardsDialog?.defaults}
        recordId={keyboardsDialog?.editing?.record_id}
        herstellerList={data.hersteller}
        enablePhotoScan={AI_PHOTO_SCAN['Keyboards']}
        enablePhotoLocation={AI_PHOTO_LOCATION['Keyboards']}
      />
      <RecordOverlayHost
        overlay={overlay}
        placement={options?.placement}
        size={options?.size}
        footer={options?.footer}
        render={(top) => {
          if (top.type === 'hersteller') {
            return (
              <>
                <RecordHeader title={top.record.fields.name ?? appLabel('hersteller')} subtitle={undefined} />
                <HerstellerDetails
                  record={top.record}
                  keyboardsList={data.keyboards}
                  onOpenKeyboards={(r) => detailKeyboards(r, true)}
                  onAddKeyboards={() => setKeyboardsDialog({ defaults: { hersteller: createRecordUrl(APP_IDS.HERSTELLER, top.record.record_id) } })}
                />
              </>
            );
          }
          if (top.type === 'keyboards') {
            return (
              <>
                <RecordHeader title={top.record.fields.bezeichnung ?? appLabel('keyboards')} subtitle={top.record.fields.kaufdatum ? formatDate(top.record.fields.kaufdatum) : undefined} />
                <KeyboardsDetails
                  record={top.record}
                  herstellerList={data.hersteller}
                  onOpenHersteller={(r) => detailHersteller(r, true)}
                />
              </>
            );
          }
          return null;
        }}
        onEdit={(top) => {
          overlay.close();
          if (top.type === 'hersteller') setHerstellerDialog({ editing: top.record, defaults: top.record.fields });
          if (top.type === 'keyboards') setKeyboardsDialog({ editing: top.record, defaults: top.record.fields });
        }}
      />
    </>
  );

  return {
    overlay,
    surfaces,
    hersteller: {
      openCreate: (defaults?: HerstellerDialogDefaults) => setHerstellerDialog({ defaults }),
      openEdit: (record: Hersteller) => setHerstellerDialog({ editing: record, defaults: record.fields }),
      openDetail: (record: Hersteller) => detailHersteller(record, false),
    },
    keyboards: {
      openCreate: (defaults?: KeyboardsDialogDefaults) => setKeyboardsDialog({ defaults }),
      openEdit: (record: Keyboards) => setKeyboardsDialog({ editing: record, defaults: record.fields }),
      openDetail: (record: Keyboards) => detailKeyboards(record, false),
    },
    enriched: { hersteller: data.hersteller, keyboards: enrichedKeyboards },
  };
}
