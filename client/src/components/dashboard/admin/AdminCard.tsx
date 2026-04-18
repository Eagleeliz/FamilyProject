import { motion } from 'framer-motion';

interface AdminCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export default function AdminCard({ children, className = '', onClick }: AdminCardProps) {
  return (
    <motion.div
      whileHover={onClick ? { scale: 1.02, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' } : {}}
      className={`bg-white rounded-xl border border-gray-200 shadow-sm ${className} ${
        onClick ? 'cursor-pointer' : ''
      }`}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
}
