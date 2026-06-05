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
    </footer>
  )
}
