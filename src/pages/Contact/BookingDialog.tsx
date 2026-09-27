import { useEffect, useRef, useState, type RefObject } from 'react';
import { t, useLocale } from '../../i18n';
import { pauseSmoothScroll } from '../../components/layout/SmoothScroll';

const namespace = 'solune-contact-meeting';
type CalComponent = typeof import('@calcom/embed-react').default;

export default function BookingDialog({
  onClose,
  returnFocus,
}: {
  onClose: () => void;
  returnFocus: RefObject<HTMLButtonElement | null>;
}) {
  const locale = useLocale();
  const dialog = useRef<HTMLDialogElement>(null);
  const [Calendar, setCalendar] = useState<CalComponent | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const element = dialog.current!;
    const previousOverflow = document.body.style.overflow;
    element.showModal();
    pauseSmoothScroll(true);
    document.body.style.overflow = 'hidden';
    return () => {
      element.close();
      document.body.style.overflow = previousOverflow;
      pauseSmoothScroll(false);
      returnFocus.current?.focus({ preventScroll: true });
    };
  }, [returnFocus]);

  useEffect(() => {
    let disposed = false;
    let unsubscribe = () => {};
    setCalendar(null);
    setState('loading');
    const timer = setTimeout(() => {
      if (!disposed) setState('error');
    }, 20000);
    const ready = () => {
      if (!disposed) {
        clearTimeout(timer);
        setState('ready');
      }
    };
    const failed = () => {
      if (!disposed) {
        clearTimeout(timer);
        setState('error');
      }
    };
    void import('@calcom/embed-react')
      .then(async (module) => {
        if (disposed) return;
        const cal = await module.getCalApi({ namespace, embedJsUrl: 'https://cal.com/embed.js' });
        if (disposed) return;
        cal('on', { action: 'linkReady', callback: ready });
        cal('on', { action: 'linkFailed', callback: failed });
        cal('ui', {
          theme: 'dark',
          cssVarsPerTheme: {
            light: { 'cal-brand': '#ffd84a' },
            dark: { 'cal-brand': '#ffd84a', 'cal-brand-text': '#10110f' },
          },
          hideEventTypeDetails: false,
          layout: 'month_view',
        });
        unsubscribe = () => {
          cal('off', { action: 'linkReady', callback: ready });
          cal('off', { action: 'linkFailed', callback: failed });
        };
        setCalendar(() => module.default);
      })
      .catch(failed);
    return () => {
      disposed = true;
      clearTimeout(timer);
      unsubscribe();
    };
  }, [attempt]);

  return (
    <dialog
      ref={dialog}
      className="booking-dialog"
      aria-labelledby="booking-title"
      data-lenis-prevent
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          const rect = event.currentTarget.getBoundingClientRect();
          if (
            event.clientX < rect.left ||
            event.clientX > rect.right ||
            event.clientY < rect.top ||
            event.clientY > rect.bottom
          )
            onClose();
        }
      }}
    >
      <header className="booking-dialog-header">
        <div>
          <p className="eyebrow">Solune / Cal.com</p>
          <h2 id="booking-title">{t('meeting.choose')}</h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="booking-close"
          autoFocus
          aria-label={t('meeting.close')}
        >
          ×
        </button>
      </header>
      <div className="booking-status" role="status" aria-live="polite">
        {state === 'loading' && t('meeting.loading')}
        {state === 'error' && (
          <>
            <p>{t('meeting.error')}</p>
            <button
              type="button"
              className="text-link"
              onClick={() => setAttempt((value) => value + 1)}
            >
              {t('meeting.retry')}
            </button>
          </>
        )}
      </div>
      {Calendar && (
        <Calendar
          key={`${attempt}-${locale}`}
          namespace={namespace}
          calLink="solune/reunion-solune"
          calOrigin="https://cal.com"
          embedJsUrl="https://cal.com/embed.js"
          className="booking-embed"
          config={{
            theme: 'dark',
            layout: 'month_view',
            locale,
            iframeAttrs: { title: t('meeting.calendarTitle') },
          }}
        />
      )}
    </dialog>
  );
}
