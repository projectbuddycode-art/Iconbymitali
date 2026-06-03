import { useEffect, useRef, useCallback, useState } from 'react';

/**
 * useAutosaveDraft Hook
 * 
 * Provides automatic draft management for admin forms:
 * - Auto-saves form data to localStorage every N seconds
 * - Restores draft on component mount
 * - Provides explicit save/clear methods
 * - Shows save state indicators (saving, saved, error)
 * - Prevents data loss on page refresh or accidental logout
 * 
 * @param {string} draftKey - Unique identifier for this draft (e.g., 'product-form', 'collection-1')
 * @param {object} formData - Current form data to save
 * @param {number} autoSaveIntervalMs - Interval between auto-saves (default: 5000ms)
 * @param {function} onDraftLoaded - Callback when draft is restored (optional)
 * @returns {object} Draft management API
 * 
 * @example
 * const {
 *   hasDraft,
 *   draftData,
 *   saveState,
 *   restoreDraft,
 *   clearDraft,
 *   updateDraft
 * } = useAutosaveDraft('product-form', formData, 5000);
 * 
 * if (hasDraft && !isEditing) {
 *   return <RestoreDraftButton onRestore={restoreDraft} />;
 * }
 * 
 * return (
 *   <form>
 *     <FormFields values={formData} onChange={updateDraft} />
 *     <SaveStatus state={saveState} />
 *   </form>
 * );
 */
export function useAutosaveDraft(
  draftKey,
  formData,
  autoSaveIntervalMs = 5000,
  onDraftLoaded = null
) {
  const [hasDraft, setHasDraft] = useState(false);
  const [draftData, setDraftData] = useState(null);
  const [saveState, setSaveState] = useState('idle'); // 'idle' | 'saving' | 'saved' | 'error'
  const [lastSaveError, setLastSaveError] = useState(null);
  
  const autoSaveTimeoutRef = useRef(null);
  const lastSavedDataRef = useRef(null);
  
  /**
   * Check if data has changed since last save
   */
  const hasDataChanged = useCallback(() => {
    return JSON.stringify(formData) !== JSON.stringify(lastSavedDataRef.current);
  }, [formData]);

  /**
   * Save draft to localStorage with metadata
   */
  const saveDraftToStorage = useCallback((dataToSave) => {
    try {
      setSaveState('saving');
      setLastSaveError(null);
      
      const draftMetadata = {
        data: dataToSave,
        savedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      };
      
      localStorage.setItem(`draft_${draftKey}`, JSON.stringify(draftMetadata));
      lastSavedDataRef.current = dataToSave;
      
      setSaveState('saved');
      console.log(`✅ Draft saved: ${draftKey}`);
      
      // Reset to idle after 2 seconds
      setTimeout(() => setSaveState('idle'), 2000);
    } catch (error) {
      console.error(`❌ Failed to save draft: ${draftKey}`, error);
      setLastSaveError(error.message);
      setSaveState('error');
      
      // Reset error state after 3 seconds
      setTimeout(() => {
        setSaveState('idle');
        setLastSaveError(null);
      }, 3000);
    }
  }, [draftKey]);

  /**
   * Load draft from localStorage
   */
  const loadDraft = useCallback(() => {
    try {
      const stored = localStorage.getItem(`draft_${draftKey}`);
      if (!stored) {
        setHasDraft(false);
        return null;
      }

      const draftMetadata = JSON.parse(stored);
      
      // Check if draft has expired (7 days)
      const expiresAt = new Date(draftMetadata.expiresAt);
      if (new Date() > expiresAt) {
        console.log(`⏰ Draft expired: ${draftKey}`);
        clearDraftFromStorage();
        setHasDraft(false);
        return null;
      }

      setHasDraft(true);
      setDraftData(draftMetadata.data);
      console.log(`📋 Draft found: ${draftKey}`);
      
      if (onDraftLoaded) {
        onDraftLoaded(draftMetadata.data);
      }
      
      return draftMetadata.data;
    } catch (error) {
      console.error(`❌ Failed to load draft: ${draftKey}`, error);
      setHasDraft(false);
      return null;
    }
  }, [draftKey, onDraftLoaded]);

  /**
   * Clear draft from localStorage
   */
  const clearDraftFromStorage = useCallback(() => {
    try {
      localStorage.removeItem(`draft_${draftKey}`);
      setHasDraft(false);
      setDraftData(null);
      lastSavedDataRef.current = null;
      console.log(`🗑️ Draft cleared: ${draftKey}`);
    } catch (error) {
      console.error(`❌ Failed to clear draft: ${draftKey}`, error);
    }
  }, [draftKey]);

  /**
   * Explicitly restore draft data to current form
   */
  const restoreDraft = useCallback(() => {
    const draft = loadDraft();
    if (draft) {
      // Return the draft data so parent can apply it to formData
      return draft;
    }
    return null;
  }, [loadDraft]);

  /**
   * Explicitly update draft (can be called directly from form onChange)
   */
  const updateDraft = useCallback((newData) => {
    // Schedule auto-save if data changed
    if (hasDataChanged()) {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
      
      autoSaveTimeoutRef.current = setTimeout(() => {
        saveDraftToStorage(newData);
      }, autoSaveIntervalMs);
    }
  }, [hasDataChanged, saveDraftToStorage, autoSaveIntervalMs]);

  /**
   * Manual save trigger
   */
  const manualSave = useCallback(() => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    saveDraftToStorage(formData);
  }, [formData, saveDraftToStorage]);

  /**
   * Initialize draft on mount
   */
  useEffect(() => {
    loadDraft();
    lastSavedDataRef.current = formData;
  }, []); // Only run once on mount

  /**
   * Auto-save on data change
   */
  useEffect(() => {
    if (hasDataChanged()) {
      updateDraft(formData);
    }
  }, [formData, hasDataChanged, updateDraft]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  return {
    // State
    hasDraft,
    draftData,
    saveState, // 'idle' | 'saving' | 'saved' | 'error'
    lastSaveError,
    
    // Methods
    restoreDraft,      // () => draftData | null
    clearDraft: clearDraftFromStorage,  // () => void
    updateDraft,       // (data) => void - can be called directly
    manualSave,        // () => void - force immediate save
    
    // Computed
    isSaving: saveState === 'saving',
    isSaved: saveState === 'saved',
    hasError: saveState === 'error',
  };
}

/**
 * Hook to detect unsaved changes and warn before leaving
 * Use this alongside useAutosaveDraft
 * 
 * @param {boolean} hasChanges - Whether form has unsaved changes
 * @param {string} message - Custom warning message (optional)
 * 
 * @example
 * useBeforeUnload(hasUnsavedChanges, 'You have unsaved changes. Are you sure?');
 */
export function useBeforeUnload(hasChanges, message = 'You have unsaved changes. Are you sure you want to leave?') {
  useEffect(() => {
    if (!hasChanges) return;

    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = message;
      return message;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasChanges, message]);
}

/**
 * Get display text for save state
 */
export function getSaveStateText(saveState) {
  switch (saveState) {
    case 'saving':
      return '💾 Saving...';
    case 'saved':
      return '✅ Saved';
    case 'error':
      return '❌ Save Failed';
    default:
      return '';
  }
}

/**
 * Get CSS class for save state indicator
 */
export function getSaveStateClass(saveState) {
  switch (saveState) {
    case 'saving':
      return 'text-yellow-600 animate-pulse';
    case 'saved':
      return 'text-green-600';
    case 'error':
      return 'text-red-600';
    default:
      return 'text-gray-400';
  }
}

/**
 * Save state indicator component
 */
export function SaveStateIndicator({ saveState, error, className = '' }) {
  return (
    <div className={`text-sm font-medium transition-colors ${getSaveStateClass(saveState)} ${className}`}>
      <div>{getSaveStateText(saveState)}</div>
      {error && <div className="text-xs mt-1">{error}</div>}
    </div>
  );
}
