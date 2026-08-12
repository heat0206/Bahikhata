import { useState, useCallback } from 'react'

const EMPTY_FORM = {
  companyName: '',
  role: '',
  location: '',
  appliedThrough: '',
  appliedOn: '',
  status: '',
  oaDate: '',
  oaTime: '',
  jobLink: '',
  notes: '',
}

/**
 * Manages the Add / Edit form state, the modal open/close lifecycle,
 * and the editing-vs-creating distinction.
 */
export function useApplicationForm() {
  const [form, setForm] = useState(EMPTY_FORM)
  const [editingId, setEditingId] = useState(null)
  const [isFormOpen, setIsFormOpen] = useState(false)

  const handleChange = useCallback((event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }, [])

  const openAddForm = useCallback(() => {
    setForm(EMPTY_FORM)
    setEditingId(null)
    setIsFormOpen(true)
  }, [])

  const openEditForm = useCallback((application) => {
    setForm(application)
    setEditingId(application._id)
    setIsFormOpen(true)
  }, [])

  const closeForm = useCallback(() => {
    setForm(EMPTY_FORM)
    setEditingId(null)
    setIsFormOpen(false)
  }, [])

  return {
    form,
    editingId,
    isFormOpen,
    handleChange,
    openAddForm,
    openEditForm,
    closeForm,
  }
}
