import { DhikrCounter } from '@/components/dhikr/dhikr-counter'
import { Button } from '@/components/ui/button'
import { getDhikrPresetById } from '@/lib/actions/dhikr'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function DhikrCounterPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const preset = await getDhikrPresetById(id)

  if (!preset) {
    notFound()
  }

  return (
    <div className=" py-8">
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/dhikr">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dhikr
        </Link>
      </Button>

      <DhikrCounter preset={preset} />
    </div>
  )
}
