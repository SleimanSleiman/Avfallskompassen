export default function Footer() {
  return (
    <footer className="mt-16">
      {/* Skyline band (sits at the top of the footer) */}
      <div className="w-full" aria-hidden role="presentation">
        <svg viewBox="0 0 800 140" className="w-full h-24 md:h-32" preserveAspectRatio="none">
          {/* dark base strip */}
          <path d="M0 120h800v20H0z" fill="#003F44" />
          {/* teal skyline wave */}
          <path
            d="M0 120c40-20 80-30 120-10 60 30 140-60 200-20 70 45 120-10 180 0s100 40 160 10 120 10 140 20H0z"
            fill="#007A84"
          />
        </svg>
      </div>

      {/* Footer content on dark background */}
      <div className="bg-nsr-tealDark text-white">
        <div className="mx-auto max-w-7xl px-4 py-10">
          <div className="grid gap-8 md:grid-cols-3">
            <div>
              <h3 className="font-semibold mb-3">Kontakta kundservice</h3>
              <ul className="space-y-2 text-sm text-white/80">
                <li>Telefon: 0123-456 789</li>
                <li>E-post: support@nsr.se</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Om NSR</h3>
              <ul className="space-y-2 text-sm text-white/80">
                <li>Hållbarhet</li>
                <li>Information</li>
                <li>Nyheter</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Snabblänkar</h3>
              <ul className="space-y-2 text-sm text-white/80">
                <li>Avgifter & priser</li>
                <li>Tömning & schema</li>
                <li>Sorteringsguide</li>
              </ul>
            </div>
          </div>

          <div className="mt-8 border-t border-white/10 pt-4 text-xs text-white/70">
            © {new Date().getFullYear()} NSR. Alla rättigheter förbehållna.
          </div>
        </div>
      </div>
    </footer>
  );
}