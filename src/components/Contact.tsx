import { useForm, ValidationError } from '@formspree/react';
import { motion } from 'framer-motion';
import { FiGithub, FiLinkedin, FiTwitter, FiMail } from 'react-icons/fi';
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
  const [state, handleSubmit] = useForm('xplaceholder');

  if (state.succeeded) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex h-full items-center justify-center rounded-xl border border-border bg-bg-card p-8"
      >
        <p className="text-center text-lg text-accent">Thanks for reaching out! I'll get back to you soon.</p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
        className="w-full rounded-lg bg-accent px-6 py-3 font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-50"
      >
        {state.submitting ? 'Sending...' : 'Send Message'}
      </button>
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
