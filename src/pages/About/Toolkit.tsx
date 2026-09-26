import { useState } from 'react';
import { t, useLocale, type MessageKey } from '../../i18n';
import { Eyebrow, Reveal } from '../../components/ui/Primitives';

const tools: { name: MessageKey; role: MessageKey; description: MessageKey; symbol: string }[] = [
  {
    name: 'about.033',
    role: 'toolkit.figma.role',
    description: 'toolkit.figma.description',
    symbol: '◫',
  },
  {
    name: 'about.034',
    role: 'toolkit.react.role',
    description: 'toolkit.react.description',
    symbol: '</>',
  },
  {
    name: 'about.035',
    role: 'toolkit.typescript.role',
    description: 'toolkit.typescript.description',
    symbol: '{ }',
  },
  {
    name: 'about.036',
    role: 'toolkit.vite.role',
    description: 'toolkit.vite.description',
    symbol: '↯',
  },
  {
    name: 'about.037',
    role: 'toolkit.motion.role',
    description: 'toolkit.motion.description',
    symbol: '≈',
  },
  {
    name: 'about.038',
    role: 'toolkit.dotnet.role',
    description: 'toolkit.dotnet.description',
    symbol: '⌘',
  },
];

export default function Toolkit() {
  useLocale();
  const [selected, setSelected] = useState(0);
  const active = tools[selected];
  return (
    <section className="studio-toolkit container" aria-labelledby="toolkit-title">
      <div className="toolkit-heading">
        <div>
          <Eyebrow>{t('about.032')}</Eyebrow>
          <h2 id="toolkit-title">
            {t('toolkit.title')}
            <br />
            <span>{t('toolkit.titleAccent')}</span>
          </h2>
        </div>
        <p>{t('about.039')}</p>
      </div>
      <Reveal className="tool-workbench">
        <div
          className="tool-display"
          id="tool-detail"
          role="region"
          aria-label={t('toolkit.detail')}
        >
          <div className="tool-display-meta eyebrow">
            <span>
              <i />
              {t('toolkit.system')}
            </span>
            <span>0{selected + 1} / 06</span>
          </div>
          <div className={`tool-diagram tool-diagram-${selected}`} aria-hidden="true">
            <div className="tool-orbit orbit-a" />
            <div className="tool-orbit orbit-b" />
            <span className="tool-axis axis-x" />
            <span className="tool-axis axis-y" />
            <div className="tool-core" key={active.symbol}>
              {active.symbol}
            </div>
            <span className="tool-node node-a" />
            <span className="tool-node node-b" />
            <span className="tool-diagram-label">{t('toolkit.diagram')}</span>
          </div>
          <div className="tool-description" key={active.name}>
            <span className="eyebrow">{t(active.role)}</span>
            <h3>{t(active.name).trim()}</h3>
            <p>{t(active.description)}</p>
          </div>
        </div>
        <div className="tool-selector">
          <p className="eyebrow tool-selector-label">{t('toolkit.explore')}</p>
          <div role="group" aria-label={t('toolkit.choose')}>
            {tools.map((tool, index) => (
              <button
                key={tool.name}
                type="button"
                className="tool-option"
                aria-pressed={selected === index}
                aria-controls="tool-detail"
                onClick={() => setSelected(index)}
              >
                <span className="tool-index">0{index + 1}</span>
                <span className="tool-option-name">
                  {t(tool.name).trim()}
                  <small>{t(tool.role)}</small>
                </span>
                <span className="tool-option-arrow" aria-hidden="true">
                  ↗
                </span>
              </button>
            ))}
          </div>
          <p className="tool-selector-note">{t('toolkit.note')}</p>
        </div>
      </Reveal>
    </section>
  );
}
