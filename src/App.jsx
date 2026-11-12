import { Camera, Share2, ShoppingBag, Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'

const STORAGE_KEY = 'shopping-kids-items'
const GOT_KEY = 'shopping-got-items'

const initialItems = [
  {
    id: 1,
    name: '牛乳',
  },
  {
    id: 2,
    name: 'バナナ',
  },
]

const quickAddItems = [
  { name: '牛乳', emoji: '🥛' },
  { name: 'バナナ', emoji: '🍌' },
  { name: 'パン', emoji: '🍞' },
  { name: '卵', emoji: '🥚' },
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

function readStoredGot() {
  if (typeof window === 'undefined') return []
  const raw = window.localStorage.getItem(GOT_KEY)
  if (!raw) return []
  try {
    return JSON.parse(raw)
  } catch {
    return []
  }
}

function getItemEmoji(name) {
  const lowered = name.toLowerCase()
  if (lowered.includes('牛乳') || lowered.includes('milk') || lowered.includes('drink')) return '🥛'
  if (lowered.includes('バナナ') || lowered.includes('banana') || lowered.includes('fruit')) return '🍌'
  if (lowered.includes('パン') || lowered.includes('bread') || lowered.includes('toast')) return '🍞'
  if (lowered.includes('卵') || lowered.includes('egg')) return '🥚'
  if (lowered.includes('クッキー') || lowered.includes('cookie') || lowered.includes('snack')) return '🍪'
  if (lowered.includes('アイス') || lowered.includes('ice') || lowered.includes('cream')) return '🍦'
  if (lowered.includes('ジュース') || lowered.includes('juice')) return '🧃'
  return '📦'
}

function App() {
  const [items, setItems] = useState(readStoredItems)
  const [name, setName] = useState('')
  const [priceA, setPriceA] = useState('')
  const [volumeA, setVolumeA] = useState('')
  const [priceB, setPriceB] = useState('')
  const [volumeB, setVolumeB] = useState('')
  const [shareUrl, setShareUrl] = useState('')
  const [shareMessage, setShareMessage] = useState('')
  const [gotIds, setGotIds] = useState(readStoredGot)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    }
  }, [items])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(GOT_KEY, JSON.stringify(gotIds))
    }
  }, [gotIds])

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
          }))
          setItems(imported)
        }
      }
    }
  }, [])

  const pricePerUnitA = Number(priceA) && Number(volumeA) ? Number(priceA) / Number(volumeA) : null
  const pricePerUnitB = Number(priceB) && Number(volumeB) ? Number(priceB) / Number(volumeB) : null
  const betterDeal =
    pricePerUnitA != null && pricePerUnitB != null
      ? pricePerUnitA < pricePerUnitB
        ? 'Aの商品がお得です'
        : 'Bの商品がお得です'
      : '両方の価格を入れて比べよう'

  const handleAddItem = (event) => {
    event.preventDefault()
    if (!name.trim()) return
    const newItem = {
      id: Date.now(),
      name: name.trim(),
    }
    setItems((prev) => [newItem, ...prev])
    setName('')
  }

  const handleQuickAdd = (itemName) => {
    const newItem = {
      id: Date.now(),
      name: itemName,
    }
    setItems((prev) => [newItem, ...prev])
  }

  const handleRemoveItem = (itemId) => {
    setItems((prev) => prev.filter((item) => item.id !== itemId))
    setGotIds((prev) => prev.filter((id) => id !== itemId))
  }

  const handleToggleGot = (itemId) => {
    setGotIds((prev) => (prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]))
  }

  const handleShare = async () => {
    const joined = items.map((item) => item.name).join(',')
    const nextUrl = `${window.location.origin}${window.location.pathname}?share=${encodeURIComponent(joined)}`
    setShareUrl(nextUrl)
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'おつかいメモ',
          text: 'いっしょにかごのものを確認しよう',
          url: nextUrl,
        })
        setShareMessage('共有しました')
      } else {
        await navigator.clipboard.writeText(nextUrl)
        setShareMessage('URLをコピーしました')
      }
    } catch {
      setShareMessage('共有をやめました')
    }
  }

  return (
    <div className="min-h-screen bg-[#fff8ef] text-slate-800">
      <main className="mx-auto flex max-w-3xl flex-col gap-4 p-4 md:p-6">
        <section className="flex-1 rounded-[32px] border border-[#ffd9be] bg-white/90 p-4 shadow-[0_15px_40px_rgba(255,122,89,0.12)] backdrop-blur md:p-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#ff7a59]">
              🛒 みんなの買い物お手伝い
            </p>
            <h1 className="text-2xl font-black text-slate-900 md:text-3xl">
              おつかいメモとお得計算
            </h1>
          </div>

          <div className="mt-6 space-y-6">
            <div className="rounded-[24px] bg-[#fff6ee] p-4">
              <div className="flex items-center gap-2 text-[#ff7a59]">
                <Camera size={18} />
                <h2 className="text-lg font-black">📸 ものを追加</h2>
              </div>
              <form onSubmit={handleAddItem} className="mt-4 space-y-3">
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="例：ヨーグルト"
                  className="w-full rounded-2xl border border-[#ffd6b8] bg-white px-4 py-3 text-base outline-none ring-0"
                />
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
                  ➕ リストに追加
                </button>
              </form>
            </div>

            <div className="rounded-[24px] border border-[#e8e4ff] bg-[#f7f7ff] p-4">
              <div className="flex items-center gap-2 text-[#4f46e5]">
                <ShoppingBag size={18} />
                <h2 className="text-lg font-black">💰 いくらか比べる</h2>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div className="rounded-2xl bg-white p-3">
                  <p className="text-sm font-semibold">A商品</p>
                  <input value={priceA} onChange={(e) => setPriceA(e.target.value)} inputMode="decimal" placeholder="価格" className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2" />
                  <input value={volumeA} onChange={(e) => setVolumeA(e.target.value)} inputMode="decimal" placeholder="容量" className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2" />
                </div>
                <div className="rounded-2xl bg-white p-3">
                  <p className="text-sm font-semibold">B商品</p>
                  <input value={priceB} onChange={(e) => setPriceB(e.target.value)} inputMode="decimal" placeholder="価格" className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2" />
                  <input value={volumeB} onChange={(e) => setVolumeB(e.target.value)} inputMode="decimal" placeholder="容量" className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2" />
                </div>
              </div>
              <div className="mt-4 rounded-2xl bg-white p-3 text-sm font-semibold text-slate-700">
                <p>Aの単価: {pricePerUnitA != null ? `${pricePerUnitA.toFixed(2)}円/単位` : 'まだ入力なし'}</p>
                <p>Bの単価: {pricePerUnitB != null ? `${pricePerUnitB.toFixed(2)}円/単位` : 'まだ入力なし'}</p>
                <p className="mt-2 text-[#4f46e5]">{betterDeal}</p>
              </div>
            </div>

            <div className="rounded-[24px] bg-[#f8fbff] p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-[#2563eb]">
                  <Share2 size={18} />
                  <h2 className="text-lg font-black">📤 かくにんメモをシェア</h2>
                </div>
                <button type="button" onClick={handleShare} className="rounded-full bg-[#2563eb] px-3 py-2 text-sm font-black text-white">
                  共有する
                </button>
              </div>
              <p className="mt-3 text-sm text-slate-700">
                リストをURLにして、家族や友だちに送れます。今は{items.length}件のメモがあります。
              </p>
              {shareUrl ? <p className="mt-2 break-all text-xs text-slate-500">{shareUrl}</p> : null}
              {shareMessage ? <p className="mt-2 text-sm font-semibold text-[#2563eb]">{shareMessage}</p> : null}
            </div>

            <div className="rounded-[24px] border border-[#ffe0bb] bg-[#fffdf8] p-4">
              <div className="flex items-center gap-2 text-[#c26b10]">
                <Sparkles size={18} />
                <h2 className="text-lg font-black">🛍️ いまのかご</h2>
              </div>
              <ul className="mt-4 space-y-3">
                {items.map((item) => {
                  const got = gotIds.includes(item.id)
                  return (
                    <li key={item.id} className="flex items-center justify-between gap-3 rounded-2xl bg-white p-3 shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#fff1e5] text-[#ff7a59]">{getItemEmoji(item.name)}</div>
                        <span className={got ? 'font-bold text-slate-400 line-through' : 'font-bold text-slate-800'}>{item.name}</span>
                      </div>
                      <div className="flex shrink-0 gap-2">
                        <button
                          type="button"
                          onClick={() => handleToggleGot(item.id)}
                          aria-pressed={got}
                          title={got ? 'かごから出す' : 'かごに入れる'}
                          className={`rounded-full px-3 py-2 text-sm font-black transition-colors ${
                            got
                              ? 'bg-[#ff7a59] text-white shadow-inner'
                              : 'border border-[#ffb08a] bg-white text-[#ff7a59]'
                          }`}
                        >
                          かご
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.id)}
                          className="rounded-full bg-[#ffe4db] px-3 py-2 text-sm font-black text-[#c2410c]"
                        >
                          削除
                        </button>
                      </div>
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
