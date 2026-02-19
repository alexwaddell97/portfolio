import { motion } from 'framer-motion';
import { FiGithub, FiLinkedin, FiTwitter } from 'react-icons/fi';

const socialIcons = [
  { icon: FiGithub, label: 'GitHub', href: 'https://github.com/alexwaddell97' },
  { icon: FiLinkedin, label: 'LinkedIn', href: 'https://www.linkedin.com/in/alexander-waddell/' },
  { icon: FiTwitter, label: 'Twitter', href: 'https://x.com/alexw_dev' },
];

function Footer() {
  return (
    <footer className="border-t border-border py-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 sm:flex-row sm:justify-between sm:px-6 lg:px-8">
        <p className="text-sm text-text-muted">
          &copy; {new Date().getFullYear()} Alex Waddell. All rights reserved.
        </p>

        <div className="flex items-center gap-4">
          {socialIcons.map((social) => (
            <motion.a
              key={social.label}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ y: -2 }}
              className="text-text-muted transition-colors hover:text-accent"
              aria-label={social.label}
            >
              <social.icon size={18} />
            </motion.a>
          ))}
        </div>
      </div>
    </footer>
  );
}

export default Footer;
