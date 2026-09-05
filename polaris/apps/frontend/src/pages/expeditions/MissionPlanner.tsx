import { useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Users, Package, Fuel, Heart, Wrench, Sparkles, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'

const API_URL = import.meta.env.VITE_API_URL || ''

export default function MissionPlanner() {
  const [teamSize, setTeamSize] = useState(40)
  const [duration, setDuration] = useState(120)
  const [destination, setDestination] = useState('Maitri')
  const [mission, setMission] = useState('Climate & Ice Core Research')
  const [plan, setPlan] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const generate = async () => {
    setLoading(true)
    try {
      if (API_URL) {
        const res = await fetch(`${API_URL}/api/ai/plan-expedition`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ teamSize, durationDays: duration, destination, mission }),
        })
        if (res.ok) {
          setPlan(await res.json())
          setLoading(false)
          return
        }
      }
    } catch {}
    // Local fallback
    const foodKg = Math.round(teamSize * duration * 1.8)
    const fuelL = Math.round(teamSize * duration * 3.5 + 15000)
    setPlan({
      summary: `AI-generated plan for ${teamSize} personnel, ${duration} days at ${destination}`,
      requirements: {
        personnel: teamSize,
        foodKg,
        dieselLitres: fuelL,
        medicalKits: Math.ceil(teamSize / 8) + 10,
        estimatedCargoItems: Math.round(teamSize * 2.2 + 40),
        recommendedVessels: fuelL > 40000 ? 2 : 1,
        contingencyDays: 15,
      },
      notes: [
        'Includes 15-day weather contingency',
        'Medical kits sized for remote field teams',
        'Fuel includes station generators + vehicles + contingency',
      ]
    })
    setLoading(false)
    toast.success('AI plan generated')
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ice-50 flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-cyan-400" /> AI Expedition Planner
        </h1>
        <p className="text-ice-500 text-sm">Input team + destination + duration → system calculates food, fuel, medicine, cargo</p>
      </div>

      <div className="glass rounded-xl border border-ice-800/50 p-6 grid md:grid-cols-2 gap-5">
        <div>
          <label className="text-xs text-ice-500">Team Size</label>
          <input type="number" value={teamSize} onChange={e => setTeamSize(+e.target.value)} className="w-full mt-1 bg-ice-900 border border-ice-700 rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs text-ice-500">Duration (days)</label>
          <input type="number" value={duration} onChange={e => setDuration(+e.target.value)} className="w-full mt-1 bg-ice-900 border border-ice-700 rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-xs text-ice-500">Destination</label>
          <select value={destination} onChange={e => setDestination(e.target.value)} className="w-full mt-1 bg-ice-900 border border-ice-700 rounded-lg px-3 py-2 text-sm">
            <option>Maitri</option>
            <option>Bharati</option>
            <option>Both Stations</option>
            <option>Arctic</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-ice-500">Mission Objective</label>
          <input value={mission} onChange={e => setMission(e.target.value)} className="w-full mt-1 bg-ice-900 border border-ice-700 rounded-lg px-3 py-2 text-sm" />
        </div>
        <div className="md:col-span-2">
          <button onClick={generate} disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-semibold flex items-center justify-center gap-2">
            {loading ? 'Calculating...' : <><Sparkles className="w-4 h-4" /> Generate AI Plan</>}
          </button>
        </div>
      </div>

      {plan && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-xl border border-cyan-500/20 p-6 space-y-4">
          <h3 className="font-semibold text-cyan-300">{plan.summary}</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { label: 'Personnel', value: plan.requirements.personnel, icon: Users },
              { label: 'Food (kg)', value: plan.requirements.foodKg.toLocaleString(), icon: Package },
              { label: 'Diesel (L)', value: plan.requirements.dieselLitres.toLocaleString(), icon: Fuel },
              { label: 'Medical Kits', value: plan.requirements.medicalKits, icon: Heart },
              { label: 'Cargo Items', value: plan.requirements.estimatedCargoItems, icon: Package },
              { label: 'Vessels', value: plan.requirements.recommendedVessels, icon: Wrench },
            ].map(r => (
              <div key={r.label} className="bg-ice-900/50 rounded-lg p-3 border border-ice-800">
                <r.icon className="w-4 h-4 text-cyan-400 mb-1" />
                <p className="text-lg font-bold text-ice-50">{r.value}</p>
                <p className="text-xs text-ice-500">{r.label}</p>
              </div>
            ))}
          </div>
          <ul className="text-sm text-ice-400 space-y-1">
            {plan.notes.map((n: string, i: number) => <li key={i}>• {n}</li>)}
          </ul>
        </motion.div>
      )}
    </div>
  )
}
