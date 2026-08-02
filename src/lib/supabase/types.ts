export type RolPerfil = "admin" | "consultor" | "comercial" | "lectura";

export type Cliente = {
  id: string;
  nombre: string;
  razon_social: string | null;
  rut: string | null;
  email: string | null;
  telefono: string | null;
  direccion: string | null;
  comuna: string | null;
  region: string | null;
  created_at: string;
  updated_at: string;
};

export type EstadoProyecto =
  | "Ingreso"
  | "En evaluación"
  | "Calificado"
  | "Rechazado"
  | "Desistido";

export type Proyecto = {
  id: string;
  nombre_proyecto: string;
  cliente_id: string | null;
  web: string | null;
  tipo_presentacion: "DIA" | "EIA" | "SEA" | "SEIA" | "VIA" | null;
  region: string | null;
  comuna: string | null;
  provincia: string | null;
  tipo_proyecto: string | null;
  razon_ingreso: string | null;
  inversion_mmus: number | null;
  fecha_presentacion: string | null;
  estado_proyecto: EstadoProyecto | null;
  fecha_calificacion: string | null;
  sector_productivo: string | null;
  latitud: number | null;
  longitud: number | null;
  created_at: string;
  updated_at: string;
};

export type Perfil = {
  id: string;
  nombre: string;
  email: string;
  rol: RolPerfil;
  activo: boolean;
};

export type TipoDocumento =
  | "Declaración de Impacto Ambiental"
  | "Estudio de Impacto Ambiental"
  | "Adenda"
  | "Resolución"
  | "Informe"
  | "Otro";

export type Documento = {
  id: string;
  proyecto_id: string;
  nombre_archivo: string;
  ruta_storage: string;
  tipo_documento: TipoDocumento | null;
  usuario_id: string;
  fecha_subida: string;
};

export type Observacion = {
  id: string;
  proyecto_id: string;
  usuario_id: string;
  comentario: string;
  fecha: string;
};

export type EstadoOportunidad =
  | "Prospecto"
  | "Contactado"
  | "En negociación"
  | "Propuesta enviada"
  | "Ganada"
  | "Perdida";

export type Oportunidad = {
  id: string;
  cliente_id: string | null;
  nombre: string;
  descripcion: string | null;
  monto_estimado: number | null;
  estado: EstadoOportunidad;
  fecha_cierre_estimada: string | null;
  created_at: string;
  updated_at: string;
};

export type EstadoHito =
  | "Pendiente"
  | "En progreso"
  | "Completado"
  | "Vencido"
  | "Cancelado";

export type Hito = {
  id: string;
  proyecto_id: string;
  nombre: string;
  descripcion: string | null;
  fecha_compromiso: string | null;
  estado: EstadoHito;
  created_at: string;
  updated_at: string;
};

export type Alerta = {
  id: string;
  proyecto_id: string;
  titulo: string;
  descripcion: string | null;
  fecha_alerta: string;
  leida: boolean;
};

export type EstadoStaging =
  | "Pendiente"
  | "Validado"
  | "Importado"
  | "Rechazado";

export type StagingProyecto = {
  id: string;
  nombre_proyecto: string | null;
  web: string | null;
  tipo_presentacion: string | null;
  region: string | null;
  comuna: string | null;
  provincia: string | null;
  tipo_proyecto: string | null;
  inversion_mmus: number | null;
  fecha_presentacion: string | null;
  estado_proyecto: string | null;
  sector_productivo: string | null;
  estado_importacion: EstadoStaging;
  created_at: string;
};

export type ProyectoWithDetails = Proyecto & {
  clientes: Pick<Cliente, "id" | "nombre"> | null;
  hitos: Hito[];
  alertas: Alerta[];
};

export type ObservacionWithPerfil = Observacion & {
  perfiles: Pick<Perfil, "id" | "nombre" | "email" | "rol"> | null;
};

export interface Database {
  public: {
    Tables: {
      clientes: {
        Row: Cliente;
        Insert: Partial<Cliente> & Pick<Cliente, "nombre">;
        Update: Partial<Cliente>;
        Relationships: [];
      };
      proyectos: {
        Row: Proyecto;
        Insert: Partial<Proyecto> & Pick<Proyecto, "nombre_proyecto">;
        Update: Partial<Proyecto>;
        Relationships: [
          {
            foreignKeyName: "proyectos_cliente_id_fkey";
            columns: ["cliente_id"];
            referencedRelation: "clientes";
            referencedColumns: ["id"];
          },
        ];
      };
      perfiles: {
        Row: Perfil;
        Insert: Partial<Perfil> & Pick<Perfil, "id" | "nombre" | "email">;
        Update: Partial<Perfil>;
        Relationships: [];
      };
      documentos: {
        Row: Documento;
        Insert: Partial<Documento> &
          Pick<
            Documento,
            "proyecto_id" | "nombre_archivo" | "ruta_storage" | "usuario_id"
          >;
        Update: Partial<Documento>;
        Relationships: [
          {
            foreignKeyName: "documentos_proyecto_id_fkey";
            columns: ["proyecto_id"];
            referencedRelation: "proyectos";
            referencedColumns: ["id"];
          },
        ];
      };
      observaciones: {
        Row: Observacion;
        Insert: Partial<Observacion> &
          Pick<Observacion, "proyecto_id" | "usuario_id" | "comentario">;
        Update: Partial<Observacion>;
        Relationships: [
          {
            foreignKeyName: "observaciones_proyecto_id_fkey";
            columns: ["proyecto_id"];
            referencedRelation: "proyectos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "observaciones_usuario_id_fkey";
            columns: ["usuario_id"];
            referencedRelation: "perfiles";
            referencedColumns: ["id"];
          },
        ];
      };
      oportunidades: {
        Row: Oportunidad;
        Insert: Partial<Oportunidad> & Pick<Oportunidad, "nombre" | "estado">;
        Update: Partial<Oportunidad>;
        Relationships: [
          {
            foreignKeyName: "oportunidades_cliente_id_fkey";
            columns: ["cliente_id"];
            referencedRelation: "clientes";
            referencedColumns: ["id"];
          },
        ];
      };
      hitos: {
        Row: Hito;
        Insert: Partial<Hito> & Pick<Hito, "proyecto_id" | "nombre" | "estado">;
        Update: Partial<Hito>;
        Relationships: [
          {
            foreignKeyName: "hitos_proyecto_id_fkey";
            columns: ["proyecto_id"];
            referencedRelation: "proyectos";
            referencedColumns: ["id"];
          },
        ];
      };
      alertas: {
        Row: Alerta;
        Insert: Partial<Alerta> &
          Pick<Alerta, "proyecto_id" | "titulo" | "fecha_alerta" | "leida">;
        Update: Partial<Alerta>;
        Relationships: [
          {
            foreignKeyName: "alertas_proyecto_id_fkey";
            columns: ["proyecto_id"];
            referencedRelation: "proyectos";
            referencedColumns: ["id"];
          },
        ];
      };
      staging_proyectos: {
        Row: StagingProyecto;
        Insert: Partial<StagingProyecto>;
        Update: Partial<StagingProyecto>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
