import productSheet from './products-grid.webp'

export default function ProductMockup({ name, index, className = '' }: { name: string; index: number; className?: string }) {
  const column = index % 3
  const row = Math.floor(index / 3)
  return <svg className={`product-mockup ${className}`} viewBox={`${18 + column * 636} ${18 + row * 636} 604 604`} preserveAspectRatio="xMidYMid slice" role="img" aria-label={`${name} mockup`}>
    <image href={productSheet} width="1920" height="1920" />
  </svg>
}
