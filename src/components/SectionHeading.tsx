import { motion } from 'framer-motion';

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
}

function SectionHeading({ title, subtitle }: SectionHeadingProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="mb-16 text-center"
    >
      <h2 className="text-3xl font-bold text-text-primary md:text-4xl">{title}</h2>
      {subtitle && <p className="mt-3 text-lg text-text-secondary">{subtitle}</p>}
      <div className="mx-auto mt-4 h-0.5 w-16 rounded-full bg-gradient-to-r from-cyan via-violet to-pink" />
    </motion.div>
  );
}

export default SectionHeading;
