"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { ShoppingCart, Wifi, WifiOff, Database } from "lucide-react";
import ShoppingListCard from "@/components/ShoppingListCard";
import CategorySection from "@/components/CategorySection";
import Modal from "@/components/Modal";
import ConfirmDialog from "@/components/ConfirmDialog";
import { ShoppingList } from "@/types";
import {
  shoppingListService,
  ConnectionStatus,
} from "@/services/shoppingListService";

export default function ShoppingListsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [shoppingLists, setShoppingLists] = useState<ShoppingList[]>([]);
  const [newListName, setNewListName] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingList, setEditingList] = useState<ShoppingList | null>(null);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMode, setModalMode] = useState<"ingredients" | "edit">(
    "ingredients"
  );
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [listToDelete, setListToDelete] = useState<ShoppingList | null>(null);
  const [newListCategory, setNewListCategory] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus | null>(null);

  const loadShoppingLists = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setConnectionStatus(shoppingListService.getConnectionStatus());
      const lists = await shoppingListService.getAllShoppingLists();
      setShoppingLists(lists);
      setConnectionStatus(shoppingListService.getConnectionStatus());
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Nepodařilo se načíst data"
      );
      console.error("Failed to load shopping lists:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadShoppingLists();
  }, [pathname]);

  useEffect(() => {
    const handleFocus = () => {
      loadShoppingLists();
    };

    window.addEventListener("focus", handleFocus);

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadShoppingLists();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    if (shoppingLists.length > 0) {
      localStorage.setItem("shoppingLists", JSON.stringify(shoppingLists));
    } else {
      const savedLists = localStorage.getItem("shoppingLists");
      if (savedLists) {
        localStorage.removeItem("shoppingLists");
      }
    }
  }, [shoppingLists]);

  const createShoppingList = () => {
    if (newListName.trim() && newListCategory.trim()) {
      const newList: ShoppingList = {
        id: Date.now().toString(),
        name: newListName.trim(),
        category: newListCategory.trim(),
        ingredients: [],
      };
      setShoppingLists([...shoppingLists, newList]);
      setNewListName("");
      setNewListCategory("");
    }
  };

  const groupedLists = shoppingLists.reduce(
    (acc, list) => {
      if (!acc[list.category]) {
        acc[list.category] = [];
      }
      acc[list.category].push(list);
      return acc;
    },
    {} as Record<string, ShoppingList[]>
  );

  const existingCategories = Array.from(
    new Set(shoppingLists.map((list) => list.category))
  );

  const handleDeleteClick = (list: ShoppingList) => {
    setListToDelete(list);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (listToDelete) {
      setShoppingLists(
        shoppingLists.filter((list) => list.id !== listToDelete.id)
      );
      setListToDelete(null);
    }
    setIsDeleteDialogOpen(false);
  };

  const cancelDelete = () => {
    setListToDelete(null);
    setIsDeleteDialogOpen(false);
  };

  const openIngredientsModal = (list: ShoppingList) => {
    setEditingList(list);
    setModalTitle(`spravovat ingredience - ${list.name}`);
    setModalMode("ingredients");
    setIsModalOpen(true);
  };

  const openEditModal = (list: ShoppingList) => {
    setEditingList(list);
    setModalTitle(`upravit nákupní seznam - ${list.name}`);
    setModalMode("edit");
    setIsModalOpen(true);
  };

  const saveChanges = (ingredients: string[], name?: string) => {
    if (editingList) {
      setShoppingLists(
        shoppingLists.map((list) =>
          list.id === editingList.id
            ? {
                ...list,
                ingredients,
                ...(name && { name: name.trim() }),
              }
            : list
        )
      );
    }
    setEditingList(null);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingList(null);
    setModalTitle("");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Vytvořit nový nákupní seznam
          </h2>
          <div className="space-y-4">
            <div className="flex gap-4">
              <input
                type="text"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && createShoppingList()}
                placeholder="zadejte název seznamu..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="flex-1">
                <input
                  type="text"
                  value={newListCategory}
                  onChange={(e) => setNewListCategory(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && createShoppingList()}
                  placeholder="zadejte kategorii (např. běžné věci, akce)..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  list="categories"
                />
                <datalist id="categories">
                  {existingCategories.map((category) => (
                    <option key={category} value={category} />
                  ))}
                </datalist>
              </div>
              <button
                onClick={createShoppingList}
                disabled={!newListName.trim() || !newListCategory.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
              >
                vytvořit
              </button>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Všechny nákupní seznamy ({shoppingLists.length})
          </h2>

          {shoppingLists.length === 0 ? (
            <div className="text-center py-12">
              <div className="flex justify-center mb-4">
                <ShoppingCart className="w-16 h-16 text-gray-400" />
              </div>
              <h3 className="text-xl font-medium text-gray-600 mb-2">
                Zatím žádné nákupní seznamy
              </h3>
              <p className="text-gray-500">
                Vytvořte svůj první nákupní seznam!
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedLists).map(([category, lists]) => (
                <CategorySection
                  key={category}
                  categoryName={category}
                  lists={lists}
                  onEdit={openEditModal}
                  onDelete={handleDeleteClick}
                  onAddIngredients={openIngredientsModal}
                  onViewDetail={(list) =>
                    router.push(`/shopping-list/${list.id}`)
                  }
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSave={saveChanges}
        title={modalTitle}
        initialIngredients={editingList?.ingredients || []}
        initialName={editingList?.name || ""}
        mode={modalMode}
      />

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        title="smazat nákupní seznam"
        message={`opravdu chcete smazat "${listToDelete?.name}"? tuto akci nelze vrátit zpět.`}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        confirmText="smazat"
        cancelText="zrušit"
      />
    </div>
  );
}
