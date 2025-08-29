import { useState } from 'react'

// Fetch job IDs from the JSON file located in the public folder.
function fetchJobIds() {
  return fetch('/jobIds.json').then(response => response.json());
}

async function simulateCheck(ids) {
  // Fetch the current list of invalid IDs
  const invalidIds = await fetch('/invalidJobIds.json').then(res => res.json());
  return new Promise((resolve) => {
    setTimeout(() => {
      if (ids.some(id => invalidIds.includes(id))) {
        resolve({ status: 400 });
      } else {
        resolve({ status: 200 });
      }
    }, 300); 
  });
}

// Recursively determines which IDs are invalid using divide and conquer approach.
async function findInvalidIDs(ids) {
  // Best Case - all valid
  if (ids.length === 0) return [];
  // Base case: if only one ID is left, check it directly.
  if (ids.length === 1) {
    const response = await simulateCheck(ids);
    return response.status === 200 ? [] : ids;
  }
  
  // Check the whole batch.
  const response = await simulateCheck(ids);
  if (response.status === 200) {
    // If the entire batch is valid, return an empty array.
    return [];
  } else {
    // Otherwise, split the batch into two halves and check them concurrently.
    const mid = Math.floor(ids.length / 2);
    const left = ids.slice(0, mid);
    const right = ids.slice(mid);
    const [leftInvalid, rightInvalid] = await Promise.all([
      findInvalidIDs(left),
      findInvalidIDs(right)
    ]);
    return [...leftInvalid, ...rightInvalid];
  }
}



function App() {
  const [loading, setLoading] = useState(false);
  const [invalidIds, setInvalidIds] = useState(null);
  const [error, setError] = useState(null);

  const runCheck = async () => {
    setLoading(true);
    setInvalidIds(null);
    setError(null);
    try {
      const jobIds = await fetchJobIds();
      const result = await findInvalidIDs(jobIds);
      setInvalidIds(result);
    } catch (error) {
      console.error("check failed", error)
      setError('An error occurred during the check.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Check for invalid Job IDs from the last 24 hours</h1>
      <button
        onClick={runCheck}
        disabled={loading}
        style={{ padding: '10px 20px', fontSize: '16px' }}
      >
        {loading ? 'Running...' : 'Run Check'}
      </button>
      {invalidIds && (
        <div style={{ marginTop: '20px' }}>
          {invalidIds.length > 0 ? (
            <div>
              <h2>Invalid Job IDs:</h2>
              <ul>
                {invalidIds.map(id => (
                  <li key={id}>{id}</li>
                ))}
              </ul>
            </div>
          ) : (
            <p>All Job IDs are valid!</p>
          )}
        </div>
      )}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  )
}

export default App