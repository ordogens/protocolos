export type ProtocolId =
  | 'caminar'
  | 'rio'
  | 'motos'
  | 'comer'
  | 'acampar'
  | 'fiesta'
  | 'emocional';

export interface Activity {
  id: string;
  title: string;
  description: string;
  icon?: string;
  duration?: string; // ej. "1–2 horas"
}

export interface Protocol {
  id: ProtocolId;
  name: string;
  category: string;
  icon: string;
  color: string; // clase Tailwind o hex
  description: string;
  activities: Activity[]; // entre 4 y 6
}

export interface ScheduledProtocol {
  protocolId: ProtocolId;
  activityId?: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
}
