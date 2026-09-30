/**
 * Keyboard-Zustand aktualisieren — 2-Schritt-Wizard.
 * Steps: 1) Keyboard wählen → 2) Neuen Zustand & Notiz eingeben → 3) Prüfen & speichern.
 * Reads: keyboards. Writes: keyboards (update — zustand, notizen).
 * Composes: IntentWizardShell, WizardStep, EntitySelectStep, ChoiceGroup, Bound, StepNav, SummaryStep, SuccessStep.
 */
import { useState } from 'react';
import { IntentWizardShell, WizardStep } from '@/components/blocks/IntentWizardShell';
import { EntitySelectStep } from '@/components/blocks/EntitySelectStep';
import { Bound } from '@/components/blocks/Bound';
import { StepNav } from '@/components/blocks/StepNav';
import { SummaryStep } from '@/components/blocks/SummaryStep';
import { SuccessStep } from '@/components/blocks/SuccessStep';
import { useStepForm, useJourneySubmit, useRecordSearch, fieldLookup, fieldText } from '@/lib/journey';
import { servicePort } from '@/services/journeyPort';
import { tx } from '@/i18n';

export default function KeyboardZustandPage() {
  const [step, setStep] = useState(1);
  const [keyboardId, setKeyboardId] = useState<string | null>(null);

  const keyboards = useRecordSearch(servicePort, 'keyboards', {
    searchFields: ['bezeichnung'],
    toItem: k => ({
      id: k.id,
      title: fieldText(k, 'bezeichnung'),
      subtitle: fieldLookup(k, 'zustand')?.label ?? undefined,
    }),
  });

  const f = useStepForm('keyboards', {
    fields: ['zustand', 'notizen'],
    steps: { zustand: 2, notizen: 2 },
  });

  const submit = useJourneySubmit(servicePort, [
    {
      key: 'keyboard',
      entity: 'keyboards',
      form: f,
      updates: keyboardId ?? '',
      primary: true,
      verb: 'update',
    },
  ], { draftKey: 'keyboard-zustand' });

  return (
    <IntentWizardShell
      title={tx('Keyboard-Zustand aktualisieren')}
      currentStep={step}
      onStepChange={setStep}
      forms={[f]}
      draftKey="keyboard-zustand"
      intro={{
        description: tx('Den Zustand eines vorhandenen Keyboards nach Nutzung, Reparatur oder Verkauf aktualisieren.'),
        needs: [tx('Das betroffene Keyboard'), tx('Neuer Zustand')],
      }}
    >
      <WizardStep
        label={tx('Keyboard')}
        description={tx('Das Keyboard wählen, dessen Zustand sich geändert hat.')}
      >
        <EntitySelectStep
          {...keyboards.select}
          avatar="none"
          selectedId={keyboardId}
          onSelect={id => {
            setKeyboardId(id);
            setStep(2);
          }}
          searchPlaceholder={tx('Bezeichnung suchen …')}
          create={false}
        />
      </WizardStep>

      <WizardStep
        label={tx('Neuer Zustand')}
        description={tx('Zustand auswählen und optional eine Anmerkung hinterlassen.')}
      >
        {keyboardId ? (
          <div className="space-y-6">
            <Bound form={f} name="zustand" />
            <Bound form={f} name="notizen" rows={3} hint={tx('Optionale Anmerkung zur Zustandsänderung')} />
            <StepNav
              onBack={() => setStep(1)}
              onNext={() => f.validate(['zustand'])}
              nextStepLabel={tx('Prüfen')}
            />
          </div>
        ) : (
          <StepNav
            onBack={() => setStep(1)}
            nextDisabled
          >
            <p className="text-sm text-muted-foreground">
              {tx('Bitte zuerst ein Keyboard wählen.')}
            </p>
          </StepNav>
        )}
      </WizardStep>

      <WizardStep label={tx('Prüfen')}>
        {!submit.done && (
          <SummaryStep
            forms={[f]}
            submit={submit}
            whatHappensNext={tx('Der neue Zustand wird sofort auf dem Keyboard gespeichert.')}
            confirmLabel={tx('Zustand speichern')}
          />
        )}
      </WizardStep>

      {submit.result && (
        <SuccessStep
          result={submit.result}
          forms={[f]}
          verb="updated"
          actions={{ copy: false, print: false }}
          next={[
            {
              label: tx('Weiteres Keyboard aktualisieren'),
              onClick: () => {
                submit.reset();
                f.reset();
                setKeyboardId(null);
                setStep(1);
              },
            },
            { label: tx('Keyboard erfassen'), href: '#/intents/keyboard-erfassen' },
            { label: tx('Zum Dashboard'), href: '#/' },
          ]}
          whatHappensNext={tx('Der aktualisierte Zustand ist ab sofort in der Übersicht sichtbar.')}
        />
      )}
    </IntentWizardShell>
  );
}
