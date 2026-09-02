import type { ClubCode } from "./types";

// Universo de países por club (roster oficial). Se mantiene como constante
// porque la hoja "Universo_NAC/GMT/VR" usa celdas combinadas que rompen el
// export CSV; el roster cambia con muy poca frecuencia.
export const CLUB_ROSTERS: Record<ClubCode, string[]> = {
  NAC: [
    "ALEMANIA",
    "ITALIA",
    "FRANCIA",
    "INGLATERRA",
    "SUECIA",
    "HUNGRIA",
    "PORTUGAL",
    "ESPANA",
    "BELGICA",
    "HOLANDA",
    "CROACIA",
  ],
  GMT: [
    "JAPON",
    "TURQUIA",
    "CATAR",
    "GEORGIA",
    "SINGAPUR",
    "IRAN",
    "CHINA",
    "KUWAIT",
    "EMIRATOS ARABES",
    "MONGOLIA",
  ],
  VR: [
    "ARGENTINA",
    "COLOMBIA",
    "VENEZUELA",
    "BRASIL",
    "CANADA",
    "ESTADOS UNIDOS",
    "PUERTO RICO",
    "CHILE",
    "URUGUAY",
    "COSTA RICA",
  ],
};

export const CLUB_NAMES: Record<ClubCode, string> = {
  NAC: "Naciones Unidas",
  GMT: "Gourmetería",
  VR: "Valle Real",
};

export const CLUB_CODES: ClubCode[] = ["NAC", "GMT", "VR"];
