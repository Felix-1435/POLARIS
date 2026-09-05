import { useEffect, useState } from 'react'
import { Download, Trash2, Wifi, WifiOff, Map as MapIcon, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import {
  downloadOfflinePack,
  countCachedTiles,
  clearTileCache,
  type PackProgress,
  type StationPack,
} from '@/lib/offlineMapTiles'
import PolarisMap, { type MapMarker } from './PolarisMap'
import MapErrorBoundary from './MapErrorBoundary'
import { STATIONS } from '@/lib/offlineEmergencies'

type EmergencyPin = {
  id: string
  lat: number
  lng: number
  label: string
  type?: string
}

type Props = {
  emergencies?: EmergencyPin[]
  className?: string
  height?: number
}

const PACK_STATIONS: StationPack[] = [
  { id: 'maitri', name: 'Maitri', lat: -70.767, lng: 11.733, radius: 2 },
  { id: 'bharati', name: 'Bharati', lat: -69.407, lng: 76.187, radius: 2 },
  { id: 'overview', name: 'Overview', lat: -70, lng: 40, radius: 1, zooms: [3, 4, 5, 6] },
]

export default function OfflineTileMap({ emergencies = [], className, height = 420 }: Props) {
  const [online, setOnline] = useState(true)
  const [tileCount, setTileCount] = useState(0)
  const [progress, setProgress] = useState<PackProgress | null>(null)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    setOnline(typeof navigator !== 'undefined' ? navigator.onLine : true)
    const on = () => setOnline(true)
    const off = () => setOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    countCachedTiles().then(setTileCount).catch(() => {})
    return () => {
      window.removeEventListener('online', on)
      window.removeEventListener('offline', off)
    }
  }, [])

  const markers: MapMarker[] = [
    ...(STATIONS || []).map(s => ({
      id: s.id,
      lat: s.lat,
      lng: s.lng,
      label: s.name,
      kind: (s.type === 'station'
        ? 'station'
        : s.type === 'camp'
          ? 'camp'
          : 'vessel') as MapMarker['kind'],
      color: s.type === 'station' ? '#10b981' : s.type === 'camp' ? '#f59e0b' : '#38bdf8',
    })),
    ...(emergencies || [])
      .filter(e => e && e.lat != null && e.lng != null)
      .map(e => ({
        id: e.id,
        lat: e.lat,
        lng: e.lng,
        label: e.label || e.id,
        kind: 'emergency' as const,
        color: '#ef4444',
      })),
  ]

  const handleDownload = async () => {
    if (!navigator.onLine) {
      toast.error('Need internet once to download the offline pack')
      return
    }
    setDownloading(true)
    try {
      await downloadOfflinePack(PACK_STATIONS, p => setProgress(p))
      setTileCount(await countCachedTiles())
      toast.success('Offline pack saved')
    } catch (e: any) {
      toast.error(e?.message || 'Download failed')
    } finally {
      setDownloading(false)
    }
  }

  const h = Math.max(height || 420, 320)

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={cn(
            'inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-full border font-medium',
            online
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
          )}
        >
          {online ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
          {online ? 'Online' : 'Offline'}
        </span>
        <span className="text-xs text-ice-500 flex items-center gap-1">
          <MapIcon className="w-3.5 h-3.5" />
          {tileCount} tiles cached
        </span>
        <div className="flex-1" />
        <button
          type="button"
          onClick={handleDownload}
          disabled={downloading}
          className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium disabled:opacity-50"
        >
          {downloading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
          {downloading ? 'Downloading…' : 'Download offline pack'}
        </button>
        <button
          type="button"
          onClick={async () => {
            await clearTileCache()
            setTileCount(0)
            setProgress(null)
            toast.message('Cache cleared')
          }}
          className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-ice-700 text-ice-400"
        >
          <Trash2 className="w-3.5 h-3.5" /> Clear
        </button>
      </div>

      {progress?.status === 'downloading' && (
        <div className="text-xs text-cyan-300">{progress.message}</div>
      )}

      <div className="rounded-xl overflow-hidden border border-ice-800/50" style={{ height: h }}>
        <MapErrorBoundary height={h}>
          <PolarisMap height={h} center={[-65, 40]} zoom={3} markers={markers} />
        </MapErrorBoundary>
      </div>
    </div>
  )
}
