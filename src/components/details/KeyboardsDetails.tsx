import type { Keyboards, Hersteller } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { extractRecordId } from '@/services/livingAppsService';
import {
  RecordSection, RecordField, RecordRelation, RecordAttachments,
} from '@/components/widgets/RecordView';
import { t, appLabel, fieldLabel } from '@/i18n';
import { MediaThumbnail } from '@/components/widgets/MediaViewer';

export interface KeyboardsDetailsProps {
  /** Der Record — enriched oder roh; alle Felder werden hier gerendert. */
  record: Keyboards;
  /** N:1-Ziel „Hersteller": volle Liste (Hook-Array) — der Block löst Name + Schlüsselfelder selbst auf. */
  herstellerList: Hersteller[];
  /** Klick auf die Hersteller-Relation → overlay.push auf dessen Detail. */
  onOpenHersteller?: (record: Hersteller) => void;
}

export function KeyboardsDetails({
  record,
  herstellerList,
  onOpenHersteller,
}: KeyboardsDetailsProps) {
  const herstellerTarget = herstellerList.find(r => r.record_id === extractRecordId(record.fields.hersteller));
  return (
    <>
      <RecordSection title={t('details')} cols={2}>
        <RecordField label={fieldLabel('keyboards', 'bezeichnung')} value={record.fields.bezeichnung} format="text" />
        <RecordField label={fieldLabel('keyboards', 'typ')} value={record.fields.typ} format="pill" />
        <RecordField label={fieldLabel('keyboards', 'schaltertyp')} value={record.fields.schaltertyp} format="text" />
        <RecordField label={fieldLabel('keyboards', 'layout')} value={record.fields.layout} format="pill" />
        <RecordField label={fieldLabel('keyboards', 'tastenanzahl')} value={record.fields.tastenanzahl} format="text" />
        <RecordField label={fieldLabel('keyboards', 'verbindungsart')} value={Array.isArray(record.fields.verbindungsart) ? record.fields.verbindungsart.map((v: unknown) => (v && typeof v === 'object' && 'label' in v) ? (v as {label: unknown}).label : v).join(', ') : null} format="text" />
        <RecordField label={fieldLabel('keyboards', 'farbe')} value={record.fields.farbe} format="text" />
        <RecordField label={fieldLabel('keyboards', 'zustand')} value={record.fields.zustand} format="pill" />
        <RecordField label={fieldLabel('keyboards', 'bild')} className="md:col-span-2">
          {record.fields.bild ? (
            <MediaThumbnail src={record.fields.bild as string} fit="contain" className="max-h-64 w-full rounded-lg" />
          ) : '—'}
        </RecordField>
        <RecordField label={fieldLabel('keyboards', 'kaufdatum')} value={record.fields.kaufdatum} format="date" />
        <RecordField label={fieldLabel('keyboards', 'kaufpreis')} value={record.fields.kaufpreis} format="text" />
        <RecordField label={fieldLabel('keyboards', 'seriennummer')} value={record.fields.seriennummer} format="text" />
        <RecordField label={fieldLabel('keyboards', 'notizen')} value={record.fields.notizen} format="longtext" className="md:col-span-2" />
      </RecordSection>

      {/* N:1 — verknüpfte Records: IMMER klickbar, nie eine Text-Sackgasse. */}
      <RecordSection title={t('relations')} cols={1}>
        <RecordRelation
          label={fieldLabel('keyboards', 'hersteller')}
          name={herstellerTarget?.fields.name ?? '—'}
          meta={[herstellerTarget?.fields.land].filter(Boolean).join(' · ') || undefined}
          onClick={herstellerTarget && onOpenHersteller ? () => onOpenHersteller!(herstellerTarget!) : undefined}
        />
      </RecordSection>

      <RecordAttachments appId={APP_IDS.KEYBOARDS} recordId={record.record_id} />
    </>
  );
}
