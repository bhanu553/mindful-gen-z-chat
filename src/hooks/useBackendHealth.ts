import { useState, useEffect } from 'react';

interface HealthCheck {
  status: 'healthy' | 'unhealthy' | 'checking';
  details: any;
}

interface HealthStatus {
  timestamp: string;
  status: 'healthy' | 'unhealthy' | 'checking';
  checks: {
    openai: HealthCheck;
    supabase: HealthCheck;
    environment: HealthCheck;
  };
}

export const useBackendHealth = () => {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkHealth = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/health');
      
      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status}`);
      }
      
      const healthData = await response.json();
      setHealth(healthData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setHealth(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  return {
    health,
    loading,
    error,
    refresh: checkHealth
  };
};