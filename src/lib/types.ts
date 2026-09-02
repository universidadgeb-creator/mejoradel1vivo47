export type ClubCode = "NAC" | "GMT" | "VR";

export interface Mejora {
  id: number;
  fecha: string; // ISO yyyy-mm-dd
  year: number;
  week: number;
  weekKey: string; // `${year}-${week padded}`
  weekLabel: string; // `S37 2026`
  monthKey: string; // `${year}-${month padded}`
  monthLabel: string; // `sep 2026`
  sucursal: string;
  club: ClubCode | null;
  equipo: string; // país tal cual viene del sheet
  equipoNorm: string; // normalizado (mayúsculas sin acentos) para matching
  nombre: string;
  oportunidad: string;
  explicacion: string;
  impacto: string;
  estado: string;
}

export interface DashboardData {
  mejoras: Mejora[];
  updatedAt: string;
  rowCount: number;
}

export interface Filters {
  club: ClubCode | "ALL";
  desde: string | null;
  hasta: string | null;
  weekKey: string | null;
  monthKey: string | null;
  year: number | null;
}
