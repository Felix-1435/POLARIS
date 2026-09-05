import PolarisMap from './PolarisMap'

/** Command Center operational theatre — realistic satellite map */
export default function OperationalMap() {
  return (
    <PolarisMap
      height={400}
      center={[-55, 35]}
      zoom={3}
      className="min-h-[360px] md:min-h-[400px]"
    />
  )
}
