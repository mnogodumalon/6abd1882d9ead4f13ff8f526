import type { Hersteller, Keyboards } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { extractRecordId } from '@/services/livingAppsService';
import {
  RecordSection, RecordField, RecordRelation, RecordAttachments,
} from '@/components/widgets/RecordView';
import { t, appLabel, fieldLabel } from '@/i18n';
import { SatelliteSection } from '@/components/SatelliteSection';

export interface HerstellerDetailsProps {
  /** Der Record — enriched oder roh; alle Felder werden hier gerendert. */
  record: Hersteller;
  /** 1:N „Keyboards" (hersteller): VOLLE Liste — der Block filtert auf diesen Record. */
  keyboardsList: Keyboards[];
  /** Zeilen-Klick → overlay.push auf das Keyboards-Detail (nie der Edit-Dialog). */
  onOpenKeyboards: (record: Keyboards) => void;
  /** Kontextuelles „+": öffnet den Keyboards-Dialog mit diesem Record vorgesetzt. */
  onAddKeyboards: () => void;
}

export function HerstellerDetails({
  record,
  keyboardsList,
  onOpenKeyboards,
  onAddKeyboards,
}: HerstellerDetailsProps) {
  return (
    <>
      <RecordSection title={t('details')} cols={2}>
        <RecordField label={fieldLabel('hersteller', 'name')} value={record.fields.name} format="text" />
        <RecordField label={fieldLabel('hersteller', 'land')} value={record.fields.land} format="text" />
        <RecordField label={fieldLabel('hersteller', 'website')} value={record.fields.website} format="url" />
        <RecordField label={fieldLabel('hersteller', 'beschreibung')} value={record.fields.beschreibung} format="longtext" className="md:col-span-2" />
      </RecordSection>

      <SatelliteSection
        title={appLabel('keyboards')}
        items={keyboardsList.filter(r => extractRecordId(r.fields.hersteller) === record.record_id)}
        map={r => ({ name: r.fields.bezeichnung ?? appLabel('keyboards'), meta: r.fields.kaufdatum })}
        onOpen={onOpenKeyboards}
        onAdd={onAddKeyboards}
        getKey={r => r.record_id}
      />

      <RecordAttachments appId={APP_IDS.HERSTELLER} recordId={record.record_id} />
    </>
  );
}
