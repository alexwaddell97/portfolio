import { MeshGradient } from '@paper-design/shaders-react';
import { useForm, ValidationError } from '@formspree/react';
import { FiCheckCircle, FiGithub, FiLinkedin, FiMail, FiTwitter } from 'react-icons/fi';
import ScrambleText from '../components/ScrambleText.tsx';
import ViewTransitionLink from '../components/ViewTransitionLink.tsx';
import { usePageTitle } from '../hooks/usePageTitle.ts';

const socialLinks = [
  { icon: FiGithub, label: 'GitHub', href: 'https://github.com/alexwaddell97' },
  { icon: FiLinkedin, label: 'LinkedIn', href: 'https://www.linkedin.com/in/alexander-waddell/' },
  { icon: FiTwitter, label: 'X', href: 'https://x.com/alexw_dev' },
  { icon: FiMail, label: 'alex@alexw.dev', href: 'mailto:alex@alexw.dev' },
];

const inputClasses =
  'w-full rounded-xs border border-next-line bg-next-bg-raised px-4 py-3 text-next-ink placeholder:text-next-ink-dim focus:border-next-neon focus:outline-none focus:ring-1 focus:ring-next-neon transition-colors';

function ContactForm() {
  const [state, handleSubmit] = useForm('mbdakwzd');

  if (state.succeeded) {
    return (
      <div className="rounded-xs border border-next-line bg-next-bg-raised p-8 text-center">
        <FiCheckCircle className="mx-auto mb-3 text-next-neon" size={36} aria-hidden="true" />
        <p className="next-heading text-lg font-bold">Message sent</p>
        <p className="mt-2 text-sm text-next-ink-dim">
          Thanks for reaching out — I&rsquo;ll get back to you soon.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
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
        <ValidationError prefix="Email" field="email" errors={state.errors} className="mt-1 text-sm text-next-neon-2" />
      </div>
      <div>
        <label htmlFor="message" className="sr-only">Your message</label>
        <textarea
          id="message"
          name="message"
          placeholder="Your message"
          required
          rows={4}
          className={`${inputClasses} resize-none`}
        />
        <ValidationError prefix="Message" field="message" errors={state.errors} className="mt-1 text-sm text-next-neon-2" />
      </div>
      <button type="submit" disabled={state.submitting} className="next-btn next-btn-primary w-full disabled:opacity-50">
        {state.submitting ? 'Sending…' : 'Send message'}
      </button>
      {Boolean(state.errors) && (
        <p className="rounded-xs border border-next-line bg-next-bg-raised px-4 py-3 text-sm text-next-ink-dim" role="alert">
          Message failed to send. Please try again or email alex@alexw.dev directly.
        </p>
      )}
    </form>
  );
}

function Contact() {
  usePageTitle('Contact');

  return (
    <div className="next-scene">
      <section className="relative flex min-h-screen flex-col justify-center overflow-hidden px-6 py-16 sm:px-10">
        {/* Background */}
        <div className="pointer-events-none absolute inset-0 z-0">
          <MeshGradient
            className="h-full w-full"
            style={{ opacity: 0.55 }}
            colors={['#000000', '#000000', '#ffffff', '#d4ff00']}
            speed={0.2}
            distortion={0.5}
            swirl={0.15}
            grainMixer={0.05}
            grainOverlay={0.18}
          />
          <div className="absolute inset-0 bg-black/55" />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-5xl">
          {/* Nav row */}
          <div className="mb-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="next-kicker">Get in touch</span>
            </div>
            <ViewTransitionLink to="/" className="next-kicker text-next-ink-dim transition-colors hover:text-next-ink">
              ← alexw.dev
            </ViewTransitionLink>
          </div>

          {/* Two-column layout */}
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
            {/* Left: copy */}
            <div className="flex flex-col justify-center">
              <ScrambleText
                as="h1"
                text="LET'S TALK"
                className="next-heading select-none text-[clamp(2.8rem,8vw,6rem)] font-black uppercase"
              />
              <p className="mt-6 max-w-sm text-base leading-relaxed text-next-ink-dim">
                Have a project, mentoring initiative, or training idea? Drop me a message and I&rsquo;ll get back to you as soon as I can.
              </p>
              <div className="mt-8 flex items-center gap-5">
                {socialLinks.map(({ icon: Icon, label, href }) => {
                  const isMailto = href.startsWith('mailto:');
                  return (
                    <a
                      key={label}
                      href={href}
                      target={isMailto ? undefined : '_blank'}
                      rel={isMailto ? undefined : 'noreferrer'}
                      aria-label={label}
                      className="text-next-ink-dim transition-colors hover:text-next-neon"
                    >
                      <Icon size={18} />
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Right: form */}
            <div>
              <ContactForm />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Contact;
