import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, Clock3, Facebook, Instagram, Mail, MapPin, Menu, Phone, Scissors, Star, X } from 'lucide-react'
import BookingDialog from './BookingDialog'
import ServiceMenu from './ServiceMenu'
import ProductMockup from './ProductMockup'
import BarberProfile from './BarberProfile'
import BarberRoulette from './BarberRoulette'
import Modal from './Modal'
import { barbers, benefits, haircuts, heroImage, heroImageSequences, logoImage, products, testimonials } from './data'

type BookingRequest = { service?: string; barber?: string; notes?: string }
const money = (value: number) => `₱${value.toLocaleString('en-PH')}`
const navigation = [
  { label: 'Home', href: '#home' },
  { label: 'Haircuts', href: '#haircuts' },
  { label: 'Services', href: '#services' },
  { label: 'Products', href: '#products' },
  { label: 'Our Barbers', href: '#barbers' },
  { label: 'Book an Appointment', href: '#appointment' },
  { label: 'Contact', href: '#contact' },
]
const filterOptions = ['All', 'Fades', 'Texture']
const filterOptionRows = [
  filterOptions.slice(0, Math.ceil(filterOptions.length / 2)),
  filterOptions.slice(Math.ceil(filterOptions.length / 2)),
]

function BrandMark({ footer = false }: { footer?: boolean }) {
  return <a href="#home" className={`brand-mark ${footer ? 'brand-mark-footer' : ''}`} aria-label="The South Barber Studio home"><img className="brand-logo" src={logoImage} alt="" /><span className="brand-wordmark">The South<br />Barber Studio</span></a>
}

function HaircutModal({ item, onClose, onBook }: { item: typeof haircuts[number]; onClose: () => void; onBook: () => void }) {
  return <Modal title={item.name} onClose={onClose}>
    <img className="detail-image haircut-detail-image" src={item.image} alt={`Sample ${item.name} haircut`} />
    <div className="detail-content">
      <p>{item.description} Bring a reference or talk it through with your barber; we’ll shape the finish around your routine.</p>
      <div className="detail-meta"><span><Scissors size={17} /> {item.category}</span><span><Clock3 size={17} /> From 35 min</span></div>
      <button className="button button-gold button-full" type="button" onClick={onBook}>Start a booking request <ArrowRight size={17} /></button>
    </div>
  </Modal>
}

function ProductModal({ item, onClose }: { item: typeof products[number]; onClose: () => void }) {
  return <Modal title={item.name} onClose={onClose}>
    <ProductMockup name={item.name} index={item.mockup} className="product-detail-image" />
    <div className="detail-content">
      <div className="product-modal-meta"><span>{item.type}</span><strong>{money(item.price)}</strong></div>
      <p>{item.description}</p>
      <p className="sample-note">Sample catalog details only. Prices and availability are placeholders; this prototype does not sell or reserve items.</p>
      <span className="availability-pill">{item.availability}</span>
    </div>
  </Modal>
}

export default function App() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('#home')
  const [haircutFilter, setHaircutFilter] = useState('All')
  const [selectedHaircut, setSelectedHaircut] = useState<typeof haircuts[number] | null>(null)
  const [selectedBarber, setSelectedBarber] = useState<typeof barbers[number] | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<typeof products[number] | null>(null)
  const [bookingRequest, setBookingRequest] = useState<BookingRequest | null>(null)
  const [contactSent, setContactSent] = useState(false)
  const [activeHeroImage, setActiveHeroImage] = useState(heroImage)
  const [heroDrag, setHeroDrag] = useState<{
    currentImage: string
    nextImage: string
    direction: 'left' | 'right'
    deltaX: number
    settling: boolean
    committed: boolean
  } | null>(null)
  const haircutRowRefs = useRef<Array<HTMLDivElement | null>>([])
  const heroPointerStart = useRef<{ x: number; y: number; pointerId: number } | null>(null)
  const heroDragRef = useRef<typeof heroDrag>(null)
  const heroLeftIndex = useRef(0)
  const heroRightIndex = useRef(-1)
  const visibleHaircuts = useMemo(
    () => haircutFilter === 'All' ? haircuts : haircuts.filter((item) => item.category === haircutFilter),
    [haircutFilter],
  )
  const visibleHaircutCards = visibleHaircuts.map((item, index) => ({ item, index }))
  const haircutRowSplit = Math.ceil(visibleHaircutCards.length / 2)
  const visibleHaircutRows = [
    visibleHaircutCards.slice(0, haircutRowSplit),
    visibleHaircutCards.slice(haircutRowSplit),
  ]
  useEffect(() => {
    const sectionLinks = navigation
      .filter((item) => item.href.startsWith('#'))
      .map((item) => ({ href: item.href, section: document.querySelector<HTMLElement>(item.href) }))
      .filter((item): item is { href: string; section: HTMLElement } => item.section !== null)
    if (sectionLinks.length === 0) return

    let frame = 0
    const updateActiveSection = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const header = document.querySelector('.site-header')
        const activationLine = (header?.getBoundingClientRect().bottom ?? 0) + window.innerHeight * 0.35
        const current = sectionLinks.reduce((active, item) => {
          const top = item.section.getBoundingClientRect().top
          return top <= activationLine ? item.href : active
        }, sectionLinks[0].href)
        setActiveSection(current)
      })
    }
    updateActiveSection()
    window.addEventListener('scroll', updateActiveSection, { passive: true })
    window.addEventListener('resize', updateActiveSection)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', updateActiveSection)
      window.removeEventListener('resize', updateActiveSection)
    }
  }, [])
  const scrollHaircutRow = (rowIndex: number, direction: -1 | 1) => {
    const row = haircutRowRefs.current[rowIndex]
    row?.scrollBy({ left: row.clientWidth * 0.8 * direction, behavior: 'instant' })
  }
  const changeHeroImage = (direction: 'left' | 'right') => {
    const sequence = heroImageSequences[direction]
    const sequenceIndex = direction === 'left' ? heroLeftIndex : heroRightIndex
    sequenceIndex.current = (sequenceIndex.current + 1) % sequence.length
    setActiveHeroImage(sequence[sequenceIndex.current])
  }
  const handleHeroPointerDown = (event: React.PointerEvent<HTMLElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return
    heroPointerStart.current = { x: event.clientX, y: event.clientY, pointerId: event.pointerId }
    heroDragRef.current = null
    setHeroDrag(null)
    event.currentTarget.setPointerCapture(event.pointerId)
  }
  const commitHeroDrag = (drag: NonNullable<typeof heroDrag>, width: number) => {
    const sequenceIndex = drag.direction === 'left' ? heroLeftIndex : heroRightIndex
    sequenceIndex.current = (sequenceIndex.current + 1) % heroImageSequences[drag.direction].length
    const committedDrag = {
      ...drag,
      settling: false,
      committed: true,
    }
    heroPointerStart.current = null
    heroDragRef.current = committedDrag
    setHeroDrag(committedDrag)
    requestAnimationFrame(() => {
      const currentDrag = heroDragRef.current
      if (!currentDrag?.committed) return
      const settledDrag = {
        ...currentDrag,
        deltaX: currentDrag.direction === 'left' ? -width : width,
        settling: true,
      }
      heroDragRef.current = settledDrag
      setHeroDrag(settledDrag)
    })
  }
  const handleHeroPointerMove = (event: React.PointerEvent<HTMLElement>) => {
    const start = heroPointerStart.current
    if (!start || start.pointerId !== event.pointerId) return
    const deltaX = event.clientX - start.x
    const deltaY = event.clientY - start.y
    if (Math.abs(deltaX) < 8 || Math.abs(deltaX) < Math.abs(deltaY)) return

    const direction = deltaX < 0 ? 'left' : 'right'
    const sequence = heroImageSequences[direction]
    const sequenceIndex = direction === 'left' ? heroLeftIndex : heroRightIndex
    const drag = {
      currentImage: activeHeroImage,
      nextImage: sequence[(sequenceIndex.current + 1) % sequence.length],
      direction,
      deltaX: Math.max(-event.currentTarget.clientWidth, Math.min(event.currentTarget.clientWidth, deltaX)),
      settling: false,
      committed: false,
    }
    heroDragRef.current = drag
    setHeroDrag(drag)
  }
  const handleHeroPointerUp = (event: React.PointerEvent<HTMLElement>) => {
    const start = heroPointerStart.current
    heroPointerStart.current = null
    if (!start || start.pointerId !== event.pointerId) return
    const drag = heroDragRef.current
    if (!drag) return

    const committed = Math.abs(drag.deltaX) >= 56
    if (committed) {
      commitHeroDrag(drag, event.currentTarget.clientWidth)
      return
    }
    const settledDrag = {
      ...drag,
      deltaX: 0,
      settling: true,
      committed: false,
    }
    heroDragRef.current = settledDrag
    setHeroDrag(settledDrag)
  }
  const finishHeroDrag = () => {
    const drag = heroDragRef.current
    if (!drag?.settling) return
    if (drag.committed) setActiveHeroImage(drag.nextImage)
    heroDragRef.current = null
    setHeroDrag(null)
  }

  useEffect(() => {
    if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        entry.target.classList.add('motion-in')
        observer.unobserve(entry.target)
      })
    }, { threshold: 0.12 })
    const revealTargets = document.querySelectorAll<HTMLElement>([
      '.section-heading',
      '.section-intro',
      '.section-quick-link',
      '.haircut-card',
      '.service-heading',
      '.service-row',
      '.product-row',
      '.catalog-note',
      '.barber-card',
      '.barber-first-available',
      '.values-title',
      '.benefit-row',
      '.testimonial-lead',
      '.testimonial-card',
      '.map-placeholder',
      '.contact-detail',
      '.contact-hours',
      '.social-row',
      '.contact-form-heading',
      '.contact-form label',
      '.contact-form .button',
      '.footer-main',
      '.footer-bottom',
    ].join(', '))
    revealTargets.forEach((element) => {
      const siblings = element.parentElement ? Array.from(element.parentElement.children) : []
      const siblingIndex = siblings.indexOf(element)
      element.style.animationDelay = `${Math.min(Math.max(siblingIndex, 0), 4) * 65}ms`
      observer.observe(element)
    })
    return () => observer.disconnect()
  }, [])

  const openBooking = (request: BookingRequest = {}) => {
    setSelectedHaircut(null)
    setSelectedProduct(null)
    setSelectedBarber(null)
    setBookingRequest(request)
  }
  const closeBooking = () => setBookingRequest(null)
  const goHome = () => {
    setBookingRequest(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const handleContact = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setContactSent(true)
    event.currentTarget.reset()
  }

  return <>
    <a className="skip-link" href="#main-content">Skip to content</a>
    <header className="site-header">
      <div className="container nav-shell">
        <BrandMark />
        <div className="mobile-header-actions">
          <a className="button button-nav mobile-book-button" href="#services" onClick={() => setMobileNavOpen(false)}>Book Now <ArrowUpRight size={16} /></a>
          <button className="mobile-nav-toggle" type="button" aria-label={mobileNavOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={mobileNavOpen} onClick={() => setMobileNavOpen((open) => !open)}>
            {mobileNavOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
        <nav className={`main-nav ${mobileNavOpen ? 'is-open' : ''}`} aria-label="Main navigation">
          {navigation.map((item) => <a key={item.href} href={item.href} aria-current={activeSection === item.href ? 'location' : undefined} onClick={() => setMobileNavOpen(false)}>{item.label}</a>)}
          <a className="button button-nav" href="#services" onClick={() => setMobileNavOpen(false)}>Book Now <ArrowUpRight size={17} /></a>
        </nav>
      </div>
    </header>

    <main id="main-content" tabIndex={-1}>
      <section className="hero" id="home">
        <div className="container hero-inner">
          <div className="hero-heading">
            <h1>Your Style.<br />Your Cut.<br /><em>Your Standard.</em></h1>
          </div>
          <figure className={`hero-photo hero-photo-main${heroDrag ? ' hero-dragging' : ''}`} onPointerDown={handleHeroPointerDown} onPointerMove={handleHeroPointerMove} onPointerUp={handleHeroPointerUp} onPointerCancel={() => {
            heroPointerStart.current = null
            heroDragRef.current = null
            setHeroDrag(null)
          }} onDragStart={(event) => event.preventDefault()} onKeyDown={(event) => {
            if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
              event.preventDefault()
              changeHeroImage(event.key === 'ArrowLeft' ? 'left' : 'right')
            }
          }} tabIndex={0} role="group" aria-roledescription="image carousel" aria-label="Explore haircut styles. Swipe, drag, or use the arrow keys to change the image.">
            <img key="hero-current-image" className="hero-slide hero-slide-current" style={heroDrag ? { transform: `translateX(${heroDrag.deltaX}px)`, transition: heroDrag.settling ? 'transform .42s cubic-bezier(.2,.7,.2,1)' : 'none' } : undefined} src={heroDrag?.currentImage ?? activeHeroImage} alt={`Sample ${activeHeroImage === heroImageSequences.left[0] ? 'high fade' : activeHeroImage === heroImageSequences.left[1] ? 'mullet' : activeHeroImage === heroImageSequences.right[0] ? 'modern mullet' : 'mid fade'} haircut`} fetchPriority="high" draggable={false} />
            {heroDrag && <img className="hero-slide hero-slide-next" style={{ transform: `translateX(${heroDrag.direction === 'left' ? '100%' : '-100%'}) translateX(${heroDrag.deltaX}px)`, transition: heroDrag.settling ? 'transform .42s cubic-bezier(.2,.7,.2,1)' : 'none' }} src={heroDrag.nextImage} alt="" aria-hidden="true" draggable={false} onTransitionEnd={finishHeroDrag} />}
          </figure>
          <div className="hero-intro">
            <p>Est. MMXIV<br />Cut with intention</p>
          </div>
          <a href="#haircuts" className="hero-scroll">Scroll to explore <span aria-hidden="true">—</span></a>
        </div>
      </section>
      <div className="hero-ribbon" aria-label="Good hair isn't an accident. It's a conversation. Then it's a really good cut.">
        <span>Good hair isn’t an accident.</span><i /><span>It’s a conversation.</span><i /><span>Then it’s a really good cut.</span>
      </div>

      <section id="haircuts" className="section section-haircuts">
        <div className="container">
          <div className="section-heading-row">
            <div className="section-heading"><h2>Find your next look.</h2><p className="section-intro">A few of the shapes we love. Pick a starting point; we’ll make it yours.</p></div>
            <a className="text-link section-quick-link" href="#services">Explore all services <ArrowUpRight size={17} /></a>
          </div>
          <div className="filter-row" role="group" aria-label="Filter haircuts by category">
            {filterOptionRows.map((row, index) => <div className="filter-options-row" key={index}>
              {row.map((filter) => <button className={`filter-button ${haircutFilter === filter ? 'active' : ''}`} type="button" key={filter} aria-pressed={haircutFilter === filter} onClick={() => setHaircutFilter(filter)}>
                {filter}<span>{filter === 'All' ? haircuts.length : haircuts.filter((item) => item.category === filter).length}</span>
              </button>)}
            </div>)}
          </div>
          <div className="haircut-grid">
            {visibleHaircutRows.map((row, rowIndex) => <div className="haircut-carousel" key={rowIndex}>
              <button className="haircut-row-previous" type="button" aria-label={`Show previous haircuts in row ${rowIndex + 1}`} aria-controls={`haircut-row-${rowIndex + 1}`} onClick={() => scrollHaircutRow(rowIndex, -1)}>
                <ArrowLeft size={20} aria-hidden="true" />
              </button>
              <div className="haircut-options-row" id={`haircut-row-${rowIndex + 1}`} ref={(element) => { haircutRowRefs.current[rowIndex] = element }}>
                {row.map(({ item, index }) => <button className={`haircut-card haircut-card-${index + 1}`} type="button" key={item.name} onClick={() => setSelectedHaircut(item)}>
                  <div className="haircut-photo-wrap">
                    <img className="haircut-image" src={item.image} alt={`Sample ${item.name} haircut`} loading="lazy" />
                    <span className="image-arrow" aria-hidden="true"><ArrowUpRight size={19} /></span>
                  </div>
                  <div className="haircut-card-copy"><h3>{item.name}</h3><p>{item.description}</p></div>
                </button>)}
              </div>
              <button className="haircut-row-next" type="button" aria-label={`Show more haircuts in row ${rowIndex + 1}`} aria-controls={`haircut-row-${rowIndex + 1}`} onClick={() => scrollHaircutRow(rowIndex, 1)}>
                <ArrowRight size={20} aria-hidden="true" />
              </button>
            </div>)}
          </div>
          <div className="gallery-bottom">
            <p>Inspo is a starting point. The rest is yours.</p>
            <button className="text-link" type="button" onClick={() => openBooking()}>Find your barber <ArrowRight size={17} /></button>
          </div>
        </div>
      </section>

      <ServiceMenu onBook={(service) => openBooking({ service })} />

      <section id="products" className="section section-products">
        <div className="container">
          <div className="section-heading-row">
            <div className="section-heading"><h2>Good tools.<br />Easy routines.</h2></div>
            <p className="section-intro">A sample edit of everyday grooming essentials. Product details and prices are placeholders.</p>
          </div>
          <div className="product-list">
            {products.map((item) => <article className="product-row" key={item.name}>
              <ProductMockup name={item.name} index={item.mockup} className="product-mark" />
              <div className="product-copy"><h3>{item.name}</h3><p>{item.description}</p></div>
              <span className="product-type">{item.type}</span>
              <strong className="product-price">{money(item.price)}</strong>
              <button className="product-details" type="button" onClick={() => setSelectedProduct(item)}>Details <ArrowRight size={16} /></button>
            </article>)}
          </div>
          <p className="catalog-note">No shopping cart or checkout. This sample catalog is for browsing only.</p>
        </div>
      </section>

      <section id="barbers" className="section section-barbers">
        <div className="container">
          <div className="section-heading-row">
            <div className="section-heading"><h2>Meet your barber.</h2></div>
            <p className="section-intro">Get to know the person behind the chair. Open a profile to browse their cuts and choose the barber who suits your style.</p>
          </div>
          <div className="barber-grid">
            {barbers.map((item, index) => <article className={`barber-card barber-card-${index + 1}`} key={item.name}>
              <button type="button" className="barber-profile-tile" aria-label={`View ${item.name}’s profile and haircuts`} onClick={() => setSelectedBarber(item)}>
                <img className="barber-profile-image" src={item.image} alt={`${item.name}, barber at The South Barbers`} />
              </button>
              <h3 className="barber-name">{item.name}</h3>
              <div className="barber-tags" aria-label="Services">
                <span>Haircuts</span><span>Beard trims</span>
              </div>
              <div className="barber-card-actions"><button className="barber-book-link" type="button" onClick={() => setSelectedBarber(item)}>View Portfolio <ArrowUpRight size={16} aria-hidden="true" /></button></div>
            </article>)}
            <BarberRoulette onView={setSelectedBarber} />
          </div>
        </div>
      </section>

      <section id="why-us" className="section section-values">
        <div className="container values-layout">
          <div className="values-title"><h2>Good work<br />takes care.</h2><p>From the first conversation to the final detail, a good cut starts with listening.</p></div>
          <div className="benefit-list">
            {benefits.map((item) => <article className="benefit-row" key={item.title}><h3>{item.title}</h3><p>{item.text}</p></article>)}
          </div>
        </div>
      </section>

      <section className="section section-testimonials">
        <div className="container testimonials-layout">
          <div className="testimonial-lead">
            <h2>Good cuts<br />stay with you.</h2>
            <p>These reviews are demonstration content, not verified customer feedback.</p>
          </div>
          <div className="testimonial-list">
            {testimonials.map((item, index) => <article className={`testimonial-card testimonial-card-${index + 1}`} key={item.name}>
              <div className="testimonial-stars" aria-label={`${item.rating} out of 5 sample stars`}>{Array.from({ length: item.rating }).map((_, starIndex) => <Star size={17} key={starIndex} fill="currentColor" />)}</div>
              <blockquote>“{item.text}”</blockquote>
              <p className="testimonial-author"><strong>{item.name}</strong><span>Sample review</span></p>
            </article>)}
          </div>
        </div>
      </section>

      <section id="contact" className="section section-contact">
        <div className="container">
          <div className="section-heading-row">
            <div className="section-heading"><h2>Find your way<br />to The South.</h2></div>
            <p className="section-intro">Have a question before you book? Get in touch with the shop.</p>
          </div>
          <div className="contact-layout">
            <div className="contact-details">
              <div className="map-placeholder">
                <iframe
                  className="location-map"
                  title="OpenStreetMap preview of J. P. Rizal Street in Mendez"
                  src="https://www.openstreetmap.org/export/embed.html?bbox=120.8985%2C14.1337%2C120.9065%2C14.1378&layer=mapnik&marker=14.1357635%2C120.9025004"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
                <span className="map-caption">J. P. Rizal Street · approximate street location</span>
              </div>
              <a href="https://www.openstreetmap.org/way/77096305" target="_blank" rel="noreferrer" className="contact-detail">
                <MapPin size={20} /><span><strong>J. P. Rizal Street</strong><small>Poblacion VII, Mendez, Cavite, Philippines</small></span><ArrowUpRight size={17} />
              </a>
              <a href="tel:+639276563274" className="contact-detail"><Phone size={20} /><span><strong>0927 656 3274</strong><small>Call the shop</small></span><ArrowUpRight size={17} /></a>
              <a href="mailto:rhyanceasarflores@yahoo.com" className="contact-detail"><Mail size={20} /><span><strong>rhyanceasarflores@yahoo.com</strong><small>Email the shop</small></span><ArrowUpRight size={17} /></a>
              <p className="contact-hours"><Clock3 size={18} /> Monday–Saturday · 9 AM–6 PM · sample hours</p>
              <div className="social-row" aria-label="Social media"><a href="#contact" aria-label="Instagram placeholder"><Instagram size={18} /></a><a href="https://www.facebook.com/RCflores08" target="_blank" rel="noopener noreferrer" aria-label="Facebook (opens in a new tab)"><Facebook size={18} aria-hidden="true" /></a></div>
            </div>
            <div className="contact-form-wrap">
              <div className="contact-form-heading"><h3>Send a note.</h3><p>This demo form shows a local confirmation only. It does not send or save your message.</p></div>
              <form className="contact-form" onSubmit={handleContact}>
                <label>Your name<input name="name" required placeholder="Full name" /></label>
                <label>Email address<input name="email" type="email" required placeholder="you@example.com" /></label>
                <label className="full-field">Message<textarea name="message" required rows={4} placeholder="What’s on your mind?" /></label>
                <button className="button button-gold" type="submit">Show demo confirmation <ArrowRight size={17} /></button>
                {contactSent && <p className="contact-success" role="status"><Check size={18} /> Demo only. Your message has not been sent or saved.</p>}
              </form>
            </div>
          </div>
        </div>
      </section>
    </main>

    <footer className="site-footer">
      <div className="container footer-main">
        <div className="footer-brand"><BrandMark footer /><p>Thoughtful cuts and good company.</p></div>
        <nav className="footer-links" aria-label="Footer navigation">{navigation.map((item) => <a key={item.href} href={item.href}>{item.label}</a>)}</nav>
        <button className="footer-book" type="button" onClick={() => openBooking()}>Book a chair <ArrowUpRight size={17} /></button>
      </div>
      <div className="container footer-bottom"><span>© 2026 The South Barbers · Demo prototype</span><a href="#home">Back to top ↑</a></div>
    </footer>

    {selectedHaircut && <HaircutModal item={selectedHaircut} onClose={() => setSelectedHaircut(null)} onBook={() => openBooking()} />}
    {selectedProduct && <ProductModal item={selectedProduct} onClose={() => setSelectedProduct(null)} />}
    {selectedBarber && <BarberProfile barber={selectedBarber} onClose={() => setSelectedBarber(null)} onBook={(cut) => openBooking({ barber: selectedBarber.name, notes: cut ? `Preferred cut: ${cut.title}. ${cut.description}` : undefined })} />}
    {bookingRequest && <BookingDialog initialService={bookingRequest.service} initialBarber={bookingRequest.barber} initialNotes={bookingRequest.notes} onClose={closeBooking} onHome={goHome} />}
  </>
}
