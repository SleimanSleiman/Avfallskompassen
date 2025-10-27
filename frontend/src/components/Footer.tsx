export default function Footer() {
  return (
    <footer className="mt-16">
      {/* Skyline band (sits at the top of the footer) */}
      <div className="w-full" aria-hidden role="presentation">
        <img
          src="/src/assets/footer-top-0eea79a353e0e1eee2dc8ee691d0d004.svg"
          alt=""
          className="w-full h-24 md:h-32 object-cover"
        />
      </div>

      {/* Footer content on dark background */}
      <div className="bg-nsr-teal text-white">
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

          <div className="mt-8 border-t border-white/10 pt-4 flex items-center justify-between text-xs text-white/70">
            <span>© {new Date().getFullYear()} NSR. Alla rättigheter förbehållna.</span>
            <div className="flex items-center gap-3">
              <img
                src="/src/assets/avfallskompassen_logo.png"
                alt="Avfallskompassen logo"
                className="h-8 w-auto"
              />
              <img
                src="/src/assets/nsr_white.svg"
                alt="NSR logo"
                className="h-8 w-auto"
              />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}