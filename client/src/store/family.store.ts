import { create } from 'zustand';

interface FamilyState {
  selectedFamilyId: string | null;
  setSelectedFamily: (id: string | null) => void;
}

export const useFamilyStore = create<FamilyState>((set) => ({
  selectedFamilyId: null,
  setSelectedFamily: (id) => set({ selectedFamilyId: id }),
}));
