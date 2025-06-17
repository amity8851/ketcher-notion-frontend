import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { supabase } from './supabaseClient'
import './App.css'

function NewStructurePage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  
  useEffect(() => {
    const pageId = searchParams.get('pageId')
    
    if (!pageId) {
      setError('No page ID provided. Please check the URL.')
      return
    }
    
    const createStructure = async () => {
      setLoading(true)
      
      try {
        // Default empty structure
        const emptyMolfile = `
  Ketcher  04132308282D 1   1.00000     0.00000     0

  0  0  0     0  0            999 V2000
M  END
        `.trim()
        
        const { data, error } = await supabase.functions.invoke('create-structure', {
          body: { pageId, molfile: emptyMolfile }
        })
        
        if (error) throw error
        
        // Navigate to edit the newly created structure
        navigate(`/edit/${data.structureId}`)
      } catch (err) {
        console.error('Error creating structure:', err)
        setError(err.message || 'An error occurred')
      } finally {
        setLoading(false)
      }
    }
    
    createStructure()
  }, [searchParams, navigate])
  
  if (loading) {
    return <div className="loading">Creating new structure...</div>
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
  
  return <div className="loading">Preparing editor...</div>
}

export default NewStructurePage