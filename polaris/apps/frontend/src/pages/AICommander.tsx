import { useState } from 'react'
import { motion } from 'framer-motion'
import { Bot, Send, Sparkles, TrendingUp, AlertTriangle, Package } from 'lucide-react'
import { cn } from '@/lib/utils'

const suggestions = [
  "Which critical cargo is currently delayed?",
  "Which supplies will run out first?",
  "Are all field teams accounted for?",
  "What should we prioritise for the next shipment?",
  "Summarise current operational risks",
]

const responses: Record<string, string> = {
  "Which critical cargo is currently delayed?": "3 critical shipments are delayed. ANT-015 contains fuel and ANT-007 contains medical supplies. ANT-007 should be prioritised due to medical dependency at Field Camp B. ANT-045 (generator parts) is delayed 14 hours due to Southern Ocean weather.",
  "Which supplies will run out first?": "Diesel at Maitri is projected to fall below the minimum threshold in approximately 18 days (current 8,500 L, daily burn ~420 L). Batteries at Field Camp are next (~12 days). Recommend prioritising fuel shipment and reducing non-critical generator use.",
  "Are all field teams accounted for?": "31 field personnel are deployed. 30 have completed scheduled check-in. P-034 (S. Reddy) at Field Camp B has missed the check-in window by 42 minutes. This anomaly has been escalated to the Emergency module — Incident INC-0042 is now active.",
  "What should we prioritise for the next shipment?": "Priority ranking based on current risk: 1) Medical supplies (active incident), 2) Diesel fuel (18-day horizon), 3) Communication equipment spares, 4) Research instruments. AI recommends consolidating medical + fuel on the next available vessel slot.",
  "Summarise current operational risks": "Overall risk level: ELEVATED. Primary concerns: (1) Active medical emergency at Field Camp B, (2) Fuel depletion timeline at Maitri, (3) Weather-induced cargo delay on MV Sagar Kanya. No personnel safety issues beyond the active incident. Expedition ANT-47 remains within acceptable operational parameters.",
}

export default function AICommander() {
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([
    { role: 'ai', text: 'POLARIS AI Commander online. I have full situational awareness across Expeditions, Cargo, Inventory, Personnel and Emergency modules. How can I assist the command team?' }
  ])
  const [input, setInput] = useState('')

  const ask = (q: string) => {
    setMessages(m => [...m, { role: 'user', text: q }])
    setTimeout(() => {
      const answer = responses[q] || "I've analysed the latest data across all modules. Based on current telemetry, operations are stable with the noted exceptions on the dashboard. Would you like a deeper dive into any specific domain?"
      setMessages(m => [...m, { role: 'ai', text: answer }])
    }, 900)
    setInput('')
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4 h-[calc(100vh-8rem)] flex flex-col">
      <div>
        <h1 className="text-2xl font-bold text-ice-50 flex items-center gap-2">
          <Bot className="w-6 h-6 text-cyan-400" /> AI Commander
        </h1>
        <p className="text-ice-500 text-sm">Cross-domain intelligence · Predict · Analyse · Recommend</p>
      </div>

      <div className="flex-1 glass rounded-xl border border-cyan-500/20 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((m, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className={cn("flex", m.role === 'user' ? "justify-end" : "justify-start")}>
              <div className={cn(
                "max-w-[85%] rounded-xl px-4 py-2.5 text-sm leading-relaxed",
                m.role === 'user' ? "bg-cyan-600/30 text-cyan-100 border border-cyan-500/30" : "bg-ice-900/80 text-ice-200 border border-ice-700"
              )}>
                {m.role === 'ai' && <Sparkles className="w-3.5 h-3.5 text-cyan-400 inline mr-1.5 -mt-0.5" />}
                {m.text}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="p-3 border-t border-ice-800/50 space-y-2">
          <div className="flex flex-wrap gap-1.5">
            {suggestions.map(s => (
              <button key={s} onClick={() => ask(s)}
                className="text-[11px] px-2.5 py-1 rounded-full bg-ice-800/80 text-ice-400 hover:text-cyan-300 hover:bg-cyan-500/10 border border-ice-700 hover:border-cyan-500/30 transition-colors">
                {s}
              </button>
            ))}
          </div>
          <form onSubmit={e => { e.preventDefault(); if (input.trim()) ask(input.trim()) }} className="flex gap-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask about cargo, inventory, personnel, risks..."
              className="flex-1 bg-ice-900 border border-ice-700 rounded-lg px-3 py-2 text-sm text-ice-100 focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
            />
            <button type="submit" className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white">
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
