"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "antd";
import esES from "antd/locale/es_ES";
import dayjs from "dayjs";
import Link from "next/link";
import { useParams } from "next/navigation";
import React, { useState, useEffect } from "react";

// Mapeo de orígenes a prefijos predefinidos
const ORIGEN_PREFIX_MAP: { [key: string]: string } = {
  "Todos por Las Flores": "FTxLF",
  "Adelante Juntos ": "AJ",
  "La Libertad Avanza": "LLA",
  "Departamento Ejecutivo": "DE",
  "Comunicaciones oficiales": "COF",
  "Parlamento Estudiantil": "PE",
  "Vecinos": "V"
}

export default function IngresarProyectoPage() {
  const params = useParams();
  const sesionId = params?.id;
  const defaultForm = {
    fechaEntrada: dayjs(),
    titulo: "",
    descripcion: "",
    origen: "",
    origenPersonalizado: "",
    prefijoOrigen: "",
    autor: "",
    tipo: "",
    tipoPersonalizado: "",
    archivo: null as File | null,
  };
  const [form, setForm] = useState(defaultForm);
  const [expedienteGenerado, setExpedienteGenerado] = useState<string>("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [blockMembers, setBlockMembers] = useState<any[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Lista de orígenes que son bloques políticos
  const BLOQUES_POLITICOS = [
    "Todos por Las Flores",
    "Adelante Juntos ", 
    "La Libertad Avanza"
  ];

  // Función para verificar si el origen es un bloque
  const isBloque = (origen: string) => BLOQUES_POLITICOS.includes(origen);

  // Función para cargar integrantes del bloque
  const loadBlockMembers = async (blockName: string) => {
    setLoadingMembers(true);
    try {
      const response = await fetch(`/api/blocks/members?block=${encodeURIComponent(blockName)}`);
      if (response.ok) {
        const data = await response.json();
        setBlockMembers(data.members || []);
      } else {
        setBlockMembers([]);
      }
    } catch (error) {
      console.error('Error loading block members:', error);
      setBlockMembers([]);
    } finally {
      setLoadingMembers(false);
    }
  };

  // Función para manejar el cambio de origen y actualizar automáticamente el prefijo
  const handleOrigenChange = (value: string) => {
    const prefijo = ORIGEN_PREFIX_MAP[value] || "";
    setForm((prev) => ({
      ...prev,
      origen: value,
      prefijoOrigen: prefijo,
      origenPersonalizado: "", // Limpiar el campo personalizado si cambia el origen
      autor: "" // Limpiar el autor al cambiar origen
    }));

    // Si es un bloque, cargar sus integrantes
    if (isBloque(value)) {
      loadBlockMembers(value);
    } else {
      // Si no es bloque, usar el propio origen como autor
      setBlockMembers([]);
      if (value !== "otros") {
        setForm((prev) => ({ ...prev, autor: value }));
      }
    }
  };

  const handleDateChange = (date: any) => {
    setForm((prev) => ({ ...prev, fechaEntrada: date && date.isValid() ? date : null }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setForm((prev) => ({ ...prev, archivo: file }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    // Validaciones básicas (sin numeroExpediente)
    const origenFinal = form.origen === "otros" ? form.origenPersonalizado : form.origen;
    const tipoFinal = form.tipo === "otro" ? form.tipoPersonalizado : form.tipo;
    const autorFinal = form.autor || origenFinal;

    if (!form.fechaEntrada || !form.titulo || !origenFinal || !form.prefijoOrigen || !tipoFinal || !autorFinal) {
      setError("Todos los campos obligatorios deben estar completos");
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("fechaEntrada", form.fechaEntrada.format("YYYY-MM-DD"));
      formData.append("titulo", form.titulo);
      formData.append("descripcion", form.descripcion);
      formData.append("origen", origenFinal);
      formData.append("prefijoOrigen", form.prefijoOrigen);
      formData.append("autor", autorFinal);
      formData.append("tipo", tipoFinal);

      if (form.archivo) {
        formData.append("archivo", form.archivo);
      }

      const response = await fetch(`/api/sessions/${sesionId}/files`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setSuccess(`Proyecto ingresado correctamente. Número de expediente: ${data.numeroExpediente}`);
        setExpedienteGenerado(data.numeroExpediente || "");
        setForm(defaultForm);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Error al ingresar el proyecto");
      }
    } catch (error) {
      console.error("Error al ingresar proyecto:", error);
      setError("Error al ingresar el proyecto");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-10 px-2 md:px-8">
      <div className="w-[90%] mx-auto bg-white rounded-2xl shadow-lg border border-blue-100 p-8">
        <h1 className="text-2xl md:text-3xl font-bold text-blue-900 mb-6 text-center">Ingresar proyecto</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <div className="bg-red-100 text-red-700 rounded p-2 text-center">{error}</div>}
          {success && <div className="bg-green-100 text-green-700 rounded p-2 text-center">{success}</div>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-blue-900 mb-1">N° de expediente</label>
              <Input value={expedienteGenerado || "(se asignará automáticamente)"} readOnly disabled className="bg-gray-100" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-blue-900 mb-1">Fecha de ingreso *</label>
              <DatePicker
                value={form.fechaEntrada}
                format="DD-MM-YYYY"
                locale={esES as any}
                onChange={handleDateChange}
                allowClear={false}
                style={{ width: '100%' }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-blue-900 mb-1">Prefijo origen *</label>
              <Input
                name="prefijoOrigen"
                value={form.prefijoOrigen}
                onChange={handleChange}
                placeholder="Ej: FTxLF"
                readOnly={form.origen !== "otros"}
                className={form.origen !== "otros" ? "bg-gray-100" : ""}
              />
              {form.origen !== "otros" && form.origen && (
                <div className="text-xs text-gray-500 mt-1">
                  Prefijo automático para {form.origen}
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-blue-900 mb-1">Origen *</label>
              <Select value={form.origen} onValueChange={handleOrigenChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar origen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todos por Las Flores">Todos por Las Flores</SelectItem>
                  <SelectItem value="Adelante Juntos ">Adelante Juntos</SelectItem>
                  <SelectItem value="La Libertad Avanza">La Libertad Avanza</SelectItem>
                  <SelectItem value="Departamento Ejecutivo">Departamento Ejecutivo</SelectItem>
                  <SelectItem value="Comunicaciones oficiales">Comunicaciones oficiales</SelectItem>
                  <SelectItem value="Parlamento Estudiantil">Parlamento Estudiantil</SelectItem>
                  <SelectItem value="Vecinos">Vecinos</SelectItem>
                  <SelectItem value="otros">Otros</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {form.origen === "otros" && (
            <div>
              <label className="block text-sm font-semibold text-blue-900 mb-1">Especificar origen</label>
              <Input
                name="origenPersonalizado"
                value={form.origenPersonalizado}
                onChange={handleChange}
                placeholder="Ingrese el origen"
              />
            </div>
          )}

          {/* Campo Autor dinámico */}
          <div>
            <label className="block text-sm font-semibold text-blue-900 mb-1">Autor *</label>
            {isBloque(form.origen) ? (
              // Si es un bloque, mostrar select de integrantes
              <Select 
                value={form.autor} 
                onValueChange={(value) => setForm(prev => ({ ...prev, autor: value }))}
                disabled={loadingMembers}
              >
                <SelectTrigger>
                  <SelectValue placeholder={loadingMembers ? "Cargando integrantes..." : "Seleccionar autor"} />
                </SelectTrigger>
                <SelectContent>
                  {blockMembers.map((member) => (
                    <SelectItem key={member.id} value={member.name}>
                      {member.name} {member.position && `- ${member.position}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : form.origen === "otros" ? (
              // Si es "otros", permitir escribir el autor
              <Input
                name="autor"
                value={form.autor}
                onChange={handleChange}
                placeholder="Ingrese el autor"
              />
            ) : (
              // Para otros orígenes (Departamento Ejecutivo, Vecinos, etc.), mostrar el origen como autor
              <Input
                value={form.autor || form.origen}
                readOnly
                className="bg-gray-100"
              />
            )}
            {isBloque(form.origen) && blockMembers.length === 0 && !loadingMembers && (
              <div className="text-xs text-gray-500 mt-1">
                No se encontraron integrantes para este bloque
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-blue-900 mb-1">Tipo *</label>
              <Select
                value={form.tipo}
                onValueChange={(value) => setForm(prev => ({ ...prev, tipo: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Proyecto de Ordenanza">Proyecto de Ordenanza</SelectItem>
                  <SelectItem value="Proyecto de Decreto">Proyecto de Decreto</SelectItem>
                  <SelectItem value="Proyecto de Resolucion">Proyecto de Resolución</SelectItem>
                  <SelectItem value="Proyecto de Comunicacion">Proyecto de Comunicación</SelectItem>
                  <SelectItem value="Nota">Nota</SelectItem>
                  <SelectItem value="otro">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-blue-900 mb-1">Título *</label>
              <Input name="titulo" value={form.titulo} onChange={handleChange} placeholder="Título del proyecto" />
            </div>
          </div>

          {form.tipo === "otro" && (
            <div>
              <label className="block text-sm font-semibold text-blue-900 mb-1">Especificar tipo</label>
              <Input
                name="tipoPersonalizado"
                value={form.tipoPersonalizado}
                onChange={handleChange}
                placeholder="Ingrese el tipo"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-blue-900 mb-1">Descripción (opcional)</label>
            <textarea name="descripcion" value={form.descripcion} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" rows={3} placeholder="Descripción del proyecto" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-blue-900 mb-1">Adjuntar archivo (PDF)</label>
            <Input type="file" accept="application/pdf" onChange={handleFileChange} />
            {form.archivo && <div className="text-xs text-gray-600 mt-1">Archivo seleccionado: {form.archivo.name}</div>}
          </div>

          <div className="flex justify-end gap-4">
            <Link href={`/mesa-entrada/${sesionId}`} className="px-6 py-2 rounded-lg bg-blue-100 text-blue-800 font-semibold shadow hover:bg-blue-200 transition">Volver</Link>
            <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={loading}>
              {loading ? "Guardando..." : "Ingresar proyecto"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}