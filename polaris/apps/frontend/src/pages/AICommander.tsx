import { useState } from 'react'
import { motion } from 'framer-motion'
import { Bot, Send, Sparkles, Wifi, WifiOff, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const API_URL = import.meta.env.VITE_API_URL || ''

const SUGGESTIONS = [
  'Which critical cargo is currently delayed?',
  'Which supplies will run out first?',
  'Are all field teams accounted for?',
  'What should we prioritise for the next shipment?',
  'Summarise current operational risks',
]

type Msg = {
  role: 'user' | 'ai'
  text: string
  source?: 'openrouter' | 'local' | 'error'
  model?: string
}

export default function AICommander() {
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: 'ai',
      text: 'POLARIS AI Commander online. I have full situational awareness across Expeditions, Cargo, Inventory, Personnel and Emergency modules. How can I assist the command team?',
      source: 'local',
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const ask = async (q: string) => {
    if (!q.trim() || loading) return
    setMessages(m => [...m, { role: 'user', text: q }])
    setInput('')
    setLoading(true)

    try {
      if (API_URL) {
        const res = await fetch(`${API_URL}/api/ai/ask`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question: q }),
        })
        if (res.ok) {
          const data = await res.json()
          setMessages(m => [
            ...m,
            {
              role: 'ai',
              text: data.answer,
              source: data.source === 'openrouter' ? 'openrouter' : 'local',
              model: data.model,
            },
          ])
          setLoading(false)
          return
        }
      }
    } catch {
      // fall through to local
    }

    // Local fallback (same rules as API)
    const lower = q.toLowerCase()
    let answer =
      "I've analysed the latest data across all modules. Based on current telemetry, operations are stable with the noted exceptions on the dashboard. Would you like a deeper dive into any specific domain?"
    if (lower.includes('cargo') && (lower.includes('delay') || lower.includes('critical')))
      answer = 'Critical delayed cargo: prioritise medical supplies and diesel for Maitri. ANT-015 (aviation fuel) is delayed due to weather.'
    else if (lower.includes('fuel') || lower.includes('diesel') || lower.includes('run out') || lower.includes('supplies'))
      answer = 'Diesel at Maitri: 8,500 L vs 10,000 L minimum. Daily burn ~420 L → projected shortage in ~18 days. Recommend prioritising next fuel shipment.'
    else if (lower.includes('personnel') || lower.includes('check-in') || lower.includes('team'))
      answer = '31 field personnel deployed. P006 (Suresh Reddy) at Field Camp B missed check-in → Incident INC-0042 (Medical, Critical) is active.'
    else if (lower.includes('priorit') || lower.includes('shipment'))
      answer = 'Resupply priority: 1) Medical supplies 2) Diesel fuel 3) Communication/generator spares 4) Research instruments.'
    else if (lower.includes('risk') || lower.includes('summar'))
      answer = 'Overall risk: ELEVATED. Active medical emergency at Field Camp B, fuel timeline at Maitri (~18 days), weather-related cargo delay. ANT-47 remains operationally viable.'

    setMessages(m => [...m, { role: 'ai', text: answer, source: 'local', model: 'polaris-rules-v1' }])
    setLoading(false)
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4 h-[calc(100vh-8rem)] flex flex-col">
      <div>
        <h1 className="text-2xl font-bold text-ice-50 flex items-center gap-2">
          <Bot className="w-6 h-6 text-cyan-500" /> AI Commander
        </h1>
        <p className="text-ice-500 text-sm">Cross-domain intelligence · Predict · Analyse · Recommend</p>
      </div>

      <div className="flex-1 glass rounded-xl border border-cyan-500/20 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn('flex', m.role === 'user' ? 'justify-end' : 'justify-start')}
            >
              <div
                className={cn(
                  'max-w-[85%] rounded-xl px-4 py-2.5 text-sm leading-relaxed',
                  m.role === 'user'
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white'
                    : 'bg-ice-900/80 text-ice-200 border border-ice-700 ai-bubble-bot'
                )}
              >
                {m.role === 'ai' && (
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    {m.source && (
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full font-medium',
                          m.source === 'openrouter'
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                        )}
                      >
                        {m.source === 'openrouter' ? (
                          <><Wifi className="w-3 h-3" /> Online API</>
                        ) : (
                          <><WifiOff className="w-3 h-3" /> Local knowledge</>
                        )}
                      </span>
                    )}
                    {m.model && m.source === 'openrouter' && (
                      <span className="text-[10px] text-ice-500">{m.model}</span>
                    )}
                  </div>
                )}
                {m.text}
              </div>
            </motion.div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-ice-900/80 border border-ice-700 rounded-xl px-4 py-3 text-sm text-ice-400 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-cyan-400" /> Thinking…
              </div>
            </div>
          )}
        </div>

        <div className="p-3 border-t border-ice-800/50 space-y-2">
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTIONS.map(s => (
              <button
                key={s}
                onClick={() => ask(s)}
                disabled={loading}
                className="text-[11px] px-2.5 py-1 rounded-full bg-ice-800/80 text-ice-400 hover:text-cyan-300 hover:bg-cyan-500/10 border border-ice-700 hover:border-cyan-500/30 transition-colors disabled:opacity-50"
              >
                {s}
              </button>
            ))}
          </div>
          <form
            onSubmit={e => {
              e.preventDefault()
              ask(input)
            }}
            className="flex gap-2"
          >
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask about cargo, inventory, personnel, risks..."
              disabled={loading}
              className="flex-1 bg-ice-900 border border-ice-700 rounded-lg px-3 py-2 text-sm text-ice-100 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <p className="text-[10px] text-ice-600 text-center">
            {API_URL
              ? 'Connected to API — uses OpenRouter when key is configured, otherwise local rules'
              : 'No API URL — using local knowledge base only'}
          </p>
        </div>
      </div>
    </div>
  )
}
