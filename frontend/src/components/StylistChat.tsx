// "I'm wearing this, is it fine?" chat drawer.
// Answers come from lib/stylist.ts (local rules for now; an API later).
import { useEffect, useRef, useState } from 'react'
import type { Look } from '../lib/garments'
import { askStylist } from '../lib/stylist'

interface Message {
  from: 'you' | 'myrror'
  text: string
}

const QUICK = ["Is this fine for college?", 'Does it all match?', 'What should I change?', 'Okay for a dinner date?']

// Tiny formatter: **bold** and blank-line paragraphs. No library needed.
function Rich({ text }: { text: string }) {
  return (
    <>
      {text.split('\n\n').map((para, i) => (
        <p key={i} className={i ? 'mt-2' : ''}>
          {para.split(/(\*\*[^*]+\*\*)/).map((part, j) =>
            part.startsWith('**') ? <strong key={j} className="font-medium">{part.slice(2, -2)}</strong> : part,
          )}
        </p>
      ))}
    </>
  )
}

export default function StylistChat({ open, onClose, look }: { open: boolean; onClose: () => void; look: Look }) {
  const [messages, setMessages] = useState<Message[]>([
    { from: 'myrror', text: "Hi, I'm Myrror. Dress your avatar, then ask me anything, like **\"I'm wearing this, is it fine?\"**" },
  ])
  const [input, setInput] = useState('')
  const [thinking, setThinking] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)

  // keep the newest message in view
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, thinking])

  async function send(text: string) {
    const q = text.trim()
    if (!q || thinking) return
    setMessages((m) => [...m, { from: 'you', text: q }])
    setInput('')
    setThinking(true)
    const reply = await askStylist(q, look)
    setMessages((m) => [...m, { from: 'myrror', text: reply }])
    setThinking(false)
  }

  return (
    <>
      {/* dim background */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-charcoal/20 backdrop-blur-[2px] transition-opacity duration-300 ${open ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
      />
      <aside
        aria-label="Ask Myrror"
        aria-hidden={!open}
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-[400px] flex-col bg-cream transition-transform duration-500 ease-[cubic-bezier(.2,.8,.2,1)] ${
          open ? 'translate-x-0 shadow-2xl' : 'invisible translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-charcoal/10 px-5 py-4">
          <div>
            <p className="font-serif text-2xl italic text-charcoal">Ask Myrror</p>
            <p className="text-[10px] tracking-[0.18em] uppercase text-muted">Your outfit check</p>
          </div>
          <button onClick={onClose} aria-label="Close chat" className="grid h-9 w-9 place-items-center rounded-full border border-charcoal/15 text-charcoal hover:bg-charcoal/5">
            ✕
          </button>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto px-5 py-5">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.from === 'you' ? 'justify-end' : 'justify-start'} animate-[rise_300ms_ease]`}>
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  m.from === 'you' ? 'rounded-br-md bg-charcoal text-cream' : 'rounded-bl-md border border-charcoal/10 bg-white text-charcoal'
                }`}
              >
                <Rich text={m.text} />
              </div>
            </div>
          ))}
          {thinking && (
            <div className="flex gap-1 rounded-2xl rounded-bl-md border border-charcoal/10 bg-white px-4 py-3 w-fit">
              {[0, 1, 2].map((d) => (
                <span key={d} className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted" style={{ animationDelay: `${d * 120}ms` }} />
              ))}
            </div>
          )}
          <div ref={endRef} />
        </div>

        <div className="border-t border-charcoal/10 px-5 pb-5 pt-3">
          <div className="no-scrollbar mb-3 flex gap-2 overflow-x-auto">
            {QUICK.map((q) => (
              <button key={q} onClick={() => send(q)} className="shrink-0 rounded-full border border-charcoal/15 px-3 py-1.5 text-xs text-charcoal hover:border-terracotta hover:text-terracotta">
                {q}
              </button>
            ))}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              send(input)
            }}
            className="flex items-center gap-2 rounded-full border border-charcoal/15 bg-white py-1.5 pl-4 pr-1.5 focus-within:border-terracotta"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="I'm wearing this, is it fine?"
              className="flex-1 bg-transparent text-sm text-charcoal placeholder:text-muted/70 focus:outline-none"
            />
            <button type="submit" disabled={thinking} className="rounded-full bg-terracotta px-4 py-2 text-[11px] tracking-[0.15em] uppercase text-cream disabled:opacity-50">
              Ask
            </button>
          </form>
        </div>
      </aside>
    </>
  )
}
