import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import Navbar from '../../components/layout/client/Navbar'
import Footer from '../../components/layout/client/Footer'

const BASE = 'http://localhost:8000'

type MenuItem = {
  id: number
  name: string
  description: string
  price: number
  imageUrl: string | null
  available: boolean
  viewCount: number
  category: { id: number; name: string } | null
}

type ContentCreator = {
  id: number
  handle: string
  followers: string
  avatarUrl: string | null
  review: string
  tiktokUrl: string | null
  foodItem: { id: number; name: string } | null
  drinkItem: { id: number; name: string } | null
}

function Home() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [isMenuLoading, setIsMenuLoading] = useState(true)
  const [storyIndex, setStoryIndex] = useState<number | null>(null)
  const [storyProgress, setStoryProgress] = useState(0)
  const [orderCounts, setOrderCounts] = useState<Record<number, number>>({})
  const [creators, setCreators] = useState<ContentCreator[]>([])
  const [creatorIndex, setCreatorIndex] = useState(0)
  const [isCreatorsLoading, setIsCreatorsLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const loadMenu = async () => {
      try {
        const response = await axios.get<MenuItem[]>(`${BASE}/menu-items`)
        const available = response.data.filter((item) => item.available)
        setMenuItems(available)

        const sorted = [...available].sort((a, b) => (b.viewCount ?? 0) - (a.viewCount ?? 0)).slice(0, 6)
        const counts = await Promise.all(
          sorted.map((item) =>
            axios.get<number>(`${BASE}/order-items/count/menu-item/${item.id}`)
              .then((res) => ({ id: item.id, count: Number(res.data) }))
              .catch((err) => { console.error(`Count error for item ${item.id}:`, err); return { id: item.id, count: 0 } })
          )
        )
        const countsMap: Record<number, number> = {}
        counts.forEach(({ id, count }) => { countsMap[id] = count })
        setOrderCounts(countsMap)

        const creatorsResponse = await axios.get<ContentCreator[]>(`${BASE}/content-creators`)
        setCreators(creatorsResponse.data)
        setCreatorIndex(0)
        setIsCreatorsLoading(false)
      } catch {
        // silent
      } finally {
        setIsMenuLoading(false)
        setIsCreatorsLoading(false)
      }
    }
    loadMenu()
  }, [])

  const trendingItems = [...menuItems]
    .sort((a, b) => (b.viewCount ?? 0) - (a.viewCount ?? 0))
    .slice(0, 6)

  useEffect(() => {
    if (storyIndex === null) return
    setStoryProgress(0)
    const interval = setInterval(() => {
      setStoryProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 2
      })
    }, 80)
    return () => clearInterval(interval)
  }, [storyIndex])

  useEffect(() => {
    if (storyProgress >= 100 && storyIndex !== null) {
      const next = storyIndex + 1
      if (next < trendingItems.length) {
        setStoryIndex(next)
      } else {
        setStoryIndex(null)
      }
    }
  }, [storyProgress, storyIndex, trendingItems.length])

  useEffect(() => {
    if (storyIndex === null) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goNext()
      if (e.key === 'ArrowLeft') goPrev()
      if (e.key === 'Escape') setStoryIndex(null)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [storyIndex, trendingItems.length])

  const openStory = async (index: number) => {
    setStoryIndex(index)
    setStoryProgress(0)
    const item = trendingItems[index]
    if (item) {
      try {
        const res = await axios.post<number>(`${BASE}/menu-items/${item.id}/view`)
        setMenuItems((prev) => prev.map((i) => i.id === item.id ? { ...i, viewCount: res.data } : i))
      } catch {
        // silent
      }
    }
  }

  const goNext = () => {
    if (storyIndex === null) return
    if (storyIndex + 1 < trendingItems.length) {
      setStoryIndex(storyIndex + 1)
    } else {
      setStoryIndex(null)
    }
  }

  const goPrev = () => {
    if (storyIndex === null) return
    if (storyIndex - 1 >= 0) {
      setStoryIndex(storyIndex - 1)
    }
  }

  const activeStoryItem = storyIndex !== null ? trendingItems[storyIndex] : null

  return (
    <div className="min-h-screen bg-black text-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;500;600;700&display=swap');

        * { font-family: 'Inter', sans-serif; }
        .bebas { font-family: 'Bebas Neue', sans-serif; }

        .hero-glow {
          background: radial-gradient(ellipse at 50% -10%, rgba(249,115,22,0.2) 0%, rgba(56,189,248,0.05) 40%, transparent 70%);
        }

        .feed-card {
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }
        .feed-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 16px 48px rgba(249,115,22,0.25);
        }

        .creator-card {
          transition: transform 0.2s ease, border-color 0.2s ease;
        }
        .creator-card:hover {
          transform: translateY(-3px);
          border-color: rgba(56,189,248,0.5);
        }

        .story-section {
          background: linear-gradient(135deg, rgba(249,115,22,0.12) 0%, rgba(56,189,248,0.08) 50%, rgba(249,115,22,0.06) 100%);
          border: 1px solid rgba(249,115,22,0.25);
        }

        .divider {
          border: none;
          height: 1px;
          background: linear-gradient(to right, transparent, rgba(255,255,255,0.08), transparent);
          margin: 0;
        }

        .orange-badge {
          background: linear-gradient(135deg, #f97316, #ea580c);
          box-shadow: 0 4px 16px rgba(249,115,22,0.4);
        }

        .scroll-x { scrollbar-width: none; }
        .scroll-x::-webkit-scrollbar { display: none; }

        .story-overlay {
          animation: fadeIn 0.2s ease;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .story-card {
          animation: scaleIn 0.25s ease;
        }
        @keyframes scaleIn {
          from { transform: scale(0.94); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }

        .story-ring {
          background: linear-gradient(135deg, #f97316, #38bdf8);
          padding: 2px;
          border-radius: 9999px;
        }
      `}</style>

      <Navbar />

      {/* ── STORY POPUP ── */}
      {activeStoryItem && (
        <div
          className="story-overlay fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-sm"
          onClick={() => setStoryIndex(null)}
        >
          <div
            className="story-card relative overflow-hidden rounded-3xl bg-zinc-950 border border-white/10"
            style={{ aspectRatio: '9/16', height: '95vh' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Progress bars */}
            <div className="absolute top-3 left-3 right-3 z-10 flex gap-1">
              {trendingItems.map((_, i) => (
                <div key={i} className="h-0.5 flex-1 overflow-hidden rounded-full bg-white/25">
                  <div
                    className="h-full rounded-full bg-white transition-none"
                    style={{
                      width: i < storyIndex! ? '100%' : i === storyIndex ? `${storyProgress}%` : '0%',
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Header */}
            <div className="absolute top-8 left-3 right-3 z-10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="story-ring">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-base">
                    🔥
                  </div>
                </div>
                <p className="text-lg font-bold text-white tracking-wide" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                  ViralFood
                </p>
              </div>
              <button
                onClick={() => setStoryIndex(null)}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-white/70 hover:bg-white/20"
              >
                ✕
              </button>
            </div>

            {/* Image */}
            <div className="absolute inset-0">
              {activeStoryItem.imageUrl ? (
                <img src={activeStoryItem.imageUrl} alt={activeStoryItem.name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-zinc-900 text-8xl">🍽️</div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-transparent" />
            </div>

            {/* Content bottom */}
            <div className="absolute bottom-0 left-0 right-0 p-5">
              <div className="mb-1 flex items-center gap-2">
                <span className="rounded-full bg-orange-500/20 border border-orange-500/40 px-2 py-0.5 text-[10px] font-semibold text-orange-400 uppercase tracking-widest">
                  {activeStoryItem.category?.name || 'Special'}
                </span>
              </div>
              <h3 className="bebas mb-1 text-3xl text-white leading-none">{activeStoryItem.name}</h3>
              <p className="mb-4 text-sm text-white/60 leading-relaxed line-clamp-3">
                {activeStoryItem.description || 'One of our most viral dishes. Crafted to impress, made to be shared.'}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-orange-400">{Number(activeStoryItem.price).toFixed(2)} lei</span>
                <button
                    onClick={() => { setStoryIndex(null); navigate('/order'); window.scrollTo({ top: 0 }) }}
                    className="rounded-full bg-orange-500 px-5 py-2 text-sm font-semibold text-white hover:bg-orange-400"
                >
                  Order Now →
                </button>
              </div>
            </div>

            {storyIndex! > 0 && (
              <button
                onClick={goPrev}
                className="absolute left-3 top-1/2 z-30 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm text-white text-sm hover:bg-white/20"
              >
                ‹
              </button>
            )}
            {storyIndex! < trendingItems.length - 1 && (
              <button
                onClick={goNext}
                className="absolute right-3 top-1/2 z-30 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm text-white text-sm hover:bg-white/20"
              >
                ›
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── HERO ── */}
      <section className="hero-glow relative pt-28 pb-20 px-6 text-center">
        <div className="mx-auto max-w-3xl">
          <h1 className="bebas mb-4 text-6xl leading-none tracking-wide text-white md:text-8xl">
            Take out the <span className="text-orange-500">flash.</span><br />
            It's going <span className="text-[#38bdf8]">viral.</span>
          </h1>
          <p className="mx-auto mb-8 max-w-xl text-base text-white/50 leading-relaxed">
            So stunning, you take out the flash. So delicious, you've got to double-tap.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => { navigate('/order'); window.scrollTo({ top: 0 }) }}
              className="orange-badge rounded-full px-7 py-3 text-sm font-semibold text-white transition-all hover:scale-105"
            >
              Order Now
            </button>
            <button
              onClick={() => navigate('/reservations')}
              className="rounded-full bg-[#38bdf8] px-7 py-3 text-sm font-semibold text-black transition-all hover:bg-[#7dd3fc] hover:scale-105"
            >
              Book a Table
            </button>
          </div>
        </div>
      </section>

      <hr className="divider" />

      {/* ── TRENDING FEED ── */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-orange-500">Viral Picks</p>
              <h2 className="bebas text-5xl text-white">Trending Stories on Your Feed</h2>
            </div>
            <button
              onClick={() => { navigate('/order'); window.scrollTo({ top: 0 }) }}
              className="hidden text-sm text-[#38bdf8] transition-colors hover:text-white md:block"
            >
              See full menu →
            </button>
          </div>

          {isMenuLoading ? (
            <div className="flex items-center justify-center py-20 text-white/30">Loading...</div>
          ) : trendingItems.length === 0 ? (
            <div className="flex items-center justify-center py-20 text-white/30">No items available.</div>
          ) : (
            <div className="grid gap-4 pb-2" style={{ gridTemplateColumns: `repeat(${trendingItems.length}, 1fr)` }}>
              {trendingItems.map((item, index) => (
                <div
                  key={item.id}
                  onClick={() => openStory(index)}
                  className="feed-card relative w-full cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-white/5"
                >
                  <div className="relative aspect-[9/14] w-full overflow-hidden bg-zinc-900">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-5xl">🍽️</div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                    <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 text-xs backdrop-blur-sm">
                      <span className="text-white">{item.viewCount ?? 0}</span>
                      <span className="text-orange-400">views</span>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <p className="font-semibold text-sm leading-tight text-white">{item.name}</p>
                      <p className="text-orange-400 text-xs mt-1 font-medium">{Number(item.price).toFixed(2)} lei</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-center px-3 py-2.5">
                    <div className="flex items-center gap-1 text-xs text-white/40">
                      <span>🛒</span>
                      <span>{orderCounts[item.id] ?? 0} orders</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 text-center md:hidden">
            <button onClick={() => navigate('/order')} className="text-sm text-[#38bdf8]">
              See full menu →
            </button>
          </div>
        </div>
      </section>

      <hr className="divider" />

      {/* ── VIRAL CREATORS ── */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 text-center">
            <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-[#38bdf8]">As seen on TikTok</p>
            <h2 className="bebas text-5xl text-white">Our Viral Creators</h2>
            <p className="mt-2 text-sm text-white/40">Real people. Real reactions. Real viral moments.</p>
          </div>

          {isCreatorsLoading ? (
            <div className="flex items-center justify-center py-20 text-white/30">Loading...</div>
          ) : creators.length === 0 ? (
            <div className="flex items-center justify-center py-20 text-white/30">No creators available.</div>
          ) : (
            <div className="relative">
              <div className={`grid gap-4 ${
                creators.slice(creatorIndex, creatorIndex + 4).length === 1 ? 'grid-cols-1 max-w-sm mx-auto' :
                creators.slice(creatorIndex, creatorIndex + 4).length === 2 ? 'sm:grid-cols-2 max-w-2xl mx-auto' :
                creators.slice(creatorIndex, creatorIndex + 4).length === 3 ? 'sm:grid-cols-3 max-w-4xl mx-auto' :
                'sm:grid-cols-2 lg:grid-cols-4'
              }`}>
                {creators.slice(creatorIndex, creatorIndex + 4).map((creator) => (
                  <div
                    key={creator.id}
                    onClick={() => window.open(creator.tiktokUrl || 'https://www.tiktok.com', '_blank')}
                    className="creator-card cursor-pointer rounded-2xl border border-white/10 bg-white/5 p-5"
                  >
                    <div className="mb-4 flex items-center gap-3">
                      <div style={{ background: 'linear-gradient(135deg, #f97316, #38bdf8)', padding: '2px', borderRadius: '9999px' }}>
                        {creator.avatarUrl ? (
                          <img src={creator.avatarUrl} alt={creator.handle} className="h-12 w-12 rounded-full object-cover" />
                        ) : (
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-900 text-2xl">👤</div>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-white">@{creator.handle}</p>
                        <p className="text-xs text-white/40">{creator.followers} followers</p>
                      </div>
                    </div>

                    <p className="mb-4 text-sm text-white/70 leading-relaxed italic">
                      "{creator.review}"
                    </p>

                    <div className="flex flex-col gap-2">
                      {creator.foodItem && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-white/40">Food of choice:</span>
                          <span className="rounded-full border border-orange-500/30 bg-orange-500/10 px-2.5 py-1 text-xs text-orange-400">
                            {creator.foodItem.name}
                          </span>
                        </div>
                      )}
                      {creator.drinkItem && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-white/40">Drink of choice:</span>
                          <span className="rounded-full border border-[#38bdf8]/30 bg-[#38bdf8]/10 px-2.5 py-1 text-xs text-[#38bdf8]">
                            {creator.drinkItem.name}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {creators.length > 4 && (
                <div className="mt-6 flex items-center justify-center gap-3">
                  <button
                    onClick={() => setCreatorIndex((prev) => Math.max(0, prev - 4))}
                    disabled={creatorIndex === 0}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 text-white/60 hover:border-white hover:text-white disabled:opacity-20"
                  >
                    ‹
                  </button>
                  <span className="text-xs text-white/30">
                    {Math.floor(creatorIndex / 4) + 1} / {Math.ceil(creators.length / 4)}
                  </span>
                  <button
                    onClick={() => setCreatorIndex((prev) => Math.min(creators.length - 1, prev + 4))}
                    disabled={creatorIndex + 4 >= creators.length}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 text-white/60 hover:border-white hover:text-white disabled:opacity-20"
                  >
                    ›
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <hr className="divider" />

      {/* ── STORY DISCOUNT ── */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="story-section relative overflow-hidden rounded-3xl px-8 py-14 text-center">
            <div className="pointer-events-none absolute -top-16 -left-16 h-64 w-64 rounded-full bg-orange-500/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-16 -right-16 h-64 w-64 rounded-full bg-[#38bdf8]/10 blur-3xl" />

            <div className="relative z-10">
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-4xl">
                📱
              </div>

              <h2 className="bebas mb-3 text-5xl text-white md:text-6xl">
                Post Your Story.<br />
                <span className="text-orange-500">Get</span> A{' '}
                <span className="text-[#38bdf8]">Discount</span>.
              </h2>

              <p className="mx-auto mb-6 max-w-lg text-base text-white/60 leading-relaxed">
                Did you just receive your order from ViralFood? Tag us{' '}
                <span className="font-semibold text-orange-400">@ViralFood</span> in your Instagram or TikTok story
                and show it to our staff to unlock{' '}
                <span className="font-semibold text-white">15% off</span> your next order.
              </p>

              <div className="mb-8 flex flex-wrap items-center justify-center gap-4">
                {[
                  { icon: '📸', title: 'Post your story', sub: 'Tag @ViralFood' },
                  { icon: '🧑‍💼', title: 'Show our staff', sub: 'At the restaurant' },
                  { icon: '🎉', title: 'Enjoy 15% off', sub: 'Next order' },
                ].map((step, i) => (
                  <>
                    <div key={step.title} className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3">
                      <span className="text-2xl">{step.icon}</span>
                      <div className="text-left">
                        <p className="text-sm font-semibold text-white">{step.title}</p>
                        <p className="text-xs text-white/40">{step.sub}</p>
                      </div>
                    </div>
                    {i < 2 && <span key={`arrow-${i}`} className="text-white/20">→</span>}
                  </>
                ))}
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3">
                <span className="rounded-full border border-orange-500/40 bg-orange-500/15 px-4 py-1.5 text-sm font-semibold text-orange-400">#ViralFoodRo</span>
                <span className="rounded-full border border-[#38bdf8]/40 bg-[#38bdf8]/10 px-4 py-1.5 text-sm font-semibold text-[#38bdf8]">#TrendingFood</span>
                <span className="rounded-full border border-white/20 bg-white/5 px-4 py-1.5 text-sm font-semibold text-white/60">#FoodTikTok</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <hr className="divider" />

      <Footer />
    </div>
  )
}

export default Home