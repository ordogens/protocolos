import { type ProtocolId } from '@/types';

export const useProtocols = () => {
  const isMobile = () => window.innerWidth <= 768;
  const getProtocolColor = (id: ProtocolId): string => {
    const colors: Record<ProtocolId, string> = {
      caminar: 'text-green-600 bg-green-50 border-green-100',
      rio: 'text-blue-600 bg-blue-50 border-blue-100',
      motos: 'text-orange-600 bg-orange-50 border-orange-100',
      comer: 'text-red-600 bg-red-50 border-red-100',
      acampar: 'text-yellow-600 bg-yellow-50 border-yellow-100',
      fiesta: 'text-purple-600 bg-purple-50 border-purple-100',
      emocional: 'text-indigo-600 bg-indigo-50 border-indigo-100',
    };
    return colors[id] ?? colors.emocional;
  };

  return { isMobile, getProtocolColor };
};
