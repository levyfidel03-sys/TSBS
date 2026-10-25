import { useEffect, useRef, useState } from 'react'
import { ArrowUpRight, RotateCw, Scissors } from 'lucide-react'
import { barbers, type Barber } from './data'

type Props = { onView: (barber: Barber) => void }
const center = 110
const radius = 102
const point = (angle: number, distance: number) => ({ x: center + Math.cos(angle * Math.PI / 180) * distance, y: center + Math.sin(angle * Math.PI / 180) * distance })
const colors = ['#c4a56d', '#ded5c3', '#8c7957']

export default function BarberRoulette({ onView }: Props) {
  const [rotation, setRotation] = useState(0)
  const [spinning, setSpinning] = useState(false)
  const [winner, setWinner] = useState<Barber | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const busyRef = useRef(false)
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReducedMotion(media.matches)
    media.addEventListener('change', update)
    return () => { media.removeEventListener('change', update); if (timerRef.current) clearTimeout(timerRef.current) }
  }, [])

  const spin = () => {
    if (busyRef.current) return
    busyRef.current = true
    setSpinning(true)
    setWinner(null)
    const index = Math.floor(Math.random() * barbers.length)
    const slice = 360 / barbers.length
    // The pointer is at -90 degrees; align the chosen segment's center with it.
    const target = (360 - (index + 0.5) * slice) % 360
    setRotation((current) => current + 360 * 5 + (target - current % 360 + 360) % 360)
    timerRef.current = setTimeout(() => {
      setWinner(barbers[index])
      setSpinning(false)
      busyRef.current = false
    }, reducedMotion ? 80 : 3700)
  }

  return <article className="barber-roulette" aria-label="Barber roulette">
    <h3>Not sure who to pick?</h3>
    <p>Let the wheel introduce you.</p>
    <div className="roulette-stage" aria-hidden="true">
      <span className="roulette-pointer" />
      <svg className="roulette-wheel" viewBox="0 0 220 220" style={{ transform: `rotate(${rotation}deg)`, transition: reducedMotion ? 'none' : 'transform 3.6s cubic-bezier(.12,.72,.12,1)' }}>
        {barbers.map((barber, index) => {
          const slice = 360 / barbers.length
          const start = point(-90 + index * slice, radius)
          const end = point(-90 + (index + 1) * slice, radius)
          const angle = -90 + (index + 0.5) * slice
          const label = point(angle, 64)
          return <g key={barber.name}><path d={`M ${center} ${center} L ${start.x} ${start.y} A ${radius} ${radius} 0 ${slice > 180 ? 1 : 0} 1 ${end.x} ${end.y} Z`} fill={colors[index % colors.length]} /><text x={label.x} y={label.y} textAnchor="middle" dominantBaseline="middle" transform={`rotate(${angle + 90}, ${label.x}, ${label.y})`}>{barber.name.split(' ')[0]}</text></g>
        })}
        <circle cx="110" cy="110" r="24" fill="#211f1b" />
      </svg>
      <Scissors className="roulette-center" size={22} strokeWidth={1.5} />
    </div>
    <div className="roulette-result" role="status" aria-live="polite" aria-atomic="true">
      {spinning ? <p>Finding your barber…</p> : winner ? <><img src={winner.image} alt="" /><p>Your pick<strong>{winner.name}</strong></p></> : <p>RC, Mark, or Rem?<br />Give it a spin.</p>}
    </div>
    <div className="roulette-actions">
      <button className="roulette-spin" type="button" onClick={spin} disabled={spinning}><RotateCw size={17} aria-hidden="true" />{spinning ? 'Spinning…' : winner ? 'Spin again' : 'Spin the wheel'}</button>
      {winner && <button className="roulette-portfolio" type="button" onClick={() => onView(winner)}>View {winner.name.split(' ')[0]}’s portfolio <ArrowUpRight size={16} aria-hidden="true" /></button>}
    </div>
    <small>A fun, random pick. Availability isn’t checked.</small>
  </article>
}
