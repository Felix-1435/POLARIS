import PolarisMap from './PolarisMap'

/** Command Center operational theatre — realistic satellite map */
export default function OperationalMap() {
  return (
    <div className="w-full h-[360px] md:h-[400px]">
      <PolarisMap height={400} center={[-55, 35]} zoom={3} className="w-full h-full rounded-b-2xl overflow-hidden" />
    </div>
  )
}
