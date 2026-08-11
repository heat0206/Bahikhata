import { useEffect, useState, useCallback } from 'react'
import {
  fetchApplications as apiFetch,
  createApplication as apiCreate,
  updateApplication as apiUpdate,
  deleteApplication as apiDelete,
} from '../api/applications'

/**
 * Manages the applications list — fetching, creating, updating, and deleting.
 * Returns the data plus action functions that App wires into the UI.
 */
export function useApplications() {
  const [applications, setApplications] = useState([])

  const refreshApplications = useCallback(async () => {
    const data = await apiFetch()
    setApplications(data)
    return data
  }, [])

  // Fetch on mount
  useEffect(() => {
    refreshApplications()
      .catch((error) => console.error('Failed to load applications:', error.message))
  }, [refreshApplications])

  const addApplication = useCallback(async (formData) => {
    await apiCreate(formData)
    return await refreshApplications()
  }, [refreshApplications])

  const editApplication = useCallback(async (id, formData) => {
    await apiUpdate(id, formData)
    return await refreshApplications()
  }, [refreshApplications])

  const removeApplication = useCallback(async (id, companyName) => {
    if (!window.confirm(`Are you sure you want to delete the application for ${companyName}?`)) {
      return null
    }
    await apiDelete(id)
    return await refreshApplications()
  }, [refreshApplications])

  return {
    applications,
    refreshApplications,
    addApplication,
    editApplication,
    removeApplication,
  }
}
