"use client";

import ErrorBoundary from "./ErrorBoundary";
import { Button } from "./ui/button";

interface PageErrorProps {
  error: Error;
  resetError: () => void;
}

function PageErrorFallback({ error, resetError }: PageErrorProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-10 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg border border-red-100 p-8">
        <div className="text-center">
          <div className="text-red-600 mb-6">
            <svg className="w-20 h-20 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Error en la aplicación
          </h1>
          
          <p className="text-gray-600 mb-8 leading-relaxed">
            Se produjo un error inesperado mientras procesábamos su solicitud. 
            El equipo técnico del HCD ha sido notificado automáticamente.
          </p>

          <div className="grid gap-3 sm:grid-cols-2 mb-6">
            <Button 
              onClick={resetError}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Intentar nuevamente
            </Button>
            <Button 
              onClick={() => window.history.back()}
              variant="outline"
              className="border-blue-200 text-blue-700 hover:bg-blue-50"
            >
              Volver atrás
            </Button>
          </div>

          <div className="text-center">
            <a 
              href="/" 
              className="text-blue-600 hover:text-blue-800 underline text-sm"
            >
              Ir al inicio
            </a>
          </div>

          {process.env.NODE_ENV === 'development' && (
            <details className="mt-8 text-left bg-gray-50 rounded-lg p-4">
              <summary className="cursor-pointer text-sm text-gray-700 font-medium mb-2">
                🔧 Información de desarrollo
              </summary>
              <div className="space-y-2">
                <div>
                  <strong className="text-xs text-red-600">Error:</strong>
                  <p className="text-sm text-gray-800 font-mono bg-white p-2 rounded border">
                    {error.message}
                  </p>
                </div>
                <div>
                  <strong className="text-xs text-red-600">Stack trace:</strong>
                  <pre className="text-xs bg-white p-2 rounded border overflow-auto max-h-40 text-gray-700">
                    {error.stack}
                  </pre>
                </div>
              </div>
            </details>
          )}
        </div>
      </div>
    </div>
  );
}

interface PageErrorBoundaryProps {
  children: React.ReactNode;
}

export default function PageErrorBoundary({ children }: PageErrorBoundaryProps) {
  return (
    <ErrorBoundary fallback={PageErrorFallback}>
      {children}
    </ErrorBoundary>
  );
}