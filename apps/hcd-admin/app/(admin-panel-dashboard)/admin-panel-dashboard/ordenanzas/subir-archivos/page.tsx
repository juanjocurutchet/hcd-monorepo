"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface UploadStats {
  total: number;
  with_files: number;
  without_files: number;
  by_year: Array<{
    year: number;
    total: number;
    with_files: number;
  }>;
}

interface UploadResult {
  ordinanceId: number;
  approvalNumber: number;
  fileName: string;
  status: 'success' | 'error' | 'not_found' | 'already_uploaded';
  url?: string;
  error?: string;
}

export default function SubirArchivosPage() {
  const [stats, setStats] = useState<UploadStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<UploadResult[]>([]);
  const [uploadYear, setUploadYear] = useState<string>("");
  const [uploadLimit, setUploadLimit] = useState<number>(10);
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/ordinances/upload-files");
      if (response.ok) {
        const data = await response.json();
        setStats(data.statistics);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const uploadFiles = async (dryRun = false) => {
    setLoading(true);
    setMessage("");
    setResults([]);

    try {
      const payload: any = {
        limit: uploadLimit,
        skipExisting: true,
        dryRun
      };

      if (uploadYear) {
        payload.year = parseInt(uploadYear);
      }

      const response = await fetch("/api/ordinances/upload-files", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (data.success || data.dryRun) {
        if (data.dryRun) {
          setMessage(`Vista previa: Se procesarían ${data.ordinances.length} ordenanzas`);
          setResults(data.ordinances.map((o: any) => ({
            ordinanceId: o.id,
            approvalNumber: o.approval_number,
            fileName: `Ordenanza ${o.approval_number} - ${o.title}`,
            status: 'success' as const
          })));
        } else {
          setMessage(`Subida completada: ${data.summary.success} éxitos, ${data.summary.errors} errores, ${data.summary.not_found} no encontrados`);
          setResults(data.results);
          // Refrescar estadísticas
          fetchStats();
        }
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch (error) {
      setMessage(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const getYearsWithoutFiles = () => {
    if (!stats) return [];
    return stats.by_year
      .filter(year => year.total > year.with_files)
      .sort((a, b) => b.year - a.year);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">📁 Subir Archivos de Ordenanzas</h1>

      {/* Estadísticas */}
      <Card className="p-4 mb-6">
        <h2 className="text-xl font-semibold mb-3">📊 Estado Actual</h2>
        {stats ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-900">{stats.total}</div>
              <div className="text-blue-600">Total Ordenanzas</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-900">{stats.with_files}</div>
              <div className="text-green-600">Con Archivos</div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-orange-900">{stats.without_files}</div>
              <div className="text-orange-600">Sin Archivos</div>
            </div>
          </div>
        ) : (
          <div className="text-gray-500">Cargando estadísticas...</div>
        )}
      </Card>

      {/* Años con archivos faltantes */}
      <Card className="p-4 mb-6">
        <h2 className="text-xl font-semibold mb-3">📋 Años con Archivos Faltantes</h2>
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {getYearsWithoutFiles().map(year => (
              <div 
                key={year.year} 
                className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg"
              >
                <div className="font-bold text-yellow-900">{year.year}</div>
                <div className="text-sm text-yellow-700">
                  {year.total - year.with_files} de {year.total} faltantes
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-2 w-full text-xs"
                  onClick={() => setUploadYear(year.year.toString())}
                >
                  Seleccionar
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Controles de subida */}
      <Card className="p-4 mb-6">
        <h2 className="text-xl font-semibold mb-3">⬆️ Subir Archivos</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-2">Año (opcional)</label>
            <Input
              type="number"
              placeholder="2025"
              value={uploadYear}
              onChange={(e) => setUploadYear(e.target.value)}
            />
            <div className="text-xs text-gray-500 mt-1">
              Dejar vacío para todos los años
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Límite por lote</label>
            <Input
              type="number"
              min="1"
              max="50"
              value={uploadLimit}
              onChange={(e) => setUploadLimit(parseInt(e.target.value) || 10)}
            />
            <div className="text-xs text-gray-500 mt-1">
              Máximo recomendado: 20
            </div>
          </div>
          
          <div className="flex items-end gap-2">
            <Button
              onClick={() => uploadFiles(true)}
              disabled={loading}
              variant="outline"
              className="flex-1"
            >
              👁️ Vista Previa
            </Button>
            <Button
              onClick={() => uploadFiles(false)}
              disabled={loading}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {loading ? "⏳ Subiendo..." : "⬆️ Subir"}
            </Button>
          </div>
        </div>

        <div className="bg-blue-50 p-3 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-2">ℹ️ Información</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Los archivos se buscan en <code>/home/juan/Downloads/Concejo/</code></li>
            <li>• Se suben a Cloudinary con URLs permanentes</li>
            <li>• Solo se procesan ordenanzas sin archivo existente</li>
            <li>• La subida puede tomar varios segundos por archivo</li>
          </ul>
        </div>
      </Card>

      {/* Resultados */}
      {message && (
        <Card className="p-4 mb-6">
          <div className={`p-3 rounded ${
            message.includes('Error') ? 'bg-red-100 text-red-800' : 
            message.includes('Vista previa') ? 'bg-blue-100 text-blue-800' :
            'bg-green-100 text-green-800'
          }`}>
            {message}
          </div>
        </Card>
      )}

      {results.length > 0 && (
        <Card className="p-4">
          <h2 className="text-xl font-semibold mb-3">📄 Resultados</h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {results.map((result, index) => (
              <div 
                key={index} 
                className={`p-3 rounded-lg border ${
                  result.status === 'success' ? 'bg-green-50 border-green-200' :
                  result.status === 'error' ? 'bg-red-50 border-red-200' :
                  result.status === 'not_found' ? 'bg-yellow-50 border-yellow-200' :
                  'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="font-medium">
                      Ordenanza {result.approvalNumber}
                    </div>
                    <div className="text-sm text-gray-600">
                      {result.fileName}
                    </div>
                    {result.error && (
                      <div className="text-sm text-red-600 mt-1">
                        {result.error}
                      </div>
                    )}
                  </div>
                  <div className="ml-4">
                    {result.status === 'success' && result.url && (
                      <a 
                        href={result.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        📄 Ver archivo
                      </a>
                    )}
                    <div className={`text-xs font-medium ${
                      result.status === 'success' ? 'text-green-600' :
                      result.status === 'error' ? 'text-red-600' :
                      result.status === 'not_found' ? 'text-yellow-600' :
                      'text-gray-600'
                    }`}>
                      {result.status === 'success' ? '✅ Subido' :
                       result.status === 'error' ? '❌ Error' :
                       result.status === 'not_found' ? '⚠️ No encontrado' :
                       '➡️ Procesando'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Guía rápida */}
      <Card className="p-4 mt-6 bg-gray-50">
        <h3 className="font-semibold text-gray-800 mb-2">🚀 Guía Rápida</h3>
        <ol className="text-sm text-gray-700 space-y-1">
          <li><strong>1.</strong> Revisa las estadísticas para ver cuántos archivos faltan</li>
          <li><strong>2.</strong> Selecciona un año específico o deja vacío para todos</li>
          <li><strong>3.</strong> Usa "Vista Previa" para ver qué se procesaría</li>
          <li><strong>4.</strong> Haz clic en "Subir" para ejecutar la subida real</li>
          <li><strong>5.</strong> Repite el proceso hasta completar todos los archivos</li>
        </ol>
      </Card>
    </div>
  );
}