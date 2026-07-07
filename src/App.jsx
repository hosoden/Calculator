import { AnimatePresence, motion } from 'framer-motion'
import {
  Camera,
  Gift,
  Share2,
  ShoppingBag,
  Sparkles,
  Trophy,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'

const STORAGE_KEY = 'shopping-kids-items'
const FOUND_KEY = 'shopping-kids-found'
const GUIDE_KEY = 'shopping-kids-guide-seen'

const initialItems = [
  {
    id: 1,
    name: 'Milk',
    image: '',
  },
  {
    id: 2,
    name: 'Banana',
    image: '',
  },
]

const quickAddItems = [
  { name: 'Milk', emoji: '🥛' },
  { name: 'Banana', emoji: '🍌' },
  { name: 'Bread', emoji: '🍞' },
  { name: 'Eggs', emoji: '🥚' },
]

function readStoredItems() {
  if (typeof window === 'undefined') return initialItems
  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) return initialItems
  try {
    return JSON.parse(raw)
  } catch {
    return initialItems
  }
}

function readStoredFound() {
  if (typeof window === 'undefined') return []
  const raw = window.localStorage.getItem(FOUND_KEY)
  if (!raw) return []
  try {
    return JSON.parse(raw)
  } catch {
    return []
  }
}

function getItemEmoji(name) {
  const lowered = name.toLowerCase()
  if (lowered.includes('milk') || lowered.includes('drink')) return '🥛'
  if (lowered.includes('banana') || lowered.includes('fruit')) return '🍌'
  if (lowered.includes('bread') || lowered.includes('toast')) return '🍞'
  if (lowered.includes('egg')) return '🥚'
  if (lowered.includes('cookie') || lowered.includes('snack')) return '🍪'
  if (lowered.includes('ice') || lowered.includes('cream')) return '🍦'
  if (lowered.includes('juice')) return '🧃'
  return '📦'
}

function App() {
  const [mode, setMode] = useState('parent')
  const [items, setItems] = useState(readStoredItems)
  const [name, setName] = useState('')
  const [imageData, setImageData] = useState('')
  const [priceA, setPriceA] = useState('')
  const [volumeA, setVolumeA] = useState('')
  const [priceB, setPriceB] = useState('')
  const [volumeB, setVolumeB] = useState('')
  const [shareUrl, setShareUrl] = useState('')
  const [shareMessage, setShareMessage] = useState('')
  const [foundIds, setFoundIds] = useState(readStoredFound)
  const [showGuide, setShowGuide] = useState(
    () => typeof window !== 'undefined' && !window.localStorage.getItem(GUIDE_KEY),
  )
  const [guardOpen, setGuardOpen] = useState(false)
  const [guardAnswer, setGuardAnswer] = useState('')
  const [guardTarget, setGuardTarget] = useState(0)
  const [guardError, setGuardError] = useState('')
  const [isSpinning, setIsSpinning] = useState(false)
  const [celebrate, setCelebrate] = useState(false)
  const holdTimer = useRef(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    }
  }, [items])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(FOUND_KEY, JSON.stringify(foundIds))
    }
  }, [foundIds])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const shared = params.get('share')
      if (shared) {
        const names = shared
          .split(',')
          .map((entry) => entry.trim())
          .filter(Boolean)
        if (names.length) {
          const imported = names.map((entry, index) => ({
            id: Date.now() + index,
            name: entry,
            image: '',
          }))
          setItems(imported)
        }
      }
    }
  }, [])

  const remainingItems = useMemo(
    () => items.filter((item) => !foundIds.includes(item.id)),
    [items, foundIds],
  )
  const currentItem = remainingItems[0] ?? null
  const completionRate = items.length ? Math.round((foundIds.length / items.length) * 100) : 0
  const isQuestComplete = items.length > 0 && foundIds.length >= items.length

  const pricePerUnitA = Number(priceA) && Number(volumeA) ? Number(priceA) / Number(volumeA) : null
  const pricePerUnitB = Number(priceB) && Number(volumeB) ? Number(priceB) / Number(volumeB) : null
  const betterDeal =
    pricePerUnitA != null && pricePerUnitB != null
      ? pricePerUnitA < pricePerUnitB
        ? 'A is the better deal'
        : 'B is the better deal'
      : 'Enter both prices to compare'

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setImageData(reader.result)
    reader.readAsDataURL(file)
  }

  const handleAddItem = (event) => {
    event.preventDefault()
    if (!name.trim()) return
    const newItem = {
      id: Date.now(),
      name: name.trim(),
      image: imageData,
    }
    setItems((prev) => [newItem, ...prev])
    setName('')
    setImageData('')
  }

  const handleQuickAdd = (itemName) => {
    const newItem = {
      id: Date.now(),
      name: itemName,
      image: '',
    }
    setItems((prev) => [newItem, ...prev])
  }

  const handleShare = async () => {
    const joined = items.map((item) => item.name).join(',')
    const nextUrl = `${window.location.origin}${window.location.pathname}?share=${encodeURIComponent(joined)}`
    setShareUrl(nextUrl)
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Shopping list',
          text: 'Let\'s check the items together',
          url: nextUrl,
        })
        setShareMessage('Shared!')
      } else {
        await navigator.clipboard.writeText(nextUrl)
        setShareMessage('Link copied')
      }
    } catch {
      setShareMessage('Share cancelled')
    }
  }

  const handleFound = () => {
    if (!currentItem) return
    setFoundIds((prev) => (prev.includes(currentItem.id) ? prev : [...prev, currentItem.id]))
    setCelebrate(false)
  }

  const handleSpinRoulette = () => {
    setIsSpinning(true)
    setCelebrate(false)
    window.setTimeout(() => {
      setIsSpinning(false)
      setCelebrate(true)
    }, 1800)
  }

  const startGuardHold = () => {
    clearTimeout(holdTimer.current)
    holdTimer.current = window.setTimeout(() => {
      setGuardOpen(true)
      setGuardTarget(3 + Math.floor(Math.random() * 4))
      setGuardError('')
      setGuardAnswer('')
    }, 1200)
  }

  const stopGuardHold = () => {
    clearTimeout(holdTimer.current)
  }

  const confirmExit = (event) => {
    event.preventDefault()
    if (Number(guardAnswer) === guardTarget) {
      setMode('parent')
      setGuardOpen(false)
      setGuardAnswer('')
      setGuardError('')
    } else {
      setGuardError('Not quite — try again')
    }
  }

  const closeGuide = () => {
    setShowGuide(false)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(GUIDE_KEY, 'true')
    }
  }

  useEffect(() => {
    return () => clearTimeout(holdTimer.current)
  }, [])

  return (
    <div className="min-h-screen bg-[#fff8ef] text-slate-800">
      <AnimatePresence>
        {showGuide ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4"
          >
            <div className="w-full max-w-md rounded-[28px] bg-white p-5 shadow-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#ff7a59]">
                🧒 Kid mode starter
              </p>
              <h2 className="mt-2 text-2xl font-black text-slate-900">
                Simple visual safety tips
              </h2>
              <ul className="mt-4 space-y-3 text-sm text-slate-700">
                <li>🔒 Use Guided Access on iPhone to keep the game on screen</li>
                <li>📱 Use app pinning on Android for a safer play space</li>
                <li>🧡 If you are unsure, ask a grown-up for help</li>
              </ul>
              <button
                type="button"
                onClick={closeGuide}
                className="mt-5 w-full rounded-2xl bg-[#4f46e5] px-4 py-3 font-bold text-white"
              >
                👍 I’m ready
              </button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <main className="mx-auto flex max-w-6xl flex-col gap-4 p-4 md:p-6 lg:flex-row lg:gap-6">
        <section className="flex-1 rounded-[32px] border border-[#ffd9be] bg-white/90 p-4 shadow-[0_15px_40px_rgba(255,122,89,0.12)] backdrop-blur md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#ff7a59]">
                🛒 Visual shopping helper
              </p>
              <h1 className="text-2xl font-black text-slate-900 md:text-3xl">
                Shopping list + kid quest
              </h1>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setMode('parent')}
                className={`rounded-full px-4 py-2 text-sm font-bold ${mode === 'parent' ? 'bg-[#ff7a59] text-white' : 'bg-[#fff1e5] text-slate-700'}`}
              >
                👨‍👩‍👧 Parent
              </button>
              <button
                type="button"
                onClick={() => setMode('kids')}
                className={`rounded-full px-4 py-2 text-sm font-bold ${mode === 'kids' ? 'bg-[#4f46e5] text-white' : 'bg-[#eef2ff] text-slate-700'}`}
              >
                🧒 Kids
              </button>
            </div>
          </div>

          {mode === 'parent' ? (
            <div className="mt-6 space-y-6">
              <div className="rounded-[24px] bg-[#fff6ee] p-4">
                <div className="flex items-center gap-2 text-[#ff7a59]">
                  <Camera size={18} />
                  <h2 className="text-lg font-black">📸 Add an item</h2>
                </div>
                <form onSubmit={handleAddItem} className="mt-4 space-y-3">
                  <input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="e.g. yogurt"
                    className="w-full rounded-2xl border border-[#ffd6b8] bg-white px-4 py-3 text-base outline-none ring-0"
                  />
                  <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-[#ffb08a] bg-white px-4 py-3 text-sm font-bold text-[#ff7a59]">
                    <Camera size={16} />
                    📷 Scan a box
                    <input type="file" accept="image/*" capture="environment" onChange={handleImageUpload} className="hidden" />
                  </label>
                  {imageData ? (
                    <img src={imageData} alt="Uploaded photo" className="h-32 w-full rounded-2xl object-cover" />
                  ) : null}
                  <div className="flex flex-wrap gap-2">
                    {quickAddItems.map((quickItem) => (
                      <button
                        key={quickItem.name}
                        type="button"
                        onClick={() => handleQuickAdd(quickItem.name)}
                        className="rounded-full border border-[#ffd6b8] bg-white px-3 py-2 text-sm font-semibold text-slate-700"
                      >
                        {quickItem.emoji} {quickItem.name}
                      </button>
                    ))}
                  </div>
                  <button type="submit" className="w-full rounded-2xl bg-[#ff7a59] px-4 py-3 font-black text-white">
                    ➕ Add to list
                  </button>
                </form>
              </div>

              <div className="rounded-[24px] border border-[#e8e4ff] bg-[#f7f7ff] p-4">
                <div className="flex items-center gap-2 text-[#4f46e5]">
                  <ShoppingBag size={18} />
                  <h2 className="text-lg font-black">💰 Compare prices</h2>
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <div className="rounded-2xl bg-white p-3">
                    <p className="text-sm font-semibold">A item</p>
                    <input value={priceA} onChange={(e) => setPriceA(e.target.value)} inputMode="decimal" placeholder="Price" className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2" />
                    <input value={volumeA} onChange={(e) => setVolumeA(e.target.value)} inputMode="decimal" placeholder="Amount" className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2" />
                  </div>
                  <div className="rounded-2xl bg-white p-3">
                    <p className="text-sm font-semibold">B item</p>
                    <input value={priceB} onChange={(e) => setPriceB(e.target.value)} inputMode="decimal" placeholder="Price" className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2" />
                    <input value={volumeB} onChange={(e) => setVolumeB(e.target.value)} inputMode="decimal" placeholder="Amount" className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2" />
                  </div>
                </div>
                <div className="mt-4 rounded-2xl bg-white p-3 text-sm font-semibold text-slate-700">
                  <p>A per unit: {pricePerUnitA != null ? `${pricePerUnitA.toFixed(2)} / unit` : 'Not entered'}</p>
                  <p>B per unit: {pricePerUnitB != null ? `${pricePerUnitB.toFixed(2)} / unit` : 'Not entered'}</p>
                  <p className="mt-2 text-[#4f46e5]">{betterDeal}</p>
                </div>
              </div>

              <div className="rounded-[24px] bg-[#f8fbff] p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-[#2563eb]">
                    <Share2 size={18} />
                    <h2 className="text-lg font-black">📤 Share the list</h2>
                  </div>
                  <button type="button" onClick={handleShare} className="rounded-full bg-[#2563eb] px-3 py-2 text-sm font-black text-white">
                    Share
                  </button>
                </div>
                <p className="mt-3 text-sm text-slate-700">
                  Turn the list into a link and share it with family or friends. There are {items.length} items right now.
                </p>
                {shareUrl ? <p className="mt-2 break-all text-xs text-slate-500">{shareUrl}</p> : null}
                {shareMessage ? <p className="mt-2 text-sm font-semibold text-[#2563eb]">{shareMessage}</p> : null}
              </div>

              <div className="rounded-[24px] border border-[#ffe0bb] bg-[#fffdf8] p-4">
                <div className="flex items-center gap-2 text-[#c26b10]">
                  <Sparkles size={18} />
                  <h2 className="text-lg font-black">🛍️ Current list</h2>
                </div>
                <ul className="mt-4 space-y-3">
                  {items.map((item) => (
                    <li key={item.id} className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm">
                      {item.image ? <img src={item.image} alt={item.name} className="h-12 w-12 rounded-xl object-cover" /> : <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#fff1e5] text-[#ff7a59]">{getItemEmoji(item.name)}</div>}
                      <span className="font-bold text-slate-800">{item.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="mt-6 rounded-[32px] bg-[#fef3c7] p-4 shadow-inner">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-black uppercase tracking-[0.2em] text-[#b45309]">
                    Kids Mode
                  </p>
                  <h2 className="text-2xl font-black text-slate-900">Errand Quest</h2>
                </div>
                <div
                  className="rounded-full border border-[#fdba74] bg-white px-3 py-2 text-sm font-black text-[#b45309]"
                  onMouseDown={startGuardHold}
                  onMouseUp={stopGuardHold}
                  onMouseLeave={stopGuardHold}
                  onTouchStart={startGuardHold}
                  onTouchEnd={stopGuardHold}
                >
                  👆 Hold to go back
                </div>
              </div>

              <div className="mt-5 rounded-[28px] bg-white p-4">
                <div className="flex items-center justify-between text-sm font-semibold text-slate-500">
                  <span>Progress</span>
                  <span>{foundIds.length}/{items.length}</span>
                </div>
                <div className="mt-2 h-4 overflow-hidden rounded-full bg-[#ffe1b3]">
                  <div className="h-full rounded-full bg-[#ff7a59] transition-all" style={{ width: `${completionRate}%` }} />
                </div>
                <div className="mt-5 flex min-h-[220px] items-center justify-center rounded-[24px] bg-[#fff8ef] p-4">
                  {currentItem ? (
                    <>
                      {currentItem.image ? (
                        <img src={currentItem.image} alt={currentItem.name} className="h-40 w-40 rounded-[24px] object-cover shadow-lg" />
                      ) : (
                        <div className="flex h-40 w-40 items-center justify-center rounded-[24px] bg-[#ffd9be] text-5xl shadow-lg">{getItemEmoji(currentItem.name)}</div>
                      )}
                    </>
                  ) : (
                    <div className="text-center text-slate-600">
                      <p className="text-xl font-black">🧺 The list is empty</p>
                      <p className="mt-2 text-sm">Ask a grown-up to add the first item</p>
                    </div>
                  )}
                </div>

                {currentItem ? (
                  <button
                    type="button"
                    onClick={handleFound}
                    className="mt-5 w-full rounded-[24px] bg-[#4f46e5] px-4 py-4 text-2xl font-black text-white shadow-[0_10px_30px_rgba(79,70,229,0.3)]"
                  >
                    ✅ Found it!
                  </button>
                ) : null}

                {isQuestComplete ? (
                  <div className="mt-4 space-y-3">
                    <button
                      type="button"
                      onClick={handleSpinRoulette}
                      className="w-full rounded-[24px] bg-[#ef4444] px-4 py-4 text-2xl font-black text-white"
                    >
                      🎲 Spin the wheel
                    </button>
                    <AnimatePresence>
                      {celebrate ? (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="rounded-[24px] bg-[#fff1f2] p-4 text-center">
                          <div className="flex items-center justify-center gap-2 text-[#dc2626]">
                            <Trophy size={20} />
                            <span className="text-xl font-black">🎉 You did it!</span>
                          </div>
                          <p className="mt-2 text-sm text-slate-700">A small digital prize for finishing the mission</p>
                        </motion.div>
                      ) : null}
                    </AnimatePresence>
                    <div className="relative overflow-hidden rounded-[24px] border border-[#fcd34d] bg-[#fffbeb] p-4">
                      <motion.div animate={isSpinning ? { rotate: 360 } : { rotate: 0 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }} className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border-8 border-[#fb923c] bg-white text-3xl font-black text-[#b45309]">
                        🎁
                      </motion.div>
                      {celebrate ? (
                        <div className="pointer-events-none absolute inset-0">
                          {Array.from({ length: 24 }).map((_, index) => (
                            <motion.span
                              key={index}
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 20 }}
                              transition={{ delay: index * 0.03 }}
                              className="absolute left-1/2 top-0 h-3 w-3 rounded-full bg-[#f43f5e]"
                              style={{ transform: `translate(-50%, 0) rotate(${index * 15}deg) translateY(-40px)` }}
                            />
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          )}
        </section>

        <aside className="w-full rounded-[32px] border border-[#fde7d0] bg-white/90 p-4 shadow-[0_12px_32px_rgba(0,0,0,0.06)] lg:max-w-[320px]">
          <div className="rounded-[24px] bg-[#fff7ed] p-4">
            <div className="flex items-center gap-2 text-[#c2410c]">
              <Gift size={18} />
              <h2 className="text-lg font-black">Point Meter</h2>
            </div>
            <div className="mt-3 h-3 overflow-hidden rounded-full bg-[#ffe7ca]">
              <div className="h-full rounded-full bg-[#ff7a59] transition-all" style={{ width: `${completionRate}%` }} />
            </div>
            <p className="mt-3 text-sm font-semibold text-slate-700">{completionRate}% complete</p>
          </div>

          <div className="mt-4 rounded-[24px] bg-[#f5f3ff] p-4">
            <p className="text-sm font-black text-[#4f46e5]">🧑‍🦳 Parent note</p>
            <p className="mt-2 text-sm text-slate-700">
              The kid view keeps the experience simple with big visual buttons and only allows a return to parent mode through a long press or a small math check.
            </p>
          </div>

          <div className="mt-4 rounded-[24px] border border-dashed border-[#f2c38a] p-4">
            <p className="text-sm font-black text-[#a16207]">📢 Ad space placeholder</p>
            <div className="mt-3 rounded-2xl bg-[#fff8ef] p-3 text-sm text-slate-600">
              This space can later hold family-safe, privacy-friendly ads.
            </div>
          </div>
        </aside>
      </main>

      <AnimatePresence>
        {guardOpen ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
            <div className="w-full max-w-sm rounded-[24px] bg-white p-5 shadow-2xl">
              <p className="text-sm font-black uppercase tracking-[0.2em] text-[#ff7a59]">🔒 Parent check</p>
              <h3 className="mt-2 text-xl font-black text-slate-900">Go back?</h3>
              <p className="mt-2 text-sm text-slate-700">Solve the tiny puzzle to confirm</p>
              <form onSubmit={confirmExit} className="mt-4 space-y-3">
                <div className="rounded-2xl bg-[#fff6ee] p-3 text-center text-lg font-black text-[#ff7a59]">
                  {guardTarget} + 2 = ?
                </div>
                <input value={guardAnswer} onChange={(event) => setGuardAnswer(event.target.value)} inputMode="numeric" placeholder="Type the number" className="w-full rounded-2xl border border-[#ffd6b8] px-3 py-3" />
                {guardError ? <p className="text-sm font-semibold text-red-500">{guardError}</p> : null}
                <button type="submit" className="w-full rounded-2xl bg-[#4f46e5] px-4 py-3 font-black text-white">
                  ✅ OK
                </button>
              </form>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}

export default App
