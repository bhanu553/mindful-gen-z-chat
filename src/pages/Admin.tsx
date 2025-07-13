
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

const Admin = () => {
  const [diagnosticResult, setDiagnosticResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runDiagnostic = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/diagnostic');
      const data = await response.json();
      setDiagnosticResult(data);
    } catch (error) {
      setDiagnosticResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runDiagnostic();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">System Diagnostic</h1>
        
        <Button 
          onClick={runDiagnostic} 
          disabled={loading}
          className="mb-6"
        >
          {loading ? 'Running...' : 'Run Diagnostic'}
        </Button>

        {diagnosticResult && (
          <div className="bg-gray-800 p-6 rounded-lg">
            <pre className="text-sm overflow-x-auto">
              {JSON.stringify(diagnosticResult, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
