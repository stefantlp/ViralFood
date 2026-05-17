import { useNavigate } from 'react-router-dom'

function Footer() {
    const navigate = useNavigate()
    const year = new Date().getFullYear()

    return (
        <footer className="border-t border-white/10 bg-black text-white">
            <div className="mx-auto max-w-7xl px-6 py-16">
                <div className="flex w-full flex-col justify-between gap-10 md:flex-row md:gap-8">

                    <div className="max-w-sm">
                        <button
                            onClick={() => navigate('/')}
                            className="mb-4 text-3xl font-black"
                            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                        >
                            <span className="text-white">Viral</span><span className="text-white">Food</span>
                        </button>
                        <p className="mb-6 text-sm text-white/40 leading-relaxed">
                            At ViralFood, we believe food is more than just flavor—it's a trend, a feeling, and a story waiting to be shared.
                        </p>
                        <div className="flex gap-3">
                            <a
                                href="https://tiktok.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-sm transition-all hover:border-white/30 hover:bg-white/10"
                            >
                                🎵
                            </a>
                            <a
                                href="https://instagram.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-sm transition-all hover:border-orange-500/50 hover:bg-orange-500/10"
                            >
                                📸
                            </a>
                            <a
                                href="https://facebook.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-sm transition-all hover:border-[#38bdf8]/50 hover:bg-[#38bdf8]/10"
                            >
                                💬
                            </a>
                        </div>
                    </div>

                    <div>
                        <p className="mb-5 text-xs font-semibold uppercase tracking-widest text-white/30">Contact</p>
                        <ul className="space-y-4 text-sm text-white/50">
                            <li className="flex items-start gap-2">
                                <span className="mt-0.5 text-orange-500">📍</span>
                                <span className="leading-relaxed">Strada Exemplu nr. 1<br />București, România</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-orange-500">📞</span>
                                <span>+40 700 000 000</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-orange-500">✉️</span>
                                <span>hello@viralfood.ro</span>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <p className="mb-5 text-xs font-semibold uppercase tracking-widest text-white/30">Hours</p>
                        <ul className="space-y-2.5 text-sm">
                            <li className="flex">
                                <span className="w-24 text-white/40">Mon – Thu</span>
                                <span className="text-white/70">11:00 – 22:00</span>
                            </li>
                            <li className="flex">
                                <span className="w-24 text-white/40">Fri – Sat</span>
                                <span className="text-white/70">11:00 – 00:00</span>
                            </li>
                            <li className="flex">
                                <span className="w-24 text-white/40">Sunday</span>
                                <span className="text-white/70">12:00 – 21:00</span>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <p className="mb-5 text-xs font-semibold uppercase tracking-widest text-white/30">Legal</p>
                        <ul className="space-y-3">
                            {['Privacy Policy', 'Terms & Conditions', 'Cookie Policy', 'ANPC'].map((item) => (
                                <li key={item}>
                                    <button className="text-sm text-white/50 transition-colors hover:text-white">
                                        {item}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                </div>
            </div>

            <div className="border-t border-white/5">
                <div className="mx-auto flex max-w-7xl items-center justify-center px-6 py-5">
                    <p className="text-xs text-white/20">© {year} ViralFood. All rights reserved.</p>
                </div>
            </div>
        </footer>
    )
}

export default Footer
