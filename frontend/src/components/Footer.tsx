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
        <div className="mx-auto w-full max-w-7xl px-4 py-10">
          <div className="grid gap-4 sm:gap-6 lg:gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Kontakta kundservice",
                items: ["Telefon: 0123-456 789", "E-post: support@nsr.se"],
              },
              {
                title: "Om NSR",
                items: ["Hållbarhet", "Information", "Nyheter"],
              },
              {
                title: "Snabblänkar",
                items: ["Avgifter & priser", "Tömning & schema", "Sorteringsguide"],
              },
            ].map((section) => (
              <div key={section.title} className="text-center sm:text-left">
                <h3 className="font-semibold mb-3">{section.title}</h3>
                <ul className="space-y-2 text-sm text-white/80">
                  {section.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-10 border-t border-white/10 pt-4 flex flex-col gap-4 text-xs text-white/70 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-center sm:text-left">
              © {new Date().getFullYear()} NSR. Alla rättigheter förbehållna.
            </span>
            <div className="flex items-center justify-center gap-3 sm:justify-end">
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
