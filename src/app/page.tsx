"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShoppingBag,
  Wifi,
  WifiOff,
  Database,
} from "lucide-react";

import Modal from "@/components/Modal";
import ConfirmDialog from "@/components/ConfirmDialog";
import { ShoppingList } from "@/types";
import {
  shoppingListService,
  ConnectionStatus,
} from "@/services/shoppingListService";

export default function Home() {
  const router = useRouter();

  const [allShoppingLists, setAllShoppingLists] = useState<ShoppingList[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus | null>(null);

  const [newListName, setNewListName] = useState("");
  const [newListCategory, setNewListCategory] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingList, setEditingList] = useState<ShoppingList | null>(null);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMode, setModalMode] = useState<"ingredients" | "edit">(
    "ingredients"
  );
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [listToDelete, setListToDelete] = useState<ShoppingList | null>(null);

  useEffect(() => {
    const loadShoppingLists = async () => {
      try {
        setIsLoading(true);
        setError(null);
        setConnectionStatus(shoppingListService.getConnectionStatus());
        const lists = await shoppingListService.getAllShoppingLists();
        setAllShoppingLists(lists);
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

    loadShoppingLists();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setConnectionStatus(shoppingListService.getConnectionStatus());
    }, 5000);

    return () => clearInterval(interval);
  }, []);


    // Filter shopping lists created on home page - todo:
  const homeShoppingLists = allShoppingLists.filter(
    (list) => list.createdOnHome === true
  );

  const createShoppingList = async () => {
    if (!newListName.trim()) return;

    try {
      setError(null);
      const newList = await shoppingListService.createShoppingList({
        name: newListName.trim(),
        category: newListCategory.trim() || "Obecné",
        ingredients: [],
        createdOnHome: true,
      });

      setAllShoppingLists([...allShoppingLists, newList]);
      setNewListName("");
      setNewListCategory("");
      setConnectionStatus(shoppingListService.getConnectionStatus());
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Nepodařilo se vytvořit seznam"
      );
      console.error("Failed to create shopping list:", err);
    }
  };

  const handleDeleteClick = (list: ShoppingList) => {
    setListToDelete(list);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!listToDelete) return;

    try {
      setError(null);
      await shoppingListService.deleteShoppingList(listToDelete.id);
      setAllShoppingLists(
        allShoppingLists.filter((list) => list.id !== listToDelete.id)
      );
      setConnectionStatus(shoppingListService.getConnectionStatus());
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Nepodařilo se smazat seznam"
      );
      console.error("Failed to delete shopping list:", err);
    } finally {
      setListToDelete(null);
      setIsDeleteDialogOpen(false);
    }
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

  const saveChanges = async (ingredients: string[], name?: string) => {
    if (!editingList) return;

    try {
      setError(null);

      if (name && name.trim() !== editingList.name) {
        await shoppingListService.updateShoppingList(editingList.id, {
          name: name.trim(),
        });
      }

      setAllShoppingLists(
        allShoppingLists.map((list) =>
          list.id === editingList.id
            ? {
                ...list,
                ingredients,
                ...(name && { name: name.trim() }),
              }
            : list
        )
      );

      setConnectionStatus(shoppingListService.getConnectionStatus());
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Nepodařilo se uložit změny"
      );
      console.error("Failed to save changes:", err);
    } finally {
      setEditingList(null);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingList(null);
    setModalTitle("");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="bg-blue-100 p-4 rounded-full">
              <ShoppingBag className="w-12 h-12 text-blue-600" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Nákupní seznamy
          </h1>

          <p className="text-lg text-gray-600 mb-4">
            Vytvořte nákupní seznamy pro okamžité použití
          </p>

          <div className="flex items-center justify-center gap-2 text-sm">
            {connectionStatus ? (
              connectionStatus.usingMock ? (
                <>
                  <Database className="w-4 h-4 text-orange-600" />
                  <span className="text-orange-700">
                    Offline režim (Mock data)
                  </span>
                </>
              ) : connectionStatus.isOnline ? (
                <>
                  <Wifi className="w-4 h-4 text-green-600" />
                  <span className="text-green-700">Připojeno k serveru</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-4 h-4 text-red-600" />
                  <span className="text-red-700">Server nedostupný</span>
                </>
              )
            ) : (
              <span className="text-gray-500">Načítání...</span>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-600 rounded-full flex-shrink-0"></div>
              <p className="text-red-800 font-medium">Chyba</p>
            </div>
            <p className="text-red-700 mt-1">{error}</p>
            <button
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-800 text-sm mt-2 underline"
            >
              Zavřít
            </button>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Vytvořit nákupní seznam
          </h2>
          <div className="space-y-4">
            <div className="flex gap-4">
              <input
                type="text"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && createShoppingList()}
                placeholder="Zadejte název seznamu..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
              />
              <div className="flex-1">
                <input
                  type="text"
                  value={newListCategory}
                  onChange={(e) => setNewListCategory(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && createShoppingList()}
                  placeholder="Zadejte kategorii (volitelné)..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isLoading}
                />
              </div>
              <button
                onClick={createShoppingList}
                disabled={!newListName.trim() || isLoading}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {isLoading ? "Načítání..." : "Vytvořit"}
              </button>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-green-100 p-4 rounded-full">
                <ShoppingBag className="w-16 h-16 text-green-600" />
              </div>
            </div>

            {isLoading ? (
              <div className="py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Načítání nákupních seznamů...</p>
              </div>
            ) : (
              <>
                <h2 className="text-3xl font-bold text-gray-800 mb-6">
                  {allShoppingLists.length === 0
                    ? "Zatím žádné nákupní seznamy"
                    : `${allShoppingLists.length} ${
                        allShoppingLists.length === 1
                          ? "nákupní seznam"
                          : allShoppingLists.length < 5
                            ? "nákupní seznamy"
                            : "nákupních seznamů"
                      }`}
                </h2>

                <Link
                  href="/shopping-lists"
                  className="inline-flex items-center px-8 py-4 bg-blue-600 text-white font-medium text-lg rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
                >
                  <ShoppingBag className="w-6 h-6 mr-3" />
                  {allShoppingLists.length === 0
                    ? "Vytvořit první seznam"
                    : "Zobrazit všechny seznamy"}
                </Link>
              </>
            )}
          </div>
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
        title="Smazat nákupní seznam"
        message={`opravdu chcete smazat "${listToDelete?.name}"? tuto akci nelze vrátit zpět.`}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        confirmText="smazat"
        cancelText="zrušit"
      />
    </div>
  );
}
