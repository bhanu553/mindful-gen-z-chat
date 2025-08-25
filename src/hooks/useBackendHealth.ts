
import { useState, useEffect } from 'react';

interface HealthCheck {
  status: 'healthy' | 'unhealthy';
  details: Record<string, any>;
}

interface HealthData {
  status: 'healthy' | 'unhealthy' | 'checking';
  timestamp: string;
  checks: Record<string, HealthCheck>;
}

export const useBackendHealth = () => {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHealth = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🏥 Fetching health check from /api/health...');
      const response = await fetch('/api/health?action=health');
      
      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('✅ Health check successful:', data);
      setHealth(data);
    } catch (err) {
      console.error('❌ Health check error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setHealth(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  return {
    health,
    loading,
    error,
    refresh: fetchHealth
  };
};
