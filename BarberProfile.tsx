import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowUpRight, ImageIcon, ZoomIn } from 'lucide-react'
import Modal from './Modal'
import type { Barber, BarberCut } from './data'

type Props = {
  barber: Barber
  onClose: () => void
  onBook: (cut?: BarberCut) => void
}

export default function BarberProfile({ barber, onClose, onBook }: Props) {
  const [category, setCategory] = useState('All')
  const [selectedCut, setSelectedCut] = useState<BarberCut | null>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const galleryRef = useRef<HTMLDivElement>(null)
  const lastCutId = useRef<string | null>(null)
  const categories = ['All', ...new Set(barber.portfolio.map((cut) => cut.category))]
  const cuts = category === 'All' ? barber.portfolio : barber.portfolio.filter((cut) => cut.category === category)
  useEffect(() => {
    if (selectedCut) headingRef.current?.focus()
    else Array.from(galleryRef.current?.querySelectorAll<HTMLButtonElement>('[data-cut-id]') ?? []).find((button) => button.dataset.cutId === lastCutId.current)?.focus()
  }, [selectedCut])

  return <Modal title={barber.name} onClose={onClose} size="wide">
    <div className="barber-profile-content">
      {selectedCut ? <>
        <button className="profile-back" type="button" onClick={() => setSelectedCut(null)}><ArrowLeft size={16} aria-hidden="true" /> Back to {barber.name.split(' ')[0]}’s work</button>
        <h3 className="profile-cut-heading" ref={headingRef} tabIndex={-1}>{selectedCut.title}</h3>
        <p className="profile-cut-description">{selectedCut.description}</p>
        <img className="profile-cut-full" src={selectedCut.image} alt={`${selectedCut.title} by ${barber.name}`} />
      </> : <>
        <div className="profile-intro">
          <img className="profile-portrait" src={barber.image} alt={barber.name} />
          <div><p className="profile-role">Barber · The South Barbers</p><h3>Your next cut starts with a conversation.</h3><p>Explore {barber.name.split(' ')[0]}’s work, find a finish you like, and bring your preference to the chair.</p></div>
        </div>
        <div className="profile-work-heading"><h3>Behind the cuts</h3><span>{barber.portfolio.length ? `${barber.portfolio.length} ${barber.portfolio.length === 1 ? 'cut' : 'cuts'}` : 'Portfolio coming soon'}</span></div>
        {barber.portfolio.length > 0 ? <>
          {categories.length > 2 && <div className="profile-filters" aria-label="Filter haircut portfolio">{categories.map((option) => <button type="button" key={option} aria-pressed={category === option} onClick={() => setCategory(option)}>{option}</button>)}</div>}
          <p className="sr-only" role="status">{cuts.length} cuts shown</p>
          <div className="profile-cut-grid" ref={galleryRef}>{cuts.map((cut) => <button type="button" className="profile-cut" key={cut.id} data-cut-id={cut.id} onClick={() => { lastCutId.current = cut.id; setSelectedCut(cut) }} aria-label={`View ${cut.title} by ${barber.name}`}><span className="profile-cut-photo"><img src={cut.image} alt={cut.title} loading="lazy" /><ZoomIn size={20} aria-hidden="true" /></span><strong>{cut.title}</strong><span>{cut.category}</span></button>)}</div>
        </> : <div className="profile-empty"><ImageIcon size={30} strokeWidth={1.4} aria-hidden="true" /><h4>A closer look is on its way.</h4><p>We’re gathering {barber.name.split(' ')[0]}’s haircut photos. Their own work will appear here so you can choose with confidence.</p><p className="profile-empty-note">No haircut photos have been assigned to this barber yet.</p></div>}
        <p className="profile-demo-note">{barber.portfolio.length ? "Choose a photo for a closer look, then book with this cut as your inspiration. Appointments are demonstration only." : "Demo profile. Portfolio photos will be added once supplied and matched to the correct barber."}</p>
      </>}
    </div>
    <div className="profile-footer"><span>{selectedCut ? `Your inspiration: ${selectedCut.title}` : `Your barber: ${barber.name}`}</span><button className="button button-gold" type="button" onClick={() => onBook(selectedCut ?? undefined)}>Book with {barber.name.split(' ')[0]} <ArrowUpRight size={17} aria-hidden="true" /></button><small>Opens a demo appointment with this barber selected.</small></div>
  </Modal>
}
