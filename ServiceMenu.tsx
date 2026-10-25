import { useState } from 'react'
import { ArrowRight, Check, Clock3 } from 'lucide-react'
import { services } from './data'

const groups = [
  { label: 'All services', names: services.map((service) => service.name) },
  { label: 'Haircuts', names: ['Classic Haircut', 'Fade Haircut', "Kids' Haircut"] },
  { label: 'Grooming', names: ['Beard Trim', 'Hair Styling'] },
  { label: 'Combinations', names: ['Haircut & Shampoo', 'Haircut & Beard'] },
]
const money = (value: number) => `₱${value.toLocaleString('en-PH')}`

export default function ServiceMenu({ onBook }: { onBook: (service: string) => void }) {
  const [group, setGroup] = useState('All services')
  const [selectedName, setSelectedName] = useState(services[0].name)
  const selected = services.find((service) => service.name === selectedName) ?? services[0]
  const visible = services.filter((service) => groups.find((item) => item.label === group)?.names.includes(service.name))
  const chooseGroup = (label: string) => {
    setGroup(label)
    const names = groups.find((item) => item.label === label)?.names ?? []
    if (!names.includes(selectedName)) setSelectedName(names[0] ?? services[0].name)
  }

  return <section id="services" className="section section-services service-menu-section">
    <div className="container service-menu-layout">
      <div className="service-menu-intro">
        <h2>A menu for<br />your next cut.</h2>
      </div>
      <div className="service-menu-panel" data-ui>
        <div className="service-menu-top"><h3>Choose your service</h3></div>
        <div className="service-menu-filters" role="group" aria-label="Service categories">{groups.map((item) => <button key={item.label} type="button" aria-pressed={group === item.label} onClick={() => chooseGroup(item.label)}>{item.label}</button>)}</div>
        <div className="service-menu-list" role="group" aria-label={`${group}, choose a service`}>
          {visible.map((service) => <button className={`service-menu-option ${selectedName === service.name ? 'is-selected' : ''}`} type="button" key={service.name} aria-pressed={selectedName === service.name} onClick={() => setSelectedName(service.name)}>
            <span className="service-menu-check" aria-hidden="true">{selectedName === service.name && <Check size={15} />}</span>
            <span className="service-menu-name"><strong>{service.name}</strong><span><Clock3 size={13} aria-hidden="true" />{service.duration}</span></span>
            <span className="service-menu-price">{money(service.price)}</span>
          </button>)}
        </div>
        <div className="service-menu-selection">
          <div className="service-menu-summary" role="status" aria-live="polite" aria-atomic="true"><span>Your selection</span><h4>{selected.name}</h4><p>{selected.description}</p><div><span>{selected.duration}</span><strong>{money(selected.price)} <small>sample price</small></strong></div></div>
          <button className="button service-menu-book" type="button" onClick={() => onBook(selected.name)}>Continue with this service <ArrowRight size={17} aria-hidden="true" /></button>
          <p className="service-menu-note">Demo booking only. Choose your barber, date, and time next.</p>
        </div>
      </div>
    </div>
  </section>
}
