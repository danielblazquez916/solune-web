import { useRef, useState, type KeyboardEvent } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { t, useLocale } from '../../i18n';
import ContactForm from '../../components/ui/ContactForm';
import BrandLogo from '../../components/ui/BrandLogo';
import BookingDialog from './BookingDialog';

export default function ContactMethods() {
  useLocale();
  const reduced = useReducedMotion();
  const [method, setMethod] = useState<'email' | 'meeting'>('email');
  const [booking, setBooking] = useState(false);
  const bookingTrigger = useRef<HTMLButtonElement>(null);
  function changeWithKeyboard(event: KeyboardEvent<HTMLButtonElement>) {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const next =
      event.key === 'Home'
        ? 'email'
        : event.key === 'End'
          ? 'meeting'
          : method === 'email'
            ? 'meeting'
            : 'email';
    setMethod(next);
    document.getElementById(`contact-tab-${next}`)?.focus();
  }
  return (
    <div className="contact-methods">
      <div className="contact-tabs" role="tablist" aria-label={t('contact.methods')}>
        {(['email', 'meeting'] as const).map((value) => (
          <button
            key={value}
            type="button"
            role="tab"
            id={`contact-tab-${value}`}
            aria-controls={`contact-panel-${value}`}
            aria-selected={method === value}
            tabIndex={method === value ? 0 : -1}
            onClick={() => setMethod(value)}
            onKeyDown={changeWithKeyboard}
          >
            {t(`contact.method.${value}`)}
          </button>
        ))}
      </div>
      <div className="contact-method-panels">
        {(['email', 'meeting'] as const).map((value) => (
          <motion.div
            key={value}
            role="tabpanel"
            id={`contact-panel-${value}`}
            aria-labelledby={`contact-tab-${value}`}
            aria-hidden={method !== value}
            inert={method !== value}
            className={`contact-method-panel ${method === value ? 'is-active' : ''}`}
            initial={false}
            animate={{ opacity: method === value ? 1 : 0, y: reduced || method === value ? 0 : 8 }}
            transition={{ duration: reduced ? 0 : 0.25 }}
          >
            {value === 'email' ? (
              <div className="contact-form-column">
                <div className="contact-form-heading">
                  <p className="eyebrow">
                    <span className="status-dot" />
                    {t('contact.formKicker')}
                  </p>
                  <h2>{t('contact.formTitle')}</h2>
                </div>
                <ContactForm />
              </div>
            ) : (
              <div className="meeting-card">
                <div className="meeting-topline">
                  <p className="eyebrow">{t('meeting.kicker')}</p>
                  <p>{t('meeting.duration')}</p>
                </div>
                <div className="meeting-connection" aria-label={t('meeting.connection')}>
                  <div>
                    <BrandLogo />
                    <span>Solune</span>
                  </div>
                  <span className="meeting-arrow" aria-hidden="true">
                    →
                  </span>
                  <div>
                    <svg
                      viewBox="0 0 64 64"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1"
                      aria-hidden="true"
                    >
                      <circle cx="32" cy="20" r="9" />
                      <path d="M14 52v-6a18 18 0 0 1 36 0v6M10 57h44" />
                    </svg>
                    <span>{t('meeting.business')}</span>
                  </div>
                </div>
                <h2>
                  {t('meeting.title')} <span>{t('meeting.accent')}</span>
                </h2>
                <p className="meeting-intro">{t('meeting.intro')}</p>
                <ol className="meeting-agenda">
                  {(['business', 'website', 'help'] as const).map((item, index) => (
                    <li key={item}>
                      <span aria-hidden="true">0{index + 1}</span>
                      {t(`meeting.agenda.${item}`)}
                    </li>
                  ))}
                </ol>
                <p className="meeting-note">{t('meeting.before')}</p>
                <button
                  type="button"
                  className="button meeting-cta"
                  ref={bookingTrigger}
                  onClick={() => setBooking(true)}
                  aria-haspopup="dialog"
                >
                  {t('meeting.choose')}
                  <span aria-hidden="true">↗</span>
                </button>
                <p className="meeting-note meeting-privacy">{t('meeting.note')}</p>
              </div>
            )}
          </motion.div>
        ))}
      </div>
      {booking && <BookingDialog onClose={() => setBooking(false)} returnFocus={bookingTrigger} />}
    </div>
  );
}
