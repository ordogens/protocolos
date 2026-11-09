import walk from '../assets/protocol-walk.jpg';
import river from '../assets/protocol-river.jpg';
import motorcycle from '../assets/protocol-motorcycle.jpg';
import food from '../assets/protocol-food.jpg';
import camping from '../assets/protocol-camping.jpg';
import party from '../assets/protocol-party.jpg';
import emotional from '../assets/protocol-emotional.jpg';
import type { ProtocolId } from '../types';

export const protocolImages: Record<ProtocolId, string> = {
  caminar: walk,
  rio: river,
  motos: motorcycle,
  comer: food,
  acampar: camping,
  fiesta: emotional,
  emocional: party,
};
