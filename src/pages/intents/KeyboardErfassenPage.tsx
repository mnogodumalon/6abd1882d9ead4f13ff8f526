/**
 * Keyboard erfassen — 3-Schritt-Wizard.
 * Steps: 1) Hersteller wählen → 2) Keyboard-Details → 3) Kaufinformationen → 4) Prüfen & anlegen.
 * Reads: hersteller. Writes: keyboards (createKeyboard).
 * Composes: IntentWizardShell, WizardStep, EntitySelectStep, ChoiceGroup, Bound, StepNav, SummaryStep, SuccessStep.
 */
import { useState } from 'react';
import { tx } from '@/i18n';
import { servicePort } from '@/services/journeyPort';
import { useStepForm, useJourneySubmit, useRecordSearch, fieldText } from '@/lib/journey';
import { IntentWizardShell, WizardStep } from '@/components/blocks/IntentWizardShell';
import { StepNav } from '@/components/blocks/StepNav';
import { SummaryStep } from '@/components/blocks/SummaryStep';
import { SuccessStep } from '@/components/blocks/SuccessStep';
import { Bound } from '@/components/blocks/Bound';
import { EntitySelectStep } from '@/components/blocks/EntitySelectStep';

export default function KeyboardErfassenPage() {
  const [step, setStep] = useState(1);

  const hersteller = useRecordSearch(servicePort, 'hersteller', {
    searchFields: ['name'],
    toItem: h => ({
      id: h.id,
      title: fieldText(h, 'name'),
      subtitle: fieldText(h, 'land') || undefined,
    }),
  });

  const keyboard = useStepForm('keyboards', {
    steps: {
      hersteller: 1,
      bezeichnung: 2,
      typ: 2,
      layout: 2,
      schaltertyp: 2,
      tastenanzahl: 2,
      verbindungsart: 2,
      farbe: 2,
      zustand: 2,
      kaufdatum: 3,
      kaufpreis: 3,
      seriennummer: 3,
      notizen: 3,
    },
  });

  const submit = useJourneySubmit(servicePort, [
    { key: 'keyboard', entity: 'keyboards', form: keyboard, primary: true },
  ], { draftKey: 'keyboard-erfassen' });

  return (
    <IntentWizardShell
      title={tx('Keyboard erfassen')}
      currentStep={step}
      onStepChange={setStep}
      forms={[keyboard]}
      draftKey="keyboard-erfassen"
      intro={{
        description: tx('Ein neues Keyboard Schritt für Schritt erfassen und speichern.'),
        needs: [tx('Hersteller des Keyboards'), tx('Technische Details'), tx('Kaufinformationen')],
      }}
    >
      <WizardStep
        label={tx('Hersteller')}
        description={tx('Wähle den Hersteller des Keyboards aus.')}
      >
        <EntitySelectStep
          {...hersteller.select}
          selectedId={keyboard.get('hersteller') as string}
          onSelect={id => {
            keyboard.set('hersteller', id, hersteller.labelOf(id));
            setStep(2);
          }}
          create={{ fields: ['name', 'land', 'website'] }}
          avatar="none"
        />
      </WizardStep>

      <WizardStep
        label={tx('Details')}
        description={tx('Technische Eigenschaften des Keyboards angeben.')}
        needs={['hersteller']}
      >
        <div className="space-y-4">
          <Bound form={keyboard} name="bezeichnung" />
          <Bound form={keyboard} name="typ" />
          <Bound form={keyboard} name="layout" />
          <Bound form={keyboard} name="schaltertyp" hint={tx('z. B. Cherry MX Red, Gateron Brown')} />
          <Bound form={keyboard} name="tastenanzahl" hint={tx('Anzahl der Tasten')} />
          <Bound form={keyboard} name="verbindungsart" />
          <Bound form={keyboard} name="farbe" />
          <Bound form={keyboard} name="zustand" />
          <StepNav
            onNext={() => keyboard.validate(['bezeichnung', 'verbindungsart'])}
            nextStepLabel={tx('Kaufinfos')}
          />
        </div>
      </WizardStep>

      <WizardStep
        label={tx('Kaufinfos')}
        description={tx('Kaufdatum, Preis und Seriennummer eintragen.')}
        needs={['bezeichnung']}
      >
        <div className="space-y-4">
          <Bound form={keyboard} name="kaufdatum" />
          <Bound form={keyboard} name="kaufpreis" />
          <Bound form={keyboard} name="seriennummer" />
          <Bound form={keyboard} name="notizen" rows={3} />
          <StepNav
            onNext={() => keyboard.validate(['kaufdatum', 'kaufpreis', 'seriennummer', 'notizen'])}
            nextStepLabel={tx('Prüfen')}
          />
        </div>
      </WizardStep>

      <WizardStep label={tx('Prüfen')}>
        {!submit.done && (
          <SummaryStep
            forms={[keyboard]}
            submit={submit}
            whatHappensNext={tx('Das Keyboard wird in der Datenbank gespeichert und ist sofort verfügbar.')}
          />
        )}
      </WizardStep>

      {submit.result && (
        <SuccessStep
          result={submit.result}
          forms={[keyboard]}
          submit={submit}
          whatHappensNext={tx('Das Keyboard ist jetzt erfasst. Du kannst den Zustand später über „Zustand ändern" aktualisieren.')}
          next={[
            { label: tx('Zustand ändern'), href: '#/intents/keyboard-zustand' },
            { label: tx('Zum Dashboard'), href: '#/' },
          ]}
        />
      )}
    </IntentWizardShell>
  );
}
