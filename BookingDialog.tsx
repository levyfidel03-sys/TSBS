import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, CalendarDays, Check, CheckCircle2, ChevronLeft, ChevronRight, Clock3, UserRound } from 'lucide-react'
import { barbers, services, timeSlots } from './data'
import Modal from './Modal'

type BookingDialogProps = {
  initialService?: string
  initialBarber?: string
  initialNotes?: string
  onClose: () => void
  onHome: () => void
}

type Customer = { name: string; phone: string; email: string; notes: string }

const steps = ['Service', 'Barber', 'Date', 'Time', 'Your details', 'Review', 'Done']
const unavailableTimes = ['11:00 AM', '4:00 PM']
const weekdays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
const money = (value: number) => `₱${value.toLocaleString('en-PH')}`
const monthLabel = (date: Date) => date.toLocaleDateString('en-PH', { month: 'long', year: 'numeric' })

export default function BookingDialog({ initialService = '', initialBarber = '', initialNotes = '', onClose, onHome }: BookingDialogProps) {
  const today = useMemo(() => {
    const date = new Date()
    date.setHours(0, 0, 0, 0)
    return date
  }, [])
  const [step, setStep] = useState(1)
  const bodyRef = useRef<HTMLDivElement>(null)
  const errorRef = useRef<HTMLParagraphElement>(null)
  useEffect(() => {
    bodyRef.current?.scrollTo(0, 0)
    bodyRef.current?.querySelector<HTMLElement>('h3')?.focus()
  }, [step])
  const [serviceName, setServiceName] = useState(initialService)
  const [barberName, setBarberName] = useState(initialBarber || 'Any Available Barber')
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState('')
  const [customer, setCustomer] = useState<Customer>({ name: '', phone: '', email: '', notes: initialNotes })
  const [error, setError] = useState('')
  useEffect(() => { if (error) errorRef.current?.focus() }, [error])
  const [reference, setReference] = useState('')
  const [visibleMonth, setVisibleMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1))
  const service = services.find((item) => item.name === serviceName)
  const formattedDate = selectedDate?.toLocaleDateString('en-PH', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) ?? ''
  const firstWeekday = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1).getDay()
  const daysInMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 0).getDate()
  const calendarCells = [...Array(firstWeekday).fill(null), ...Array.from({ length: daysInMonth }, (_, index) => index + 1)]
  const barberOptions = ['Any Available Barber', ...barbers.map((item) => item.name)]

  const isDateDisabled = (day: number) => {
    const date = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), day)
    date.setHours(0, 0, 0, 0)
    return date < today || date.getDay() === 0
  }
  const isSelectedDate = (day: number) => selectedDate?.getFullYear() === visibleMonth.getFullYear()
    && selectedDate.getMonth() === visibleMonth.getMonth() && selectedDate.getDate() === day
  const chooseDate = (day: number) => {
    setSelectedDate(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), day))
    setError('')
  }
  const updateCustomer = (key: keyof Customer, value: string) => setCustomer((current) => ({ ...current, [key]: value }))

  const goForward = () => {
    setError('')
    if (step === 1 && !serviceName) return setError('Choose a service to continue.')
    if (step === 2 && !barberName) return setError('Choose a barber or select Any Available Barber.')
    if (step === 3 && !selectedDate) return setError('Choose a date for your appointment.')
    if (step === 4 && !selectedTime) return setError('Choose one of the available time slots.')
    if (step === 5) {
      if (!customer.name.trim()) return setError('Enter your full name to continue.')
      if (!customer.phone.trim()) return setError('Enter a contact number to continue.')
    }
    setStep((current) => Math.min(6, current + 1))
  }
  const goBack = () => {
    setError('')
    setStep((current) => Math.max(1, current - 1))
  }
  const confirmDemo = () => {
    const suffix = Math.random().toString(36).slice(2, 7).toUpperCase()
    setReference(`TSB-${new Date().getFullYear()}-${suffix}`)
    setError('')
    setStep(7)
  }
  const reset = () => {
    setStep(1)
    setServiceName('')
    setBarberName('Any Available Barber')
    setSelectedDate(null)
    setSelectedTime('')
    setCustomer({ name: '', phone: '', email: '', notes: '' })
    setReference('')
    setError('')
  }

  return (
    <Modal title={step === 7 ? 'Your demo is complete' : 'Book your chair'} onClose={onClose} size="wide">
      {step < 7 ? (
        <>
          <div className="booking-progress" aria-label="Booking progress">
            <div className="booking-progress-top"><span>Stage {step} of 7</span><span>{steps[step - 1]}</span></div>
            <div className="progress-track" role="progressbar" aria-label="Booking stage" aria-valuemin={1} aria-valuemax={7} aria-valuenow={step} aria-valuetext={`${steps[step - 1]}, stage ${step} of 7`}><span style={{ width: `${(step / 7) * 100}%` }} /></div>
            <div className="step-labels">{steps.slice(0, 6).map((label, index) => <span key={label} className={index + 1 === step ? 'current' : index + 1 < step ? 'complete' : ''}>{label}</span>)}</div>
          </div>
          <div className="booking-body" ref={bodyRef}>
            {service && step > 1 && <div className="booking-selection-summary"><span>{service.name} · {service.duration}</span><strong>{money(service.price)} <small>sample price</small></strong></div>}
            {step === 1 && <>
              <div className="wizard-intro"><h3 tabIndex={-1}>What are we doing today?</h3><p>Choose the service that suits you. Sample prices are shown in Philippine pesos.</p></div>
              <div className="choice-list service-choice-list">{services.map((item) => <button type="button" key={item.name} aria-pressed={serviceName === item.name} className={`choice-card service-choice ${serviceName === item.name ? 'selected' : ''}`} onClick={() => { setServiceName(item.name); setError('') }}>
                <span className="choice-check">{serviceName === item.name && <Check size={14} />}</span><span className="choice-main"><strong>{item.name}</strong><small>{item.description}</small><em>{item.duration} · {item.tag}</em></span><b>{money(item.price)}</b>
              </button>)}</div>
            </>}
            {step === 2 && <>
              <div className="wizard-intro"><h3 tabIndex={-1}>Who would you like in your corner?</h3><p>Choose from {barberOptions.length} sample options, or leave it to the team.</p></div>
              <div className="barber-choice-grid"><button type="button" aria-pressed={barberName === 'Any Available Barber'} className={`barber-choice any-barber ${barberName === 'Any Available Barber' ? 'selected' : ''}`} onClick={() => { setBarberName('Any Available Barber'); setError('') }}><span className="any-icon"><UserRound size={22} /></span><span><strong>Any Available Barber</strong><small>Find the next available chair</small></span>{barberName === 'Any Available Barber' && <Check size={16} />}</button>
                {barbers.map((item) => <button type="button" key={item.name} aria-pressed={barberName === item.name} className={`barber-choice ${barberName === item.name ? 'selected' : ''}`} onClick={() => { setBarberName(item.name); setError('') }}><img className="barber-mini-image" src={item.image} alt="" loading="lazy" /><span><strong>{item.name}</strong><small>Barber</small></span>{barberName === item.name && <Check size={16} />}</button>)}
              </div>
            </>}
            {step === 3 && <>
              <div className="wizard-intro"><h3 tabIndex={-1}>Pick a day that works.</h3><p>Sample availability is shown for demonstration. Sundays are unavailable.</p></div>
              <div className="calendar-card"><div className="calendar-head"><button type="button" className="icon-button" aria-label="Previous month" onClick={() => setVisibleMonth(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1))} disabled={visibleMonth.getFullYear() === today.getFullYear() && visibleMonth.getMonth() <= today.getMonth()}><ChevronLeft size={18} /></button><strong>{monthLabel(visibleMonth)}</strong><button type="button" className="icon-button" aria-label="Next month" onClick={() => setVisibleMonth(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1))}><ChevronRight size={18} /></button></div>
                <div className="calendar-grid">{weekdays.map((day) => <span key={day} className="calendar-weekday">{day}</span>)}{calendarCells.map((day, index) => day === null ? <span key={`blank-${index}`} /> : <button type="button" key={day} aria-pressed={isSelectedDate(day)} aria-label={new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), day).toLocaleDateString('en-PH', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })} className={`calendar-day ${isSelectedDate(day) ? 'selected' : ''} ${isDateDisabled(day) ? 'disabled' : ''}`} disabled={isDateDisabled(day)} onClick={() => chooseDate(day)}>{day}</button>)}</div>
                <p className="calendar-note"><CalendarDays size={15} /> Choose a date from today onward; sample dates do not reserve a real appointment.</p>
              </div>
            </>}
            {step === 4 && <>
              <div className="wizard-intro"><h3 tabIndex={-1}>What time should we save for you?</h3><p>{formattedDate || 'Select a date'} · Sample time slots</p></div>
              <div className="time-grid">{timeSlots.map((time) => { const unavailable = unavailableTimes.includes(time); return <button key={time} type="button" disabled={unavailable} aria-pressed={selectedTime === time} className={`time-choice ${selectedTime === time ? 'selected' : ''} ${unavailable ? 'unavailable' : ''}`} onClick={() => { setSelectedTime(time); setError('') }}><Clock3 size={16} />{time}<small>{unavailable ? 'Unavailable' : 'Available'}</small></button> })}</div>
              <p className="slot-legend"><span><i /> Available</span><span><i className="legend-unavailable" /> Unavailable</span><span><i className="legend-selected" /> Selected</span></p>
            </>}
            {step === 5 && <>
              <div className="wizard-intro"><h3 tabIndex={-1}>Who are we welcoming?</h3><p>We need a name and contact number for this demonstration request.</p></div>
              <div className="form-grid booking-form-grid"><label><span className="field-label">Full Name <span className="required-mark">*</span></span><input value={customer.name} onChange={(event) => updateCustomer('name', event.target.value)} required aria-invalid={error.includes('full name') || undefined} aria-describedby={error.includes('full name') ? 'booking-error' : undefined} autoComplete="name" placeholder="e.g. Alex Santos" /></label><label><span className="field-label">Contact Number <span className="required-mark">*</span></span><input value={customer.phone} onChange={(event) => updateCustomer('phone', event.target.value)} required type="tel" aria-invalid={error.includes('contact number') || undefined} aria-describedby={error.includes('contact number') ? 'booking-error' : undefined} autoComplete="tel" inputMode="tel" placeholder="e.g. 0917 123 4567" /></label><label className="full-field">Email Address <em>Optional</em><input type="email" value={customer.email} onChange={(event) => updateCustomer('email', event.target.value)} autoComplete="email" placeholder="you@example.com" /></label><label className="full-field">Additional Notes <em>Optional</em><textarea value={customer.notes} onChange={(event) => updateCustomer('notes', event.target.value)} rows={3} placeholder="Anything you'd like us to know?" /></label></div>
              <p className="privacy-note">Demo only. Your details stay in this page's temporary state and are not transmitted or saved.</p>
            </>}
            {step === 6 && <>
              <div className="wizard-intro"><h3 tabIndex={-1}>One last look.</h3><p>Go back to change anything. Confirming creates a demo reference only.</p></div>
              <div className="review-card"><div className="review-row"><span>Service</span><strong>{service?.name || 'Choose a service'}</strong></div><div className="review-row"><span>Barber</span><strong>{barberName}</strong></div><div className="review-row"><span>Date</span><strong>{formattedDate || 'Choose a date'}</strong></div><div className="review-row"><span>Time</span><strong>{selectedTime || 'Choose a time'}</strong></div><div className="review-row"><span>Name</span><strong>{customer.name || 'Your name'}</strong></div><div className="review-row review-total"><span>Estimated sample price</span><strong>{service ? money(service.price) : '—'}</strong></div></div>
              {customer.notes && <p className="review-notes"><span>Note</span>{customer.notes}</p>}
              <div className="demo-disclosure"><CheckCircle2 size={18} /><p><strong>Demo request only.</strong> This confirmation is not sent to The South Barbers and is not stored.</p></div>
            </>}
            {error && <p id="booking-error" className="form-error" ref={errorRef} tabIndex={-1} role="alert">{error}</p>}
          </div>
          <div className="booking-footer"><button type="button" className="button button-quiet" onClick={step === 1 ? onClose : goBack}>{step === 1 ? <><ArrowLeft size={16} /> Cancel</> : <><ArrowLeft size={16} /> Back</>}</button>
            {step < 6 ? <button type="button" className="button button-gold" onClick={goForward}>Continue <ArrowRight size={16} /></button> : <button type="button" className="button button-gold" onClick={confirmDemo}>Confirm demo request <ArrowRight size={16} /></button>}
          </div>
          <p className="booking-fineprint">Demo only · No appointment is reserved. Use sample details.</p>
        </>
      ) : (
        <div className="confirmation-screen" ref={bodyRef}><div className="success-mark"><CheckCircle2 size={42} strokeWidth={1.4} /></div><p className="confirmation-demo-note">Demo confirmation</p><h3 tabIndex={-1}>Your sample appointment</h3><p className="confirmation-copy">Thanks, {customer.name.split(' ')[0] || 'there'}. Here’s the request you would see in the finished booking experience.</p><div className="booking-reference"><span>Demo reference</span><strong>{reference}</strong></div><div className="confirmation-summary"><div><span>Service</span><strong>{service?.name}</strong></div><div><span>Barber</span><strong>{barberName}</strong></div><div><span>Date & time</span><strong>{formattedDate} · {selectedTime}</strong></div><div><span>Estimated sample price</span><strong>{service ? money(service.price) : '—'}</strong></div></div><div className="demo-disclosure confirmation-disclosure"><CheckCircle2 size={18} /><p>This is a demo only. Your request has <strong>not</strong> been sent to the actual shop or saved.</p></div><div className="confirmation-actions"><button className="button button-quiet" type="button" onClick={onHome}>Back to Home</button><button className="button button-gold" type="button" onClick={reset}>Start a new appointment</button></div></div>
      )}
    </Modal>
  )
}
