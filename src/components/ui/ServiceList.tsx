import { Link } from 'react-router-dom';
import { getServices } from '../../data/services';

export default function ServiceList({ detailed = false }: { detailed?: boolean }) {
  return (
    <div className={`service-list ${detailed ? 'detailed' : ''}`}>
      {getServices().map((service) => (
        <Link key={service.slug} to={`/servicios/${service.slug}`} className="service-row">
          <span className="eyebrow">({service.number})</span>
          <div>
            <h3>{service.short}</h3>
            {detailed && <p>{service.intro}</p>}
          </div>
          <span className="service-row-name">{service.name}</span>
          <span className="service-row-arrow" aria-hidden="true">
            ↗
          </span>
        </Link>
      ))}
    </div>
  );
}
