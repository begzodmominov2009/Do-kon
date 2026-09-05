import { create } from "zustand";
import { persist } from "zustand/middleware";

type FavoritesState = {
  ids: string[];
  toggle: (id: string) => void;
  has: (id: string) => boolean;
};

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      ids: [],
      toggle: (id) => {
        const ids = get().ids;
        set({
          ids: ids.includes(id)
            ? ids.filter((existing) => existing !== id)
            : [...ids, id],
        });
      },
      has: (id) => get().ids.includes(id),
    }),
    { name: "favorites-storage" },
  ),
);
