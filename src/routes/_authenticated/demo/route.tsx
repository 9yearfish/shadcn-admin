import { createFileRoute } from '@tanstack/react-router'
import DemoPage from '@/features/channels'

export const Route = createFileRoute('/_authenticated/demo')({
  component: DemoPage,
}) 