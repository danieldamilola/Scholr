import { Bookmark, BookmarkCheck } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'

interface BookmarkButtonProps {
  isBookmarked: boolean
  onToggle: () => void
}

export function BookmarkButton({ isBookmarked, onToggle }: BookmarkButtonProps) {
  return (
    <motion.div whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.05 }}>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onToggle}
        className="text-zinc-500 hover:text-zinc-900"
        aria-label={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
      >
        {isBookmarked ? (
          <BookmarkCheck className="size-5 fill-current text-blue-600" />
        ) : (
          <Bookmark className="size-5" />
        )}
      </Button>
    </motion.div>
  )
}
