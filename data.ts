import mcut1Image from './pics/mcut.jpg'
import mcut2Image from './pics/mcut2.jpg'
import mcut3Image from './pics/mcut3.jpg'
import mcut4Image from './pics/mcut4.jpg'
import rccut1Image from './pics/rccut.jpg'
import rccut2Image from './pics/rccut2.jpg'
import rccut3Image from './pics/rccut3.jpg'
import rccut4Image from './pics/rccut4.jpg'
import rcut1Image from './pics/rcut.jpg'
import rcut2Image from './pics/rcut2.jpg'
import rcut3Image from './pics/rcut3.jpg'
import rcut4Image from './pics/rcut4.jpg'
import barberMarkImage from './pics/barber_mark.JPG'
import barberRemImage from './pics/barber_rem.JPG'
import barberRcImage from './pics/barber_rc.JPG'
import curtainMulletImage from './pics/curtain_mullet.JPG'
import highFadeImage from './pics/highfade.JPG'
import logoImage from './pics/logo.JPG'
import lowTaperImage from './pics/low_taper.JPG'
import midFadeImage from './pics/midfade.JPG'
import midTaperImage from './pics/mid_taper.JPG'
import modernMulletImage from './pics/modern_mullet.JPG'
import mulletImage from './pics/mullet.JPG'
import upsideImage from './pics/upside.JPG'

export { logoImage }
export const heroImage = midFadeImage
export const heroImageSequences = {
  left: [highFadeImage, mulletImage],
  right: [modernMulletImage, midFadeImage],
}

export const haircuts = [
  { name: 'Low Fade', category: 'Fades', image: lowTaperImage, description: 'A clean, low taper that keeps the silhouette soft and refined.' },
  { name: 'Mid Fade', category: 'Fades', image: midFadeImage, description: 'A balanced fade with a little more contrast through the sides.' },
  { name: 'High Fade', category: 'Fades', image: highFadeImage, description: 'A bold, high-contrast profile with a crisp finish.' },
  { name: 'Taper Fade', category: 'Fades', image: midTaperImage, description: 'A classic taper at the neckline and temples, kept versatile.' },
  { name: 'Textured Crop', category: 'Texture', image: upsideImage, description: 'Short, layered texture with a natural and easy finish.' },
  { name: 'Curtain Mullet', category: 'Texture', image: curtainMulletImage, description: 'A relaxed shape with parted movement and a clean finish.' },
  { name: 'Modern Mullet', category: 'Texture', image: modernMulletImage, description: 'A contemporary shape with movement, texture, and character.' },
  { name: 'Mullet', category: 'Texture', image: mulletImage, description: 'A distinctive shape with length, movement, and personality.' },
]

type Service = {
  name: string
  description: string
  price: number
  startingAt?: boolean
  category: 'Haircuts' | 'Grooming' | 'Combinations' | 'Color'
}

export const services: Service[] = [
  { name: 'Haircut Only', description: 'A haircut shaped to your preferred style.', price: 250, category: 'Haircuts' },
  { name: 'Toddlers / Kids Haircut', description: 'A patient, comfortable haircut for little ones.', price: 300, category: 'Haircuts' },
  { name: 'Scalp Treatment & Haircut', description: 'Scalp care paired with your haircut.', price: 800, category: 'Combinations' },
  { name: 'Perm & Haircut', description: 'A perm paired with a haircut to shape your look.', price: 1500, category: 'Combinations' },
  { name: 'Haircut & Shampoo', description: 'A haircut paired with a refreshing shampoo.', price: 350, category: 'Combinations' },
  { name: 'High Fashion Color', description: 'Discuss your preferred color with the team.', price: 2000, startingAt: true, category: 'Color' },
  { name: 'Haircut and Beard Works', description: 'A haircut paired with beard grooming.', price: 350, category: 'Combinations' },
  { name: 'Haircut & Hair Tattoo', description: 'A haircut paired with a hair tattoo design.', price: 380, category: 'Combinations' },
  { name: 'Beard Works Only', description: 'Dedicated grooming for your beard.', price: 250, category: 'Grooming' },
  { name: 'Facial Shave', description: 'A clean shave for your face.', price: 200, category: 'Grooming' },
  { name: 'VIP Haircut Package', description: 'Ask the team about the VIP haircut package.', price: 600, category: 'Combinations' },
]

export const formatServicePrice = (service: Pick<Service, 'price' | 'startingAt'>) =>
  `${service.startingAt ? 'Starts at ' : ''}₱${service.price.toLocaleString('en-PH')}`

export const formatServiceTotal = (selected: Service[]) => formatServicePrice({
  price: selected.reduce((total, service) => total + service.price, 0),
  startingAt: selected.some((service) => service.startingAt),
})

export type BarberCut = {
  id: string
  title: string
  category: string
  image: string
  description: string
}
export type Barber = {
  name: string
  image: string
  portfolio: BarberCut[]
}

// Add only work confirmed to belong to this barber. See pics/barbers/README.md.
export const barbers: Barber[] = [
  { name: 'RC Flores', image: barberRcImage, portfolio: [
    { id: 'rccut-1', title: 'RC’s cut 1', category: 'Haircuts', image: rccut1Image, description: 'A haircut by RC Flores. Bring this photo as a reference and discuss the finish you prefer.' },
    { id: 'rccut-2', title: 'RC’s cut 2', category: 'Haircuts', image: rccut2Image, description: 'A haircut by RC Flores. Bring this photo as a reference and discuss the finish you prefer.' },
    { id: 'rccut-3', title: 'RC’s cut 3', category: 'Haircuts', image: rccut3Image, description: 'A haircut by RC Flores. Bring this photo as a reference and discuss the finish you prefer.' },
    { id: 'rccut-4', title: 'RC’s cut 4', category: 'Haircuts', image: rccut4Image, description: 'A haircut by RC Flores. Bring this photo as a reference and discuss the finish you prefer.' }
  ] },
  { name: 'Mark Adobas', image: barberMarkImage, portfolio: [
    { id: 'mcut-1', title: 'Mark’s cut 1', category: 'Haircuts', image: mcut1Image, description: 'A haircut by Mark Adobas. Bring this photo as a reference and discuss the finish you prefer.' },
    { id: 'mcut-2', title: 'Mark’s cut 2', category: 'Haircuts', image: mcut2Image, description: 'A haircut by Mark Adobas. Bring this photo as a reference and discuss the finish you prefer.' },
    { id: 'mcut-3', title: 'Mark’s cut 3', category: 'Haircuts', image: mcut3Image, description: 'A haircut by Mark Adobas. Bring this photo as a reference and discuss the finish you prefer.' },
    { id: 'mcut-4', title: 'Mark’s cut 4', category: 'Haircuts', image: mcut4Image, description: 'A haircut by Mark Adobas. Bring this photo as a reference and discuss the finish you prefer.' }
  ] },
  { name: 'Rem Bacos', image: barberRemImage, portfolio: [
    { id: 'rcut-1', title: 'Rem’s cut 1', category: 'Haircuts', image: rcut1Image, description: 'A haircut by Rem Bacos. Bring this photo as a reference and discuss the finish you prefer.' },
    { id: 'rcut-2', title: 'Rem’s cut 2', category: 'Haircuts', image: rcut2Image, description: 'A haircut by Rem Bacos. Bring this photo as a reference and discuss the finish you prefer.' },
    { id: 'rcut-3', title: 'Rem’s cut 3', category: 'Haircuts', image: rcut3Image, description: 'A haircut by Rem Bacos. Bring this photo as a reference and discuss the finish you prefer.' },
    { id: 'rcut-4', title: 'Rem’s cut 4', category: 'Haircuts', image: rcut4Image, description: 'A haircut by Rem Bacos. Bring this photo as a reference and discuss the finish you prefer.' }
  ] },
]

export const products = [
  { name: 'Hair Wax', mockup: 0, type: 'Flexible hold', price: 390, availability: 'Sample · In shop', description: 'A pliable, natural-looking finish that stays easy to reshape through the day.' },
  { name: 'Matte Clay', mockup: 1, type: 'Strong hold · Matte', price: 450, availability: 'Sample · In shop', description: 'Adds texture and definition with a dry, low-shine finish.' },
  { name: 'Classic Pomade', mockup: 2, type: 'Medium hold · Shine', price: 420, availability: 'Sample · In shop', description: 'A smooth, combable finish for polished shapes and classic side parts.' },
  { name: 'Hair Gel', mockup: 3, type: 'Firm hold', price: 320, availability: 'Sample · Limited', description: 'A dependable set for defined looks and lasting control.' },
  { name: 'Styling Powder', mockup: 4, type: 'Lightweight volume', price: 480, availability: 'Sample · In shop', description: 'Instant lift and airy texture without adding weight.' },
  { name: 'Daily Shampoo', mockup: 5, type: 'Gentle cleanse', price: 520, availability: 'Sample · In shop', description: 'A gentle everyday wash that leaves hair feeling fresh and balanced.' },
  { name: 'Beard Oil', mockup: 6, type: 'Softening care', price: 390, availability: 'Sample · Limited', description: 'A lightweight finishing oil to soften facial hair and add a subtle sheen.' },
]

export const sampleDateOffsets = [0, 1, 2, 3, 4, 5, 6]
export const timeSlots = ['9:00 AM', '10:00 AM', '11:00 AM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM']
