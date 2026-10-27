import { useState } from 'react'
import { ArrowRight, Check } from 'lucide-react'
import { formatServicePrice, formatServiceTotal, services } from './data'

const groups = [
  { label: 'All services', names: services.map((service) => service.name) },
  ...['Haircuts', 'Grooming', 'Combinations', 'Color'].map((label) => ({ label, names: services.filter((service) => service.category === label).map((service) => service.name) })),
]

export default function ServiceMenu({ onBook }: { onBook: (services: string[]) => void }) {
  const [group, setGroup] = useState('All services')
  const [selectedNames, setSelectedNames] = useState<string[]>([])
  const selected = services.filter((service) => selectedNames.includes(service.name))
  const visible = services.filter((service) => groups.find((item) => item.label === group)?.names.includes(service.name))
  const toggleService = (name: string) => {
    setSelectedNames((current) => current.includes(name) ? current.filter((item) => item !== name) : [...current, name])
  }

  return <section id="services" className="section section-services service-menu-section">
    <div className="container service-menu-layout">
      <div className="service-menu-intro">
        <h2>A menu for<br />your next cut.</h2>
      </div>
      <div className="service-menu-panel" data-ui>
        <div className="service-menu-top"><h3>Choose your services</h3><p>Select one or more services.</p></div>
        <div className="service-menu-filters" role="group" aria-label="Service categories">{groups.map((item) => <button key={item.label} type="button" aria-pressed={group === item.label} onClick={() => setGroup(item.label)}>{item.label}</button>)}</div>
        <div className="service-menu-list" role="group" aria-label={`${group}, choose services`}>
          {visible.map((service) => <button className={`service-menu-option ${selectedNames.includes(service.name) ? 'is-selected' : ''}`} type="button" key={service.name} aria-pressed={selectedNames.includes(service.name)} onClick={() => toggleService(service.name)}>
            <span className="service-menu-check" aria-hidden="true">{selectedNames.includes(service.name) && <Check size={15} />}</span>
            <span className="service-menu-name"><strong>{service.name}</strong></span>
            <span className="service-menu-price">{formatServicePrice(service)}</span>
          </button>)}
        </div>
        <div className="service-menu-selection">
          <div className="service-menu-summary" role="status" aria-live="polite" aria-atomic="true">
            <span>Your selection</span>
            {selected.length ? <ul className="selected-service-list">{selected.map((service) => <li key={service.name}><span>{service.name}</span><strong>{formatServicePrice(service)}</strong></li>)}</ul> : <p>Select services to see your total.</p>}
            <div className="service-menu-total"><span>Total cost</span><strong>{formatServiceTotal(selected)}</strong></div>
          </div>
          <button className="button service-menu-book" type="button" disabled={!selected.length} onClick={() => onBook(selectedNames)}>Continue with selected services <ArrowRight size={17} aria-hidden="true" /></button>
          <p className="service-menu-note">Demo booking only. Choose your barber, date, and time next.</p>
        </div>
      </div>
    </div>
  </section>
}
