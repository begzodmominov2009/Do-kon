import { create } from "zustand";
import { persist } from "zustand/middleware";

type FavoritesState = {
  ids: string[];
  addedAt: Record<string, number>;
  toggle: (id: string) => void;
  has: (id: string) => boolean;
};

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      ids: [],
      addedAt: {},
      toggle: (id) => {
        const { ids, addedAt } = get();
        if (ids.includes(id)) {
          const nextAddedAt = { ...addedAt };
          delete nextAddedAt[id];
          set({
            ids: ids.filter((existing) => existing !== id),
            addedAt: nextAddedAt,
          });
        } else {
          set({
            ids: [...ids, id],
            addedAt: { ...addedAt, [id]: Date.now() },
          });
        }
      },
      has: (id) => get().ids.includes(id),
    }),
    { name: "favorites-storage" },
  ),
);
