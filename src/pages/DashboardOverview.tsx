import { useState } from 'react';
import type { DashboardData } from '@/hooks/useDashboardData';
import { useEntityCrud } from '@/components/EntityCrud';
import { LOOKUP_OPTIONS, lookupOption } from '@/types/app';
import { LivingAppsService } from '@/services/livingAppsService';
import { formatDate, formatCurrency, lookupKey, displayMultiLookup } from '@/lib/formatters';
import { useClock, gruss, namen, undoToast } from '@/lib/polish';
import { tx, appLabel } from '@/i18n';
import { DashboardGrid } from '@/components/DashboardGrid';
import { StatStrip, StatStripItem } from '@/components/StatCard';
import { WorkList } from '@/components/WorkList';
import { KanbanWidget } from '@/components/widgets/KanbanWidget';
import type { KanbanCard } from '@/components/widgets/KanbanWidget';
import { ChartWidget } from '@/components/widgets/ChartWidget';
import type { ChartRow } from '@/components/widgets/ChartWidget';
import { Button } from '@/components/ui/button';
import {
  IconKeyboard,
  IconBuildingFactory2,
  IconAlertTriangle,
  IconPlus,
  IconFilter,
} from '@tabler/icons-react';

export default function DashboardOverview({ data }: { data: DashboardData }) {
  const { hersteller, keyboards, fetchAll } = data;
  const crud = useEntityCrud(data);
  const enrichedKeyboards = crud.enriched.keyboards;

  const clock = useClock();

  // Active filter: null = all, otherwise typ-key
  const [typFilter, setTypFilter] = useState<string | null>(null);

  // ── Derived counts ──────────────────────────────────────────────────
  const defekte = enrichedKeyboards.filter(k => lookupKey(k.fields.zustand) === 'defekt');
  const total = keyboards.length;
  const herstellerCount = hersteller.length;

  // Keyboards by typ, optionally filtered
  const filteredKeyboards = typFilter
    ? enrichedKeyboards.filter(k => lookupKey(k.fields.typ) === typFilter)
    : enrichedKeyboards;

  // ── Kanban: typ-Spalten ─────────────────────────────────────────────
  const typColumns = (LOOKUP_OPTIONS['keyboards']?.['typ'] ?? []).map(o => ({
    key: o.key,
    label: o.label,
  }));

  const kanbanCards: KanbanCard[] = filteredKeyboards.map(k => ({
    id: `keyboard:${k.record_id}`,
    column: lookupKey(k.fields.typ) ?? '',
    title: k.fields.bezeichnung ?? tx('Unbenannt'),
    subtitle: (
      <span className="flex flex-wrap gap-x-2 text-xs text-muted-foreground">
        {k.herstellerName && <span>{k.herstellerName}</span>}
        {k.fields.farbe && <span>· {k.fields.farbe}</span>}
        {k.fields.zustand && (
          <span
            className={
              lookupKey(k.fields.zustand) === 'defekt'
                ? 'font-semibold text-destructive'
                : lookupKey(k.fields.zustand) === 'neu'
                ? 'text-emerald-600'
                : 'text-muted-foreground'
            }
          >
            · {k.fields.zustand.label}
          </span>
        )}
      </span>
    ),
    tone:
      lookupKey(k.fields.zustand) === 'defekt'
        ? 'destructive'
        : lookupKey(k.fields.zustand) === 'neu'
        ? 'success'
        : 'default',
  }));

  // onCardMove: ändern des Typs (nicht Zustand) via drag
  const handleCardMove = async (cardId: string, newColumn: string) => {
    const id = cardId.split(':')[1];
    const record = keyboards.find(k => k.record_id === id);
    if (!record) return;
    const prevTyp = record.fields.typ;
    const newTypLookup = lookupOption('keyboards', 'typ', newColumn);
    // Optimistic
    data.setKeyboards(prev =>
      prev.map(k =>
        k.record_id === id ? { ...k, fields: { ...k.fields, typ: newTypLookup } } : k
      )
    );
    try {
      await LivingAppsService.updateKeyboard(id, { typ: newColumn });
      const colLabel = typColumns.find(c => c.key === newColumn)?.label ?? newColumn;
      undoToast(
        tx`${record.fields.bezeichnung ?? ''} — Typ auf ${colLabel} geändert`,
        async () => {
          data.setKeyboards(prev =>
            prev.map(k =>
              k.record_id === id ? { ...k, fields: { ...k.fields, typ: prevTyp } } : k
            )
          );
          await LivingAppsService.updateKeyboard(id, { typ: lookupKey(prevTyp) ?? '' });
        }
      );
    } catch {
      await fetchAll();
    }
  };

  // ── ChartWidget rows: Keyboards nach Verbindungsart ─────────────────
  const chartRowsVerbindung: ChartRow<typeof enrichedKeyboards[0]>[] = enrichedKeyboards.map(k => ({
    id: `keyboard:${k.record_id}`,
    data: k,
  }));

  // ── ChartWidget rows: Keyboards nach Zustand ────────────────────────
  const chartRowsZustand: ChartRow<typeof enrichedKeyboards[0]>[] = enrichedKeyboards.map(k => ({
    id: `keyboard:${k.record_id}`,
    data: k,
  }));

  // ── Defekte Liste (WorkList) ────────────────────────────────────────
  const defekteItems = defekte.map(k => ({
    id: k.record_id,
    title: k.fields.bezeichnung ?? tx('Unbenannt'),
    secondLine: (
      <span className="flex gap-2 text-xs">
        <span className="font-medium text-destructive">{tx('Defekt')}</span>
        {k.herstellerName && (
          <span className="text-muted-foreground">· {k.herstellerName}</span>
        )}
        {k.fields.kaufdatum && (
          <span className="text-muted-foreground">· {tx('Gekauft')}: {formatDate(k.fields.kaufdatum)}</span>
        )}
      </span>
    ),
  }));

  // ── Greetings context line ──────────────────────────────────────────
  const neuesteKeyboards = [...enrichedKeyboards]
    .sort((a, b) => (b.createdat ?? '').localeCompare(a.createdat ?? ''))
    .slice(0, 2);
  const neuesteNamen = namen(neuesteKeyboards.map(k => k.fields.bezeichnung ?? ''));

  const contextLine =
    total === 0
      ? tx('Noch keine Keyboards erfasst — leg deine erste Tastatur an!')
      : neuesteKeyboards.length > 0
      ? tx`Zuletzt hinzugefügt: ${neuesteNamen}.`
      : tx`${total} Keyboards in ${herstellerCount} Marken.`;

  // ── Typ-Filter label ────────────────────────────────────────────────
  const activeTypLabel = typFilter
    ? typColumns.find(c => c.key === typFilter)?.label ?? typFilter
    : null;

  // ── Empty state ─────────────────────────────────────────────────────
  if (total === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{gruss(clock)}</h1>
          <p className="text-muted-foreground mt-1">{contextLine}</p>
        </div>
        <div className="flex flex-col items-center justify-center gap-4 py-20 rounded-2xl border-2 border-dashed border-border">
          <IconKeyboard size={48} className="text-muted-foreground" stroke={1.5} />
          <p className="text-muted-foreground text-sm text-center max-w-xs">
            {tx('Noch kein Keyboard erfasst. Fang jetzt an, deine Sammlung aufzubauen!')}
          </p>
          <Button onClick={() => crud.keyboards.openCreate({})}>
            <IconPlus size={16} className="shrink-0 mr-2" />
            {tx('Erstes Keyboard anlegen')}
          </Button>
        </div>
        {crud.surfaces}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-wrap items-start gap-3 justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight truncate">{gruss(clock)}</h1>
          <p className="text-muted-foreground mt-0.5 text-sm">{contextLine}</p>
        </div>
        <div className="flex gap-2 shrink-0 flex-wrap">
          <Button variant="outline" size="sm" onClick={() => crud.hersteller.openCreate({})}>
            <IconBuildingFactory2 size={16} className="shrink-0 mr-1.5" />
            {appLabel('hersteller')}
          </Button>
          <Button size="sm" onClick={() => crud.keyboards.openCreate({})}>
            <IconPlus size={16} className="shrink-0 mr-1.5" />
            {appLabel('keyboards')}
          </Button>
        </div>
      </div>

      <DashboardGrid
        variant="wide"
        kpis={
          <StatStrip>
            <StatStripItem
              title={tx('Keyboards gesamt')}
              value={total}
              icon={<IconKeyboard size={16} />}
            />
            <StatStripItem
              title={tx('Hersteller')}
              value={herstellerCount}
              icon={<IconBuildingFactory2 size={16} />}
            />
            <StatStripItem
              title={tx('Defekt')}
              value={defekte.length}
              tone={defekte.length > 0 ? 'destructive' : 'default'}
              icon={<IconAlertTriangle size={16} />}
            />
          </StatStrip>
        }
        primary={
          <div className="space-y-3">
            {/* Typ-Filter chip */}
            {activeTypLabel && (
              <div className="flex items-center gap-2">
                <IconFilter size={14} className="text-muted-foreground shrink-0" />
                <span className="text-sm text-muted-foreground">
                  {tx('Typ-Filter')}: <strong>{activeTypLabel}</strong>
                </span>
                <button
                  className="text-xs text-primary hover:underline"
                  onClick={() => setTypFilter(null)}
                >
                  {tx('Zurücksetzen')}
                </button>
              </div>
            )}
            <KanbanWidget
              columns={typColumns}
              cards={kanbanCards}
              onCardClick={card => {
                const id = card.id.split(':')[1];
                const record = keyboards.find(k => k.record_id === id);
                if (record) crud.keyboards.openDetail(record);
              }}
              onCardMove={handleCardMove}
              onAddCard={colKey =>
                crud.keyboards.openCreate({ typ: colKey })
              }
            />
          </div>
        }
        aside={
          <>
            <WorkList
              title={tx('Defekte Keyboards')}
              items={defekteItems}
              onItemClick={id => {
                const record = keyboards.find(k => k.record_id === id);
                if (record) crud.keyboards.openDetail(record);
              }}
              empty={{
                text: tx('Kein Keyboard defekt — alles in Ordnung!'),
                action: {
                  label: tx('Keyboard hinzufügen'),
                  onClick: () => crud.keyboards.openCreate({}),
                },
              }}
            />
            <ChartWidget
              title={tx('Keyboards nach Zustand')}
              rows={chartRowsZustand}
              dimension={{
                kind: 'category',
                accessor: r => r.data.fields.zustand,
              }}
            />
          </>
        }
      />

      {crud.surfaces}
    </div>
  );
}
