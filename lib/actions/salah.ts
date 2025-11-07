'use server'

import { revalidatePath } from 'next/cache'
import { 
  getAllAmols, 
  getAmolById,
  createAmol,
  updateAmol,
  deleteAmol,
  getUserProgress,
  addUserProgress,
  removeUserProgress
} from '@/lib/db/queries/salah'
import { AmolFormData } from '@/lib/types/salah'
import { getUser } from './auth'

// Amol actions
export async function getAllSalahAmols() {
  try {
    return await getAllAmols()
  } catch (error) {
    console.error('Error fetching salah amols:', error)
    return []
  }
}

export async function getSalahAmolById(id: string) {
  try {
    return await getAmolById(id)
  } catch (error) {
    console.error('Error fetching salah amol:', error)
    return null
  }
}

export async function addSalahAmol(data: AmolFormData) {
  try {
    const result = await createAmol(data)
    revalidatePath('/salah')
    return { success: true, data: result }
  } catch (error) {
    console.error('Error creating salah amol:', error)
    return { success: false, error: 'Failed to create salah amol' }
  }
}

export async function editSalahAmol(id: string, data: AmolFormData) {
  try {
    const result = await updateAmol(id, data)
    revalidatePath('/salah')
    return { success: true, data: result }
  } catch (error) {
    console.error('Error updating salah amol:', error)
    return { success: false, error: 'Failed to update salah amol' }
  }
}

export async function deleteSalahAmol(id: string) {
  try {
    await deleteAmol(id)
    revalidatePath('/salah')
    return { success: true }
  } catch (error) {
    console.error('Error deleting salah amol:', error)
    return { success: false, error: 'Failed to delete salah amol' }
  }
}

// User progress actions
export async function getUserSalahProgress() {
  try {
    const user = await getUser()
    if (!user) return []

    return await getUserProgress(user.id)
  } catch (error) {
    console.error('Error fetching user salah progress:', error)
    return []
  }
}

export async function toggleAmolCompletion(amolId: string) {
  try {
    const user = await getUser()
    if (!user) return { success: false, error: 'User not authenticated' }

    const currentProgress = await getUserProgress(user.id)
    const isCompleted = currentProgress.some(p => p.amol_id === amolId)

    if (isCompleted) {
      await removeUserProgress(user.id, amolId)
    } else {
      await addUserProgress(user.id, amolId)
    }

    revalidatePath('/salah')
    return { success: true }
  } catch (error) {
    console.error('Error toggling amol completion:', error)
    return { success: false, error: 'Failed to toggle amol completion' }
  }
}