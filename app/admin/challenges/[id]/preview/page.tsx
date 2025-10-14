import { getChallengeById } from '@/lib/actions/challenges'
import { notFound } from 'next/navigation'
import ChallengePreviewClient from './ChallengePreviewClient'

interface Props {
  params: {
    id: string
  }
  searchParams?: {
    preview?: string
  }
}

export default async function ChallengePreviewPage({ params, searchParams }: Props) {
  console.log('params', params)
  const challenge = await getChallengeById(params.id)

  if (!challenge) {
    notFound()
  }

  const isPreviewMode = searchParams?.preview === 'true'

  return <ChallengePreviewClient challenge={challenge} isPreviewMode={isPreviewMode} />
}

export async function generateMetadata({ params }: Props) {
  const challenge = await getChallengeById(params.id)

  if (!challenge) {
    return {
      title: 'Challenge Not Found',
    }
  }

  return {
    title: `${challenge.title_bn} - Heaven Rose Islamic`,
    description: challenge.description_bn,
  }
}
