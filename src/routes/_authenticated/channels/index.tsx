import { createFileRoute } from '@tanstack/react-router'
import Demo from '@/features/channels'

export const Route = createFileRoute('/_authenticated/channels/')({
  component: Demo,
}) 