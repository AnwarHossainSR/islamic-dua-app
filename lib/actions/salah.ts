'use server'

import { revalidatePath } from 'next/cache'
import { 
  getAllSalahPrayers, 
  getSalahPrayerWithAmols, 
  createSalahPrayer, 
  updateSalahPrayer, 
  deleteSalahPrayer,
  createAmol,
  updateAmol,
  deleteAmol,
  getUserSalahProgress,
  getUserSalahStats,
  updateUserSalahProgress
} from '@/lib/db/queries/salah'
import { SalahFormData, AmolFormData } from '@/lib/types/salah'
import { getUser } from './auth'

// Salah Prayer actions
export async function getSalahPrayers() {
  try {
    return await getAllSalahPrayers()
  } catch (error) {
    console.error('Error fetching salah prayers:', error)
    // Check if it's a table not found error
    if (error instanceof Error && error.message.includes('relation "salah_prayers" does not exist')) {
      console.error('Salah tables do not exist. Please run the salah-schema.sql file in your database.')
    }
    return []
  }
}

export async function getSalahPrayerDetails(id: string) {
  try {
    return await getSalahPrayerWithAmols(id)
  } catch (error) {
    console.error('Error fetching salah prayer details:', error)
    return null
  }
}

export async function addSalahPrayer(data: SalahFormData) {
  try {
    const result = await createSalahPrayer(data)
    revalidatePath('/salah')
    return { success: true, data: result }
  } catch (error) {
    console.error('Error creating salah prayer:', error)
    return { success: false, error: 'Failed to create salah prayer' }
  }
}

export async function editSalahPrayer(id: string, data: SalahFormData) {
  try {
    const result = await updateSalahPrayer(id, data)
    revalidatePath('/salah')
    return { success: true, data: result }
  } catch (error) {
    console.error('Error updating salah prayer:', error)
    return { success: false, error: 'Failed to update salah prayer' }
  }
}

export async function removeSalahPrayer(id: string) {
  try {
    await deleteSalahPrayer(id)
    revalidatePath('/salah')
    return { success: true }
  } catch (error) {
    console.error('Error deleting salah prayer:', error)
    return { success: false, error: 'Failed to delete salah prayer' }
  }
}

// Amol actions
export async function addAmol(data: AmolFormData) {
  try {
    const result = await createAmol(data)
    revalidatePath('/salah')
    return { success: true, data: result }
  } catch (error) {
    console.error('Error creating amol:', error)
    return { success: false, error: 'Failed to create amol' }
  }
}

export async function editAmol(id: string, data: AmolFormData) {
  try {
    const result = await updateAmol(id, data)
    revalidatePath('/salah')
    return { success: true, data: result }
  } catch (error) {
    console.error('Error updating amol:', error)
    return { success: false, error: 'Failed to update amol' }
  }
}

export async function removeAmol(id: string) {
  try {
    await deleteAmol(id)
    revalidatePath('/salah')
    return { success: true }
  } catch (error) {
    console.error('Error deleting amol:', error)
    return { success: false, error: 'Failed to delete amol' }
  }
}

// User progress actions
export async function getUserSalahData() {
  try {
    const user = await getUser()
    if (!user) return { progress: [], stats: null }

    const [progress, stats] = await Promise.all([
      getUserSalahProgress(user.id),
      getUserSalahStats(user.id)
    ])

    return { progress, stats }
  } catch (error) {
    console.error('Error fetching user salah data:', error)
    return { progress: [], stats: null }
  }
}

export async function markAmolCompleted(salahId: string, amolId: string) {
  try {
    const user = await getUser()
    if (!user) return { success: false, error: 'User not authenticated' }

    const currentProgress = await getUserSalahProgress(user.id)
    const existingProgress = currentProgress.find(p => p.salah_prayer_id === salahId)
    
    let completedAmols = existingProgress?.completed_amols as string[] || []
    
    if (!completedAmols.includes(amolId)) {
      completedAmols.push(amolId)
    }

    await updateUserSalahProgress(user.id, salahId, completedAmols)
    revalidatePath('/salah')
    
    return { success: true }
  } catch (error) {
    console.error('Error marking amol completed:', error)
    return { success: false, error: 'Failed to mark amol as completed' }
  }
}

export async function unmarkAmolCompleted(salahId: string, amolId: string) {
  try {
    const user = await getUser()
    if (!user) return { success: false, error: 'User not authenticated' }

    const currentProgress = await getUserSalahProgress(user.id)
    const existingProgress = currentProgress.find(p => p.salah_prayer_id === salahId)
    
    let completedAmols = existingProgress?.completed_amols as string[] || []
    completedAmols = completedAmols.filter(id => id !== amolId)

    await updateUserSalahProgress(user.id, salahId, completedAmols)
    revalidatePath('/salah')
    
    return { success: true }
  } catch (error) {
    console.error('Error unmarking amol:', error)
    return { success: false, error: 'Failed to unmark amol' }
  }
}