import { motion } from 'framer-motion';

interface UserCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export default function UserCard({ children, className = '', onClick }: UserCardProps) {
  return (
    <motion.div
      whileHover={onClick ? { scale: 1.02, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' } : {}}
      className={`bg-white rounded-xl border border-border shadow-sm ${className} ${
        onClick ? 'cursor-pointer' : ''
      }`}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
}
