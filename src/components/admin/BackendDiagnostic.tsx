import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useBackendHealth } from '@/hooks/useBackendHealth';
import { Loader2, RefreshCw, CheckCircle, XCircle, AlertCircle, Play } from 'lucide-react';

interface DiagnosticResult {
  status: string;
  openaiAPIUsed: boolean;
  openaiConnected: boolean;
  apiKeyPresent: boolean;
  hardcodedRepliesRemoved: boolean;
  hardcodedMessagesFound: string[];
  modeTests: Record<string, any>;
  finalTestReply: string | null;
  systemPromptUsed: string | null;
  errors: string[];
}

const BackendDiagnostic = () => {
  const { health, loading: healthLoading, error: healthError, refresh: refreshHealth } = useBackendHealth();
  const [diagnostic, setDiagnostic] = useState<DiagnosticResult | null>(null);
  const [diagnosticLoading, setDiagnosticLoading] = useState(false);
  const [diagnosticError, setDiagnosticError] = useState<string | null>(null);

  const runDiagnostic = async () => {
    setDiagnosticLoading(true);
    setDiagnosticError(null);
    
    try {
      const response = await fetch('/api/diagnostic');
      if (!response.ok) {
        throw new Error(`Diagnostic failed: ${response.status}`);
      }
      
      const result = await response.json();
      setDiagnostic(result);
    } catch (error) {
      setDiagnosticError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setDiagnosticLoading(false);
    }
  };

  const getStatusIcon = (status: 'healthy' | 'unhealthy' | 'checking') => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'unhealthy': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'checking': return <Loader2 className="h-4 w-4 animate-spin text-yellow-500" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string | boolean) => {
    if (typeof status === 'boolean') {
      return status ? 'bg-green-500' : 'bg-red-500';
    }
    switch (status) {
      case 'healthy':
      case 'success': return 'bg-green-500';
      case 'unhealthy':
      case 'error': return 'bg-red-500';
      case 'checking': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">EchoMind Backend Diagnostic</h1>
        <div className="flex gap-2">
          <Button onClick={refreshHealth} disabled={healthLoading} variant="outline">
            <RefreshCw className={`h-4 w-4 mr-2 ${healthLoading ? 'animate-spin' : ''}`} />
            Refresh Health
          </Button>
          <Button onClick={runDiagnostic} disabled={diagnosticLoading}>
            {diagnosticLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}
            Run Full Diagnostic
          </Button>
        </div>
      </div>

      {/* Health Check Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            System Health Check
            {health && getStatusIcon(health.status)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {healthError && (
            <div className="p-4 border border-red-200 rounded-lg bg-red-50">
              <p className="text-red-800">Health check failed: {healthError}</p>
            </div>
          )}
          
          {health && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(health.checks).map(([name, check]) => (
                  <div key={name} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium capitalize">{name}</h3>
                      <Badge className={getStatusColor(check.status)}>
                        {check.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600">
                      <pre className="whitespace-pre-wrap text-xs">
                        {JSON.stringify(check.details, null, 2)}
                      </pre>
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-xs text-gray-500">
                Last checked: {new Date(health.timestamp).toLocaleString()}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Full Diagnostic Results */}
      <Card>
        <CardHeader>
          <CardTitle>OpenAI Integration Diagnostic</CardTitle>
        </CardHeader>
        <CardContent>
          {diagnosticError && (
            <div className="p-4 border border-red-200 rounded-lg bg-red-50 mb-4">
              <p className="text-red-800">Diagnostic failed: {diagnosticError}</p>
            </div>
          )}

          {diagnostic && (
            <div className="space-y-6">
              {/* Overall Status */}
              <div className="flex items-center gap-4">
                <Badge className={getStatusColor(diagnostic.status)} variant="outline">
                  Status: {diagnostic.status}
                </Badge>
                <Badge className={getStatusColor(diagnostic.openaiConnected)} variant="outline">
                  OpenAI: {diagnostic.openaiConnected ? 'Connected' : 'Disconnected'}
                </Badge>
                <Badge className={getStatusColor(diagnostic.apiKeyPresent)} variant="outline">
                  API Key: {diagnostic.apiKeyPresent ? 'Present' : 'Missing'}
                </Badge>
                <Badge className={getStatusColor(diagnostic.hardcodedRepliesRemoved)} variant="outline">
                  Hardcoded Replies: {diagnostic.hardcodedRepliesRemoved ? 'Removed' : 'Found'}
                </Badge>
              </div>

              <Separator />

              {/* Mode Detection Tests */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Mode Detection Tests</h3>
                <div className="grid gap-3">
                  {Object.entries(diagnostic.modeTests).map(([mode, test]: [string, any]) => (
                    <div key={mode} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{mode} Mode</span>
                        <Badge className={getStatusColor(test.correctDetection)}>
                          {test.correctDetection ? 'Pass' : 'Fail'}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600">
                        <p><strong>Message:</strong> "{test.message}"</p>
                        <p><strong>Detected:</strong> {test.detectedMode}</p>
                        <p><strong>System Prompt:</strong> {test.systemPromptLength} chars</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Response Test */}
              {diagnostic.finalTestReply && (
                <>
                  <Separator />
                  <div>
                    <h3 className="text-lg font-semibold mb-3">AI Response Test</h3>
                    <div className="p-4 border rounded-lg bg-gray-50">
                      <p className="text-sm mb-2"><strong>GPT-4o Response:</strong></p>
                      <p className="italic">"{diagnostic.finalTestReply}"</p>
                    </div>
                  </div>
                </>
              )}

              {/* System Prompt Preview */}
              {diagnostic.systemPromptUsed && (
                <>
                  <Separator />
                  <div>
                    <h3 className="text-lg font-semibold mb-3">System Prompt Preview</h3>
                    <div className="p-4 border rounded-lg bg-gray-50">
                      <pre className="text-xs whitespace-pre-wrap">
                        {diagnostic.systemPromptUsed.substring(0, 200)}...
                      </pre>
                    </div>
                  </div>
                </>
              )}

              {/* Errors */}
              {diagnostic.errors.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-red-600">Errors</h3>
                    <div className="space-y-2">
                      {diagnostic.errors.map((error, index) => (
                        <div key={index} className="p-3 border border-red-200 rounded-lg bg-red-50">
                          <p className="text-red-800 text-sm">{error}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Hardcoded Messages Found */}
              {diagnostic.hardcodedMessagesFound.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-red-600">Hardcoded Messages Found</h3>
                    <div className="space-y-2">
                      {diagnostic.hardcodedMessagesFound.map((message, index) => (
                        <div key={index} className="p-3 border border-red-200 rounded-lg bg-red-50">
                          <p className="text-red-800 text-sm">"{message}"</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* API Endpoints Status */}
      <Card>
        <CardHeader>
          <CardTitle>API Endpoints</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              '/api/health',
              '/api/diagnostic', 
              '/api/messages',
              '/api/chat/send',
              '/api/user/stats',
              '/api/messages/history',
              '/api/sessions/new',
              '/api/sessions/list',
              '/api/sessions/delete',
              '/api/version'
            ].map((endpoint) => (
              <div key={endpoint} className="p-3 border rounded-lg">
                <code className="text-sm">{endpoint}</code>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BackendDiagnostic;