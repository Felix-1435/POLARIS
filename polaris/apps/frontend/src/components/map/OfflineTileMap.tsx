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
  { id: 'camp-a', name: 'Field Camp A', lat: -70.55, lng: 11.9, radius: 1 },
  { id: 'camp-b', name: 'Field Camp B', lat: -70.82, lng: 11.45, radius: 1 },
  { id: 'overview', name: 'Polar overview', lat: -70.0, lng: 40.0, radius: 1, zooms: [3, 4, 5, 6] },
]

export default function OfflineTileMap({ emergencies = [], className, height = 420 }: Props) {
  const [online, setOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true)
  const [tileCount, setTileCount] = useState(0)
  const [progress, setProgress] = useState<PackProgress | null>(null)
  const [downloading, setDownloading] = useState(false)

  const refreshCount = async () => setTileCount(await countCachedTiles())

  useEffect(() => {
    const on = () => setOnline(true)
    const off = () => setOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    refreshCount()
    return () => {
      window.removeEventListener('online', on)
      window.removeEventListener('offline', off)
    }
  }, [])

  const markers: MapMarker[] = [
    ...STATIONS.map(s => ({
      id: s.id,
      lat: s.lat,
      lng: s.lng,
      label: s.name,
      kind: (s.type === 'station' ? 'station' : s.type === 'camp' ? 'camp' : 'vessel') as MapMarker['kind'],
      color: s.type === 'station' ? '#10b981' : s.type === 'camp' ? '#f59e0b' : '#38bdf8',
    })),
    ...emergencies
      .filter(e => e.lat != null && e.lng != null)
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
      await refreshCount()
      toast.success('Offline pack saved')
    } catch (e: any) {
      toast.error(e.message || 'Download failed')
    } finally {
      setDownloading(false)
    }
  }

  const handleClear = async () => {
    await clearTileCache()
    await refreshCount()
    setProgress(null)
    toast.message('Tile cache cleared')
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
          {tileCount.toLocaleString()} tiles cached
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
          onClick={handleClear}
          className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-ice-700 text-ice-400 hover:text-ice-200"
        >
          <Trash2 className="w-3.5 h-3.5" /> Clear
        </button>
      </div>

      {progress && progress.status === 'downloading' && (
        <div className="rounded-lg border border-cyan-500/30 bg-cyan-500/5 px-3 py-2">
          <div className="flex justify-between text-xs text-cyan-300 mb-1">
            <span>{progress.message}</span>
            <span>{progress.total ? Math.round((progress.done / progress.total) * 100) : 0}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-ice-800 overflow-hidden">
            <div
              className="h-full bg-cyan-500 transition-all"
              style={{ width: `${progress.total ? (progress.done / progress.total) * 100 : 0}%` }}
            />
          </div>
        </div>
      )}

      <div className="rounded-xl overflow-hidden border border-ice-800/50" style={{ height: h }}>
        <PolarisMap height={h} center={[-65, 40]} zoom={3} markers={markers} />
      </div>

      <p className="text-[11px] text-ice-500">
        Satellite map (Esri). Offline pack stores tiles in IndexedDB for use without internet.
      </p>
    </div>
  )
}
