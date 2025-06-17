import { useState } from 'react'
import { supabase } from './supabaseClient'
import './App.css'

function App() {
  const [loading, setLoading] = useState(false)
  const [notionPageId, setNotionPageId] = useState('')
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    try {
      // Default empty structure
      const emptyMolfile = `
  Ketcher  04132308282D 1   1.00000     0.00000     0

  0  0  0     0  0            999 V2000
M  END
      `.trim()
      
      const { data, error } = await supabase.functions.invoke('create-structure', {
        body: { pageId: notionPageId, molfile: emptyMolfile }
      })
      
      if (error) throw error
      
      setSuccess(true)
    } catch (err) {
      console.error('Error creating structure:', err)
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="App">
      <h1>Ketcher Notion Integration</h1>
      
      {success ? (
        <div className="success-message">
          <h2>Success!</h2>
          <p>A new chemical structure has been added to your Notion page.</p>
          <p>Go back to your Notion page to see and edit it.</p>
          <button onClick={() => {
            setSuccess(false)
            setNotionPageId('')
          }}>Add Another Structure</button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="notionPageId">Notion Page ID:</label>
            <input
              id="notionPageId"
              type="text"
              value={notionPageId}
              onChange={(e) => setNotionPageId(e.target.value)}
              placeholder="Enter Notion page ID"
              required
            />
            <small>Find this in the URL of your Notion page: notion.so/page-title-<strong>pageID</strong></small>
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <button type="submit" disabled={loading}>
            {loading ? 'Adding...' : 'Add Chemical Structure to Notion'}
          </button>
        </form>
      )}
    </div>
  )
}

export default App