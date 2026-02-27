import { useState, type FormEvent } from 'react';
import { useForm, ValidationError } from '@formspree/react';
import { motion } from 'framer-motion';
import { FiGithub, FiLinkedin, FiTwitter, FiMail, FiCheckCircle } from 'react-icons/fi';
import AnimatedSection from './AnimatedSection.tsx';
import SectionHeading from './SectionHeading.tsx';

const socialLinks = [
  { icon: FiGithub, label: 'GitHub', href: 'https://github.com/alexwaddell97' },
  { icon: FiLinkedin, label: 'LinkedIn', href: 'https://www.linkedin.com/in/alexander-waddell/' },
  { icon: FiTwitter, label: 'Twitter', href: 'https://x.com/alexw_dev' },
  { icon: FiMail, label: 'alexwaddell97@gmail.com', href: 'mailto:alexwaddell97@gmail.com' },
];

const inputClasses =
  'w-full rounded-lg border border-border bg-bg-secondary px-4 py-3 text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-colors';

function ContactForm() {
  const formspreeFormId = (import.meta as ImportMeta & { env: Record<string, string | undefined> }).env.VITE_FORMSPREE_FORM_ID;
  const [state, handleSubmit] = useForm(formspreeFormId ?? 'xplaceholder');
  const [fallbackStatus, setFallbackStatus] = useState<'idle' | 'succeeded' | 'failed'>('idle');

  const formSucceeded = state.succeeded || fallbackStatus === 'succeeded';
  const hasSubmissionError = Boolean(state.errors) || fallbackStatus === 'failed';

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    if (formspreeFormId) {
      await handleSubmit(event);
      return;
    }

    event.preventDefault();
    setFallbackStatus('idle');

    try {
      const formData = new FormData(event.currentTarget);
      const name = String(formData.get('name') ?? '').trim();
      const email = String(formData.get('email') ?? '').trim();
      const message = String(formData.get('message') ?? '').trim();

      const subject = encodeURIComponent(`Portfolio enquiry from ${name || 'Website visitor'}`);
      const body = encodeURIComponent([
        `Name: ${name || 'Not provided'}`,
        `Email: ${email || 'Not provided'}`,
        '',
        message,
      ].join('\n'));

      window.location.href = `mailto:alexwaddell97@gmail.com?subject=${subject}&body=${body}`;
      event.currentTarget.reset();
      setFallbackStatus('succeeded');
    } catch {
      setFallbackStatus('failed');
    }
  }

  if (formSucceeded) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex h-full items-center justify-center rounded-xl border border-border bg-bg-card p-8"
      >
        <div className="w-full max-w-sm rounded-lg border border-border bg-bg-secondary/60 p-6 text-center">
          <FiCheckCircle className="mx-auto mb-3 text-cyan" size={36} aria-hidden="true" />
          <p className="text-lg font-semibold text-text-primary">Message sent</p>
          <p className="mt-2 text-sm text-text-secondary">Thanks for reaching out. I&apos;ll get back to you soon.</p>
        </div>
      </motion.div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="sr-only">Your name</label>
        <input
          id="name"
          type="text"
          name="name"
          placeholder="Your name"
          autoComplete="name"
          required
          className={inputClasses}
        />
      </div>
      <div>
        <label htmlFor="email" className="sr-only">Your email</label>
        <input
          id="email"
          type="email"
          name="email"
          placeholder="Your email"
          autoComplete="email"
          required
          className={inputClasses}
        />
        <ValidationError prefix="Email" field="email" errors={state.errors} className="mt-1 text-sm text-red-400" />
      </div>
      <div>
        <label htmlFor="message" className="sr-only">Your message</label>
        <textarea
          id="message"
          name="message"
          placeholder="Your message"
          required
          rows={5}
          className={`${inputClasses} resize-none`}
        />
        <ValidationError prefix="Message" field="message" errors={state.errors} className="mt-1 text-sm text-red-400" />
      </div>
      <button
        type="submit"
        disabled={state.submitting}
        className="btn-primary brand-sheen w-full disabled:opacity-50"
      >
        {state.submitting ? 'Sending...' : 'Send Message'}
      </button>
      {hasSubmissionError && (
        <p className="rounded-lg border border-border bg-bg-secondary px-4 py-3 text-sm text-text-secondary" role="alert">
          Message failed to send. Please try again or email alexwaddell97@gmail.com directly.
        </p>
      )}
    
    </form>
  );
}

function Contact() {
  return (
    <section id="contact" className="py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeading title="Get In Touch" subtitle="Have a project, mentoring initiative, or training idea? Let's talk" />

        <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
          {/* Left column — info + social */}
          <AnimatedSection>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <img src="/images/headshot.png" alt="Alex Waddell" className="w-20 h-20 rounded-full object-cover border border-border" loading="lazy" />
                <div>
                  <p className="text-lg font-semibold text-text-primary">Alex Waddell</p>
                  <p className="text-sm text-text-secondary">Lead Developer</p>
                </div>
              </div>

              <p className="text-lg leading-relaxed text-text-secondary">
                I'm always open to discussing new projects, developer mentoring, and training opportunities.
                Drop me a message and I'll get back to you as soon as I can.
              </p>

              <div className="space-y-4 pt-4">
                {socialLinks.map((link) => (
                  <motion.a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ x: 4 }}
                    className="flex items-center gap-3 text-text-secondary transition-colors hover:text-accent"
                  >
                    <link.icon size={20} />
                    <span>{link.label}</span>
                  </motion.a>
                ))}
              </div>
            </div>
          </AnimatedSection>

          {/* Right column — form */}
          <AnimatedSection delay={0.1}>
            <ContactForm />
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}

export default Contact;
