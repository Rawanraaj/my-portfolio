export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="footer">
      <p className="footer-text">
        © {new Date().getFullYear()} Aalok Niroula. Crafted with{' '}
        <span className="heart">♥</span> in Kathmandu.
      </p>
      <div className="footer-links">
        <button onClick={scrollToTop} className="footer-link">
          Back to Top ↑
        </button>
        <a href="mailto:niroulaaalok54@gmail.com" className="footer-link">Email</a>
      </div>
      <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'center' }}>
        <a
          href="https://internship.flyrank.ai/verify?id=FR-D1-BA297-B7A3F&first_name=Aalok"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Verify Aalok Niroula's FlyRank AI Internship credential"
          style={{
            boxSizing: "border-box",
            margin: "0",
            padding: "0",
            border: "0",
            background: "none",
            textDecoration: "none",
            fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif",
            fontStyle: "normal",
            lineHeight: "1.25",
            textTransform: "none",
            float: "none",
            WebkitFontSmoothing: "antialiased",
            display: "inline-block",
            width: "164px",
            height: "164px"
          }}
        >
          <svg
            width="164"
            height="164"
            viewBox="0 0 164 164"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{
              display: "block",
              opacity: "1",
              transform: "none",
              maxWidth: "none"
            }}
          >
            <circle cx="82" cy="82" r="81" fill="#051F21" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
            <circle cx="82" cy="82" r="65" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
            <path id="fr-fr-d1-ba297-b7a3f-s-top" d="M12.4 82A69.6 69.6 0 0 1 151.6 82" fill="none" />
            <path id="fr-fr-d1-ba297-b7a3f-s-btm" d="M5.6 82A76.4 76.4 0 0 0 158.4 82" fill="none" />
            <text fontFamily="ui-monospace,SFMono-Regular,Menlo,Consolas,monospace" fontSize="9" fontWeight="700" letterSpacing="1.9" fill="rgba(255,255,255,0.55)">
              <textPath href="#fr-fr-d1-ba297-b7a3f-s-top" startOffset="50%" textAnchor="middle">FLYRANK AI INTERNSHIP</textPath>
            </text>
            <text fontFamily="ui-monospace,SFMono-Regular,Menlo,Consolas,monospace" fontSize="9" fontWeight="700" letterSpacing="1.6" fill="#54E399">
              <textPath href="#fr-fr-d1-ba297-b7a3f-s-btm" startOffset="50%" textAnchor="middle">JULY 2026 COHORT</textPath>
            </text>
            <svg
              x="68"
              y="48"
              width="28"
              height="38"
              viewBox="26 18 44 60"
              fill="none"
              style={{
                opacity: "1",
                transform: "none"
              }}
            >
              <path d="M28.2354 74.2202V67.9039C29.6419 68.4369 31.3724 68.7055 33.4311 68.7055C35.3235 68.7055 36.8153 68.2396 37.8979 67.3079C38.9805 66.3762 39.9566 64.8695 40.8218 62.792L42.6887 58.3139L29.8976 29.2879C35.0038 29.2879 39.6028 32.3307 41.5294 36.9893L47.0746 50.3985L56.0126 28.6038C57.9221 23.9452 62.5168 20.894 67.6187 20.894L50.0795 63.5936C48.4556 67.5933 46.5205 70.5102 44.2743 72.3484C42.0281 74.1867 39.1169 75.1058 35.5451 75.1058C32.6212 75.1058 30.1875 74.812 28.2354 74.2244V74.2202Z" fill="#54E399" />
            </svg>
            <text x="82" y="103" textAnchor="middle" fontFamily="-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif" fontSize="13" fontWeight="600" fill="#FFFFFF">Verified</text>
            <text x="82" y="117" textAnchor="middle" fontFamily="-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif" fontSize="9.5" fill="rgba(255,255,255,0.55)">Front-end AI Engineering</text>
          </svg>
        </a>
      </div>
    </footer>
  )
}
