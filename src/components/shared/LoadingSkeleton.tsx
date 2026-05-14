import { motion } from 'framer-motion'

type SkeletonVariant = 'card' | 'list'

interface LoadingSkeletonProps {
  variant?: SkeletonVariant
  count?: number
}

export function LoadingSkeleton({ variant = 'card', count = 1 }: LoadingSkeletonProps) {
  const CardSkeleton = () => (
    <motion.div
      initial={{ opacity: 0.5 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, repeat: Infinity, repeatType: 'reverse' }}
      className="bg-surface border border-border rounded-md p-4"
    >
      <div className="h-4 bg-subtle rounded w-3/4 mb-3" />
      <div className="h-3 bg-subtle rounded w-1/2 mb-2" />
      <div className="h-3 bg-subtle rounded w-1/4" />
    </motion.div>
  )

  const ListSkeleton = () => (
    <motion.div
      initial={{ opacity: 0.5 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, repeat: Infinity, repeatType: 'reverse' }}
      className="flex items-center gap-3 py-3 border-b border-border"
    >
      <div className="size-10 bg-subtle rounded" />
      <div className="flex-1 space-y-2">
        <div className="h-3 bg-subtle rounded w-3/4" />
        <div className="h-3 bg-subtle rounded w-1/2" />
      </div>
    </motion.div>
  )

  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) =>
        variant === 'card' ? <CardSkeleton key={i} /> : <ListSkeleton key={i} />
      )}
    </div>
  )
}
