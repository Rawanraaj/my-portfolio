import React, { useState, useEffect } from 'react';
import emailjs from '@emailjs/browser';
import gsap from 'gsap';

const SOCIAL_LINKS = [
  {
    label: '// EMAIL',
    value: 'niroulaalok54@gmail.com',
    url: 'mailto:niroulaalok54@gmail.com',
    external: false
  },
  {
    label: '// INSTAGRAM',
    value: '@iam_aalokniroula',
    url: 'https://www.instagram.com/iam_aalokniroula/',
    external: true
  },
  {
    label: '// GITHUB',
    value: 'github.com/Rawanraaj',
    url: 'https://github.com/Rawanraaj',
    external: true
  },
  {
    label: '// WHATSAPP',
    value: '+977 9810546623',
    url: 'https://wa.me/9779810546623',
    external: true
  }
];

export default function Contact() {
  const [formData, setFormData] = useState({
    from_name: '',
    from_email: '',
    message: ''
  });
  const [status, setStatus] = useState('idle'); // idle, sending, success, error

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.from_name || !formData.from_email || !formData.message) return;

    setStatus('sending');

    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

    emailjs.send(
      serviceId,
      templateId,
      {
        from_name: formData.from_name,
        from_email: formData.from_email,
        message: formData.message
      },
      publicKey
    )
    .then((res) => {
      setStatus('success');
      setFormData({ from_name: '', from_email: '', message: '' });
    })
    .catch((err) => {
      console.error('EmailJS Error:', err);
      setStatus('error');
    });
  };

  useEffect(() => {
    // Heading letter split stagger reveal on enter
    gsap.fromTo(
      '.contact-heading-letter',
      {
        opacity: 0,
        y: 40
      },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.05,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '#contact-heading',
          start: 'top 85%',
          toggleActions: 'play none none none'
        }
      }
    );
  }, []);

  const headingText = "LET'S TALK";

  return (
    <section id="contact" className="w-full py-20 px-[6vw] overflow-hidden" style={{ backgroundColor: 'rgba(6, 6, 15, 0.8)' }}>
      <div className="max-w-[700px] flex flex-col gap-12">
        <h2 
          id="contact-heading"
          className="font-black tracking-tight text-outline leading-none uppercase select-none flex flex-wrap"
          style={{ fontSize: 'clamp(48px, 8vw, 72px)' }}
        >
          {headingText.split('').map((char, index) => (
            <span 
              key={index} 
              className="contact-heading-letter inline-block"
              style={{ display: 'inline-block' }}
            >
              {char === ' ' ? '\u00A0' : char}
            </span>
          ))}
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-8 w-full">
          <div>
            <input
              type="text"
              name="from_name"
              value={formData.from_name}
              onChange={handleChange}
              placeholder="YOUR NAME"
              required
              className="w-full bg-transparent border-b border-[#f0ece430] py-3 text-[#f0ece4] placeholder-[#f0ece430] focus:border-[#f0ece4] outline-none transition-colors duration-200"
              style={{ cursor: 'none' }}
            />
          </div>

          <div>
            <input
              type="email"
              name="from_email"
              value={formData.from_email}
              onChange={handleChange}
              placeholder="YOUR EMAIL"
              required
              className="w-full bg-transparent border-b border-[#f0ece430] py-3 text-[#f0ece4] placeholder-[#f0ece430] focus:border-[#f0ece4] outline-none transition-colors duration-200"
              style={{ cursor: 'none' }}
            />
          </div>

          <div>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="YOUR MESSAGE"
              required
              rows={4}
              className="w-full bg-transparent border-b border-[#f0ece430] py-3 text-[#f0ece4] placeholder-[#f0ece430] focus:border-[#f0ece4] outline-none transition-colors duration-200 resize-none"
              style={{ cursor: 'none' }}
            />
          </div>

          <div className="flex items-center mt-4 h-12">
            {status === 'idle' && (
              <button
                type="submit"
                className="bg-transparent border-none text-[#f0ece4] text-[16px] font-medium tracking-wide hover:text-white transition-colors duration-200"
                style={{ cursor: 'none', fontFamily: 'Inter, sans-serif' }}
              >
                SEND IT →
              </button>
            )}

            {status === 'sending' && (
              <span 
                className="font-mono text-[14px] text-[#f0ece460]"
                style={{ fontFamily: '"JetBrains Mono", monospace' }}
              >
                SENDING...
              </span>
            )}

            {status === 'success' && (
              <span 
                className="text-[#00ffff] text-[16px] font-medium tracking-wide"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                SENT ✓
              </span>
            )}

            {status === 'error' && (
              <span 
                className="text-[#ff4444] text-[14px] font-medium tracking-wide"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                FAILED ✗ — niroulaalok54@gmail.com
              </span>
            )}
          </div>
        </form>

        {/* Social / Contact Links Row */}
        <div className="grid grid-cols-2 gap-y-8 gap-x-6 md:flex md:flex-row md:items-center md:gap-10 mt-[60px]">
          <style>{`
            .social-link-item {
              position: relative;
              display: inline-block;
              text-decoration: none;
            }
            .social-link-item::after {
              content: '';
              position: absolute;
              bottom: -4px;
              left: 0;
              width: 0;
              height: 1px;
              background-color: #00ffff;
              transition: width 0.3s ease;
            }
            .social-link-item:hover::after {
              width: 100%;
            }
          `}</style>
          {SOCIAL_LINKS.map((link, idx) => (
            <a
              key={idx}
              href={link.url}
              target={link.external ? "_blank" : undefined}
              rel={link.external ? "noopener noreferrer" : undefined}
              className="social-link-item group flex flex-col items-start gap-1"
              style={{ cursor: 'none' }}
            >
              <span 
                className="font-mono text-[10px] text-[#f0ece430] transition-transform duration-300 group-hover:-translate-y-[3px]"
                style={{ fontFamily: '"JetBrains Mono", monospace' }}
              >
                {link.label}
              </span>
              <span 
                className="text-[14px] text-[#f0ece4] transition-colors duration-300 group-hover:text-[#00ffff]"
                style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}
              >
                {link.value}
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
