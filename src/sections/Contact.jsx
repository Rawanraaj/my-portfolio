import React, { useState } from 'react';
import emailjs from '@emailjs/browser';

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

  return (
    <section id="contact" className="w-full py-20 px-[6vw] overflow-hidden">
      <div className="max-w-[700px] flex flex-col gap-12">
        <h2 
          className="clip-reveal font-black tracking-tight text-outline leading-none uppercase select-none"
          style={{ fontSize: 'clamp(48px, 8vw, 72px)' }}
        >
          LET'S TALK
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
                FAILED ✗ — try niroulaalok54@gmail.com
              </span>
            )}
          </div>
        </form>
      </div>
    </section>
  );
}
