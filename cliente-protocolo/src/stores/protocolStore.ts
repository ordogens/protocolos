import { create } from 'zustand';
import { type Protocol, type Activity, type ProtocolId } from '@/types';
import { protocols as initialProtocols } from '@/data/protocols';

interface ProtocolState {
  protocols: Protocol[];
  activeProtocol: Protocol | null;
  selectedActivity: Activity | null;
  setProtocols: (protocols: Protocol[]) => void;
  setActiveProtocol: (id: ProtocolId) => void;
  setSelectedActivity: (activity: Activity | null) => void;
}

export const useProtocolStore = create<ProtocolState>((set) => ({
  protocols: initialProtocols,
  activeProtocol: null,
  selectedActivity: null,
  setProtocols: (protocols) => set({ protocols }),
  setActiveProtocol: (id) =>
    set((state) => ({
      activeProtocol: state.protocols.find((p) => p.id === id) ?? null,
    })),
  setSelectedActivity: (activity) => set({ selectedActivity: activity }),
}));
