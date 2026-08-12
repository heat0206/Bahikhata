import { useEffect, useState, useCallback, useRef } from 'react'
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

  const checkDeadlines = useCallback(async (apps) => {
    if (!apps || apps.length === 0) return;
    let needsRefresh = false;
    const now = new Date();
    for (const app of apps) {
      if (app.status === 'OA - Upcoming' && app.oaDate && app.oaTime) {
        const oaDateTime = new Date(`${app.oaDate}T${app.oaTime}`);
        if (oaDateTime < now) {
          try {
            await apiUpdate(app._id, { ...app, status: 'OA - Completed' });
            needsRefresh = true;
          } catch (error) {
            console.error('Failed to auto-update OA status:', error.message);
          }
        }
      }
    }
    if (needsRefresh) {
      refreshApplications();
    }
  }, [refreshApplications]);

  // Keep a fresh reference to applications for the interval
  const appsRef = useRef(applications);
  useEffect(() => {
    appsRef.current = applications;
    
    // Also run an immediate check whenever applications change
    checkDeadlines(applications);
  }, [applications, checkDeadlines]);

  // Setup a single interval that checks every 10 seconds
  useEffect(() => {
    const intervalId = setInterval(() => {
      checkDeadlines(appsRef.current);
    }, 10000); // 10 seconds for faster updates

    return () => clearInterval(intervalId);
  }, [checkDeadlines]);

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
