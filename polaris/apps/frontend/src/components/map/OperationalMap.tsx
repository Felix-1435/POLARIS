import PolarisMap from './PolarisMap'
import MapErrorBoundary from './MapErrorBoundary'

export default function OperationalMap() {
  return (
    <MapErrorBoundary height={400}>
      <div style={{ width: '100%', height: 400, minHeight: 400 }}>
        <PolarisMap height={400} center={[-40, 40]} zoom={3} />
      </div>
    </MapErrorBoundary>
  )
}
