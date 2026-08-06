import { useState, useEffect } from 'react'
import * as XLSX from 'xlsx'
import { Rocket, Download, CheckCircle, AlertCircle } from 'lucide-react'

const ALL_COLS = [
  "Phone Number (Raw)", "Phone Number (Formatted)", "Format Valid", 
  "First Name", "Last Name", "Street Address", "City", "State", "ZIP Code"
]

// Assuming local dev worker runs on port 8787
const API_URL = 'http://localhost:8787'

function App() {
  const [startPhone, setStartPhone] = useState('(212) 555-0100')
  const [count, setCount] = useState<number>(100)
  const [filename, setFilename] = useState('generated_profiles.xlsx')
  const [stateFilter, setStateFilter] = useState('Auto-Detect from Phone')
  const [selectedCols, setSelectedCols] = useState<string[]>(ALL_COLS)
  
  const [validation, setValidation] = useState<{valid: boolean, parsedPhone?: string, stateName?: string, msg?: string}>({ valid: true })
  const [isGenerating, setIsGenerating] = useState(false)
  const [records, setRecords] = useState<any[]>([])
  const [metadata, setMetadata] = useState<{states: Record<string, string>, areaCodes: Record<string, string[]>}>({states: {}, areaCodes: {}})

  useEffect(() => {
    fetch(\`\${API_URL}/api/metadata\`)
      .then(res => res.json())
      .then(data => setMetadata(data))
      .catch(err => console.error("Could not load metadata", err))
  }, [])

  useEffect(() => {
    const validate = async () => {
      if (!startPhone) return
      try {
        const res = await fetch(\`\${API_URL}/api/validate\`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: startPhone })
        })
        const data = await res.json()
        if (res.ok) {
          setValidation({
            valid: data.isValid,
            parsedPhone: data.parsedPhone,
            stateName: data.stateName,
            msg: data.isValid ? \`Valid format. Detected Area: \${data.stateName || 'Unknown'}\` : "10 digits found, but structural format is invalid."
          })
        } else {
          setValidation({ valid: false, msg: data.error })
        }
      } catch (e) {
        console.error(e)
      }
    }
    const timeout = setTimeout(validate, 500)
    return () => clearTimeout(timeout)
  }, [startPhone])

  const handleGenerate = async () => {
    setIsGenerating(true)
    try {
      const res = await fetch(\`\${API_URL}/api/generate\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startPhone,
          count,
          stateFilter: stateFilter === 'Auto-Detect from Phone' ? 'ALL' : stateFilter.split(' ')[0],
          columns: selectedCols
        })
      })
      const data = await res.json()
      if (res.ok) {
        setRecords(data.records)
      } else {
        alert("Generation failed: " + data.error)
      }
    } catch (e) {
      console.error(e)
      alert("Failed to connect to backend.")
    } finally {
      setIsGenerating(false)
    }
  }

  const exportExcel = () => {
    if (records.length === 0) return
    const ws = XLSX.utils.json_to_sheet(records)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Profiles")
    
    // Style the header slightly via cols width
    ws['!cols'] = Object.keys(records[0]).map(() => ({ wch: 20 }))
    
    let outname = filename
    if (!outname.endsWith('.xlsx')) outname += '.xlsx'
    XLSX.writeFile(wb, outname)
  }

  const toggleCol = (col: string) => {
    setSelectedCols(prev => prev.includes(col) ? prev.filter(c => c !== col) : [...prev, col])
  }

  return (
    <>
      <div className="premium-header">
        <h1>🇺🇸 USA Profile Generator</h1>
        <p>Generate synthetic contact datasets with structural validation.</p>
      </div>

      <div className="card">
        <h2>Data Configuration</h2>
        <div className="grid" style={{ marginTop: '1.5rem' }}>
          <div className="input-group">
            <label>Starting Phone Number</label>
            <input 
              type="text" 
              value={startPhone} 
              onChange={e => setStartPhone(e.target.value)} 
              placeholder="(212) 555-0100" 
            />
            {startPhone && (
              <div className={\`status \${validation.valid ? 'success' : 'error'}\`}>
                {validation.valid ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                {validation.msg}
              </div>
            )}
          </div>
          
          <div className="input-group">
            <label>Target Generation State</label>
            <select value={stateFilter} onChange={e => setStateFilter(e.target.value)}>
              <option>Auto-Detect from Phone</option>
              <option>ALL (Random States)</option>
              {Object.entries(metadata.states).map(([abbr, name]) => (
                <option key={abbr} value={abbr}>{abbr} — {name}</option>
              ))}
            </select>
          </div>

          <div className="input-group">
            <label>Number of Profiles</label>
            <input 
              type="number" 
              min={1} max={10000} 
              value={count} 
              onChange={e => setCount(Number(e.target.value))} 
            />
          </div>

          <div className="input-group">
            <label>Output File Name</label>
            <input 
              type="text" 
              value={filename} 
              onChange={e => setFilename(e.target.value)} 
            />
          </div>
        </div>

        <div style={{ marginTop: '2rem' }}>
          <label style={{ marginBottom: '1rem', display: 'block' }}>Columns to Generate</label>
          <div className="checkbox-group">
            {ALL_COLS.map(col => (
              <label key={col} className="checkbox-item">
                <input 
                  type="checkbox" 
                  checked={selectedCols.includes(col)} 
                  onChange={() => toggleCol(col)}
                />
                {col}
              </label>
            ))}
          </div>
        </div>

        <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
          <button 
            className="btn btn-primary" 
            onClick={handleGenerate} 
            disabled={!validation.valid || isGenerating || selectedCols.length === 0}
            style={{ flex: 1 }}
          >
            <Rocket size={20} />
            {isGenerating ? 'Generating...' : 'Generate Profiles'}
          </button>
        </div>
      </div>

      {records.length > 0 && (
        <div className="card">
          <h2>Results</h2>
          
          <div className="metrics-grid" style={{ marginTop: '1.5rem' }}>
            <div className="metric-card">
              <h4>Total Records</h4>
              <div className="value">{records.length.toLocaleString()}</div>
            </div>
            <div className="metric-card">
              <h4>Valid Numbers</h4>
              <div className="value">{records.filter(r => r["Format Valid"] === "✅").length.toLocaleString()}</div>
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <button className="btn btn-primary" onClick={exportExcel}>
              <Download size={20} />
              Download Excel
            </button>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  {Object.keys(records[0]).map(k => <th key={k}>{k}</th>)}
                </tr>
              </thead>
              <tbody>
                {records.slice(0, 50).map((r, i) => (
                  <tr key={i}>
                    {Object.values(r).map((v: any, j) => <td key={j}>{v}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {records.length > 50 && (
            <p style={{ marginTop: '1rem', color: 'var(--text-muted)', textAlign: 'center' }}>
              Showing first 50 records. Download Excel to see all {records.length}.
            </p>
          )}
        </div>
      )}
    </>
  )
}

export default App
