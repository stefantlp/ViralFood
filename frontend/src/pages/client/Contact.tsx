import Navbar from '../../components/layout/client/Navbar'
import Footer from '../../components/layout/client/Footer'

function Contact() {
  return (
    <div className="min-h-screen bg-black text-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;500;600;700&display=swap');
        * { font-family: 'Inter', sans-serif; }
        .bebas { font-family: 'Bebas Neue', sans-serif; }
        .page-glow {
          background: radial-gradient(ellipse at 50% 0%, rgba(56,189,248,0.1) 0%, rgba(249,115,22,0.05) 40%, transparent 70%);
        }
        .contact-card { transition: border-color 0.2s ease, transform 0.2s ease; }
        .contact-card:hover { border-color: rgba(56,189,248,0.4); transform: translateY(-2px); }
      `}</style>

      <Navbar />

      <div className="page-glow mx-auto max-w-7xl px-6 pt-28 pb-20">
        <div className="mb-12 text-center">
          <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-[#38bdf8]">We'd love to hear from you</p>
          <h1 className="bebas text-6xl text-white md:text-7xl">Contact Us</h1>
          <p className="mx-auto mt-3 max-w-lg text-base text-white/50 leading-relaxed">
            Got a question, a partnership idea, or just want to say hi? Reach out — we're friendly.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-16">
          {[
            {
              icon: '📍',
              title: 'Visit Us',
              lines: ['Strada Exemplu nr. 1', 'București, România'],
              color: 'text-orange-400',
            },
            {
              icon: '📞',
              title: 'Call Us',
              lines: ['+40 700 000 000', 'Mon – Sun, 10:00 – 23:00'],
              color: 'text-[#38bdf8]',
            },
            {
              icon: '✉️',
              title: 'Email Us',
              lines: ['hello@viralfood.ro', 'We reply within 24h'],
              color: 'text-orange-400',
            },
          ].map((item) => (
            <div key={item.title} className="contact-card rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
              <div className="mb-3 text-4xl">{item.icon}</div>
              <p className={`mb-2 font-semibold ${item.color}`}>{item.title}</p>
              {item.lines.map((line) => (
                <p key={line} className="text-sm text-white/50">{line}</p>
              ))}
            </div>
          ))}
        </div>

        <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
            <h2 className="bebas mb-6 text-3xl text-white">Send a Message</h2>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-white/40">Name</label>
                <input
                  type="text"
                  placeholder="Your name"
                  className="w-full rounded-xl border border-white/10 bg-black/60 px-4 py-3 text-white placeholder-white/20 outline-none transition-colors focus:border-[#38bdf8]"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-white/40">Email</label>
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="w-full rounded-xl border border-white/10 bg-black/60 px-4 py-3 text-white placeholder-white/20 outline-none transition-colors focus:border-[#38bdf8]"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-white/40">Message</label>
                <textarea
                  rows={5}
                  placeholder="How can we help?"
                  className="w-full resize-none rounded-xl border border-white/10 bg-black/60 px-4 py-3 text-white placeholder-white/20 outline-none transition-colors focus:border-[#38bdf8]"
                />
              </div>
              <button
                className="w-full rounded-xl bg-orange-500 py-3.5 font-semibold text-white transition-all hover:bg-orange-400 hover:scale-[1.01]"
              >
                Send Message
              </button>
              <p className="text-center text-xs text-white/20">This form is for display purposes. Email us directly at hello@viralfood.ro</p>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="bebas text-3xl text-white">Follow Us</h2>
            {[
              { platform: 'TikTok', handle: '@ViralFoodRo', icon: '🎵', followers: '128K', color: 'border-white/10 hover:border-white/30' },
              { platform: 'Instagram', handle: '@ViralFoodRo', icon: '📸', followers: '89K', color: 'border-white/10 hover:border-orange-500/40' },
              { platform: 'Facebook', handle: 'ViralFood Romania', icon: '💬', followers: '45K', color: 'border-white/10 hover:border-[#38bdf8]/40' },
            ].map((social) => (
              <div key={social.platform} className={`contact-card flex items-center gap-4 rounded-2xl border ${social.color} bg-white/5 p-5`}>
                <span className="text-3xl">{social.icon}</span>
                <div className="flex-1">
                  <p className="font-semibold text-white">{social.platform}</p>
                  <p className="text-sm text-white/40">{social.handle}</p>
                </div>
                <span className="text-sm text-white/30">{social.followers} followers</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default Contact
