import { t } from '../i18n';
export type Project = {
  slug: string;
  name: string;
  sector: string;
  number: string;
  theme: 'nova' | 'eter';
  services: string[];
  year: string;
  tagline: string;
  description: string;
  colors: { name: string; hex: string; ink: string }[];
  treatments: { name: string; description: string; duration: string; price: string }[];
};

export function getProjects(): Project[] {
  return [
    {
      slug: 'clinica-dental',
      name: t('projects.001'),
      sector: t('projects.002'),
      number: '01',
      theme: 'nova',
      services: [t('projects.003'), t('projects.004'), t('projects.005')],
      year: '2026',
      tagline: t('projects.006'),
      description: t('projects.007'),
      colors: [
        { name: t('projects.008'), hex: '#F3F5F0', ink: '#172C37' },
        { name: t('projects.009'), hex: '#2458E5', ink: '#FFFFFF' },
        { name: t('projects.010'), hex: '#172C37', ink: '#FFFFFF' },
        { name: t('projects.011'), hex: '#D7E8DF', ink: '#172C37' },
      ],
      treatments: [
        {
          name: t('projects.012'),
          description: t('projects.013'),
          duration: t('projects.014'),
          price: t('projects.015'),
        },
        {
          name: t('projects.016'),
          description: t('projects.017'),
          duration: t('projects.018'),
          price: '60 €',
        },
        {
          name: t('projects.019'),
          description: t('projects.020'),
          duration: t('projects.021'),
          price: t('projects.022'),
        },
      ],
    },
    {
      slug: 'estudio-estetica',
      name: t('projects.023'),
      sector: t('projects.024'),
      number: '02',
      theme: 'eter',
      services: [t('projects.025'), t('projects.026'), t('projects.005')],
      year: '2026',
      tagline: t('projectcard.011'),
      description: t('projects.027'),
      colors: [
        { name: t('projects.028'), hex: '#F3EDE3', ink: '#48382E' },
        { name: t('projects.029'), hex: '#B5927D', ink: '#2B211C' },
        { name: t('projects.030'), hex: '#48382E', ink: '#F3EDE3' },
        { name: t('projects.031'), hex: '#DEBCB1', ink: '#48382E' },
      ],
      treatments: [
        {
          name: t('projects.032'),
          description: t('projects.033'),
          duration: t('projects.021'),
          price: '85 €',
        },
        {
          name: t('projects.034'),
          description: t('projects.035'),
          duration: t('projects.036'),
          price: '70 €',
        },
        {
          name: t('projects.037'),
          description: t('projects.038'),
          duration: t('projects.039'),
          price: '120 €',
        },
      ],
    },
  ];
}
