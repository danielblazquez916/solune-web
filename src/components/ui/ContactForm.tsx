import { t, useLocale, type MessageKey } from '../../i18n';
import { useCallback, useRef, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import {
  submitContactForm,
  ContactRequestError,
  contactLimits,
  validateContact,
  type ContactData,
  type ContactErrors,
} from '../../lib/contact';

import Turnstile, { type VerificationState } from './Turnstile';
import { contactApiUrl, contactConfigured, turnstileSiteKey } from '../../data/contact';

const emptyForm: ContactData = {
  name: '',
  email: '',
  company: '',
  phone: '',
  message: '',
  privacy: false,
};

export default function ContactForm() {
  useLocale();
  const [data, setData] = useState<ContactData>({ ...emptyForm });
  const [errors, setErrors] = useState<ContactErrors>({});
  const [status, setStatus] = useState<'idle' | 'error' | 'submitting' | 'success'>('idle');
  const [serverError, setServerError] = useState<MessageKey | ''>('');
  const submitting = useRef(false);
  const token = useRef('');
  const [verification, setVerification] = useState<VerificationState>('pending');
  const [resetKey, setResetKey] = useState(0);
  const onVerification = useCallback((next: string, state: VerificationState) => {
    token.current = next;
    setVerification(state);
  }, []);
  function update<K extends keyof ContactData>(field: K, value: ContactData[K]) {
    setData((previous) => ({ ...previous, [field]: value }));
    setErrors((previous) => ({ ...previous, [field]: undefined }));
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    const issues = validateContact(data);
    setErrors(issues);
    setServerError('');
    if (Object.keys(issues).length) {
      setStatus('error');
      document.getElementById(`contact-${Object.keys(issues)[0]}`)?.focus();
      return;
    }
    if (!contactConfigured || !token.current) {
      setServerError(
        contactConfigured
          ? 'contact.failure.turnstile_invalid'
          : 'contact.failure.service_unavailable',
      );
      setStatus('error');
      return;
    }
    submitting.current = true;
    setStatus('submitting');
    const currentToken = token.current;
    token.current = '';
    try {
      await submitContactForm(data, currentToken, contactApiUrl);
      setData({ ...emptyForm });
      setErrors({});
      setStatus('success');
    } catch (error) {
      setServerError(
        `contact.failure.${error instanceof ContactRequestError ? error.code : 'network'}`,
      );
      setStatus('error');
    } finally {
      submitting.current = false;
      setVerification('pending');
      setResetKey((value) => value + 1);
    }
  }

  function fieldProps(field: keyof ContactData) {
    return {
      id: `contact-${field}`,
      'aria-invalid': !!errors[field],
      'aria-describedby': errors[field] ? `${field}-error` : undefined,
    };
  }
  function error(field: keyof ContactData) {
    return (
      errors[field] && (
        <span className="field-error" id={`${field}-error`}>
          {t(errors[field])}
        </span>
      )
    );
  }
  return (
    <div className="contact-form-wrap">
      {status === 'success' ? (
        <div className="form-success" role="status">
          <span className="success-mark" aria-hidden="true">
            ↗
          </span>
          <p className="eyebrow">{t('contactform.003')}</p>
          <h2>{t('contactform.005')}</h2>
          <p>{t('contactform.007')}</p>
          <button className="button" onClick={() => setStatus('idle')}>
            {t('contactform.008')}
            <span>↗</span>
          </button>
        </div>
      ) : (
        <form
          className="contact-form"
          noValidate
          onSubmit={submit}
          aria-busy={status === 'submitting'}
        >
          <fieldset disabled={status === 'submitting'}>
            <legend className="eyebrow">{t('contactform.009')}</legend>
            <div className="form-grid">
              {(
                [
                  {
                    key: 'name',
                    label: t('contactform.010'),
                    placeholder: t('contactform.011'),
                    type: 'text',
                    autocomplete: 'name',
                  },
                  {
                    key: 'email',
                    label: t('contactform.012'),
                    placeholder: t('contact.emailPlaceholder'),
                    type: 'email',
                    autocomplete: 'email',
                  },
                  {
                    key: 'company',
                    label: t('contactform.013'),
                    placeholder: t('contactform.014'),
                    type: 'text',
                    autocomplete: 'organization',
                  },
                  {
                    key: 'phone',
                    label: t('contactform.015'),
                    placeholder: '+34',
                    type: 'tel',
                    autocomplete: 'tel',
                  },
                ] as const
              ).map((field) => (
                <div className="form-field" key={field.key}>
                  <label htmlFor={`contact-${field.key}`}>
                    {field.label}
                    {field.key !== 'phone' && ' *'}
                  </label>
                  <input
                    {...fieldProps(field.key)}
                    type={field.type}
                    autoComplete={field.autocomplete}
                    required={field.key !== 'phone'}
                    value={data[field.key]}
                    maxLength={contactLimits[field.key]}
                    onChange={(event) => update(field.key, event.target.value)}
                    placeholder={field.placeholder}
                  />
                  {error(field.key)}
                </div>
              ))}
            </div>
            <div className="form-field message-field">
              <label htmlFor="contact-message">{t('contactform.026')}</label>
              <textarea
                {...fieldProps('message')}
                required
                value={data.message}
                onChange={(event) => update('message', event.target.value)}
                rows={4}
                maxLength={5000}
                placeholder={t('contactform.027')}
              />
              {error('message')}
            </div>
            <div className="privacy-field">
              <input
                {...fieldProps('privacy')}
                type="checkbox"
                required
                checked={data.privacy}
                onChange={(event) => update('privacy', event.target.checked)}
              />
              <label htmlFor="contact-privacy">
                {t('contactform.028')}
                <Link to="/privacidad">{t('contactform.029')}</Link>. *
              </label>
            </div>
            {error('privacy')}
            {contactConfigured ? (
              <Turnstile siteKey={turnstileSiteKey} resetKey={resetKey} onChange={onVerification} />
            ) : (
              <p className="contact-verification-note" role="status">
                {t('contact.failure.service_unavailable')}
              </p>
            )}
            <div className="form-status" role="alert">
              {status === 'error' && (serverError ? t(serverError) : t('contactform.030'))}
            </div>
            <div className="form-submit">
              <button
                className="button"
                type="submit"
                disabled={status === 'submitting' || !contactConfigured || verification !== 'ready'}
              >
                {status === 'submitting' ? t('contactform.031') : t('contactform.032')}{' '}
                <span aria-hidden="true">↗</span>
              </button>
              <p>{status === 'submitting' ? t('contactform.031') : t('contactform.033')}</p>
            </div>
          </fieldset>
        </form>
      )}
    </div>
  );
}
