import PolarisMap from './PolarisMap'

export default function OperationalMap() {
  return (
    <div style={{ width: '100%', height: 400, minHeight: 400 }}>
      <PolarisMap height={400} center={[-40, 40]} zoom={3} />
    </div>
  )
}
