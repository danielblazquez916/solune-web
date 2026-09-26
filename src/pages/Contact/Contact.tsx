import { t, useLocale } from '../../i18n';
import SEO from '../../components/ui/SEO';
import { PageHero } from '../../components/ui/Primitives';
import ContactForm from '../../components/ui/ContactForm';
import { motion, useReducedMotion } from 'framer-motion';
import './contact.css';

export default function Contact() {
  useLocale();
  const reduced = useReducedMotion();
  const promises = [
    {
      label: t('contact.trust.choice'),
      title: t('contact.trust.no'),
      accent: t('contact.trust.commitment'),
      text: t('contact.trust.choiceText'),
    },
    {
      label: t('contact.trust.easy'),
      title: t('contact.trust.reply'),
      accent: t('contact.trust.hours'),
      text: t('contact.trust.replyText'),
    },
    {
      label: t('contact.trust.clear'),
      title: t('contact.trust.budget'),
      accent: t('contact.trust.fixed'),
      text: t('contact.trust.budgetText'),
    },
  ];
  return (
    <div className="contact-page">
      <SEO title={t('contact.001')} description={t('contact.002')} />
      <PageHero
        label={t('contact.003')}
        lines={[t('contact.004'), t('contact.005')]}
        text={t('contact.008')}
      />
      <section className="contact-content container">
        <div className="contact-confidence">
          <ol className="contact-promises">
            {promises.map((promise, index) => (
              <motion.li
                key={index}
                initial={reduced ? false : 'hidden'}
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
              >
                <motion.span
                  aria-hidden="true"
                  className="trust-divider"
                  variants={{ hidden: { scaleX: 0 }, visible: { scaleX: 1 } }}
                  transition={{ duration: reduced ? 0 : 0.65, delay: reduced ? 0 : index * 0.07 }}
                />
                <motion.div
                  variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}
                  transition={{ duration: reduced ? 0 : 0.45, delay: reduced ? 0 : index * 0.07 }}
                >
                  <p className="eyebrow trust-label">
                    <span>0{index + 1} /</span> {promise.label}
                  </p>
                  <h2>
                    {promise.title} <span>{promise.accent}</span>
                  </h2>
                  <p className="trust-description">{promise.text}</p>
                </motion.div>
              </motion.li>
            ))}
          </ol>
          <div className="contact-direct">
            <a className="contact-email" href="mailto:hola@solune.dev">
              {t('contact.directEmail')}
            </a>
            <p className="eyebrow">
              {t('footer.005')}
              <br />
              {t('contact.009')}
            </p>
          </div>
        </div>
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
      </section>
    </div>
  );
}
