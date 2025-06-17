import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Editor } from 'ketcher-react'
import { StandaloneStructServiceProvider } from 'ketcher-standalone'
import { supabase } from './supabaseClient'
import 'ketcher-react/dist/index.css'
import './EditorPage.css'

const KETCHER_STANDALONE_URL = import.meta.env.VITE_KETCHER_ASSETS_URL

function EditorPage() {
  const { structureId } = useParams()
  const navigate = useNavigate()
  const [structure, setStructure] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  
  const editorRef = useRef(null)
  const structServiceRef = useRef(null)
  
  useEffect(() => {
    // Initialize the structure service provider
    structServiceRef.current = new StandaloneStructServiceProvider(
      { staticResourcesUrl: KETCHER_STANDALONE_URL }
    )
    
    // Fetch the structure data
    const fetchStructure = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-structure', {
          body: null,
          headers: { Accept: 'application/json' },
          method: 'GET',
          queryParams: { id: structureId }
        })
        
        if (error) throw error
        
        setStructure(data)
      } catch (err) {
        console.error('Error fetching structure:', err)
        setError(err.message || 'Failed to load structure')
      } finally {
        setLoading(false)
      }
    }
    
    fetchStructure()
  }, [structureId])
  
  const handleSave = async () => {
    try {
      setSaving(true)
      setError(null)
      
      // Get the current structure from the editor
      const ketcher = editorRef.current?.ketcher
      if (!ketcher) {
        throw new Error('Editor not initialized')
      }
      
      // Export the structure as a molfile
      const molfile = await ketcher.getMolfile()
      
      // Save to backend
      const { error } = await supabase.functions.invoke('update-structure', {
        body: { structureId, molfile }
      })
      
      if (error) throw error
      
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      console.error('Error saving structure:', err)
      setError(err.message || 'Failed to save structure')
    } finally {
      setSaving(false)
    }
  }
  
  const handleClose = () => {
    window.close()
    // As a fallback in case window.close() is blocked
    navigate('/')
  }
  
  if (loading) {
    return <div className="loading">Loading structure...</div>
  }
  
  if (error) {
    return (
      <div className="error-container">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/')}>Go Back</button>
      </div>
    )
  }
  
  return (
    <div className="editor-page">
      <div className="editor-header">
        <h1>Edit Chemical Structure</h1>
        <div className="editor-actions">
          <button 
            onClick={handleSave} 
            disabled={saving}
            className="save-button"
          >
            {saving ? 'Saving...' : 'Save to Notion'}
          </button>
          <button 
            onClick={handleClose}
            className="close-button"
          >
            Close
          </button>
        </div>
        
        {success && (
          <div className="success-notification">
            Structure saved successfully!
          </div>
        )}
      </div>
      
      <div className="editor-container">
        <Editor
          ref={editorRef}
          staticResourcesUrl={KETCHER_STANDALONE_URL}
          structServiceProvider={structServiceRef.current}
          initialMolfile={structure?.ket_file}
        />
      </div>
    </div>
  )
}

export default EditorPage