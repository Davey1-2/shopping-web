"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShoppingBag, ShoppingCart } from "lucide-react";
import ShoppingListCard from "@/components/ShoppingListCard";
import Modal from "@/components/Modal";
import ConfirmDialog from "@/components/ConfirmDialog";
import { ShoppingList } from "@/types";
import { DEFAULT_SHOPPING_LISTS } from "@/constants/defaultData";

export default function Home() {
  const router = useRouter();
  const [allShoppingLists, setAllShoppingLists] = useState<ShoppingList[]>([]);
  const [newListName, setNewListName] = useState("");
  const [newListCategory, setNewListCategory] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingList, setEditingList] = useState<ShoppingList | null>(null);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMode, setModalMode] = useState<"ingredients" | "edit">("ingredients");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [listToDelete, setListToDelete] = useState<ShoppingList | null>(null);

  useEffect(() => {
    const savedLists = localStorage.getItem("shoppingLists");
    if (savedLists) {
      try {
        const parsedLists = JSON.parse(savedLists);
        setAllShoppingLists(parsedLists);
      } catch (error) {
        console.error("Error loading shopping lists:", error);
        setAllShoppingLists(DEFAULT_SHOPPING_LISTS);
      }
    } else {
      setAllShoppingLists(DEFAULT_SHOPPING_LISTS);
    }
  }, []);

  useEffect(() => {
    console.log("Saving to localStorage:", allShoppingLists);
    localStorage.setItem("shoppingLists", JSON.stringify(allShoppingLists));
  }, [allShoppingLists]);

  const homeShoppingLists = allShoppingLists.filter(list => list.createdOnHome === true);

  const createShoppingList = () => {
    if (newListName.trim() && newListCategory.trim()) {
      const newList: ShoppingList = {
        id: Date.now().toString(),
        name: newListName.trim(),
        category: newListCategory.trim(),
        ingredients: [],
        createdOnHome: true,
      };
      
      setAllShoppingLists([...allShoppingLists, newList]);
      setNewListName("");
      setNewListCategory("");
    }
  };

  const handleDeleteClick = (list: ShoppingList) => {
    setListToDelete(list);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (listToDelete) {
      setAllShoppingLists(allShoppingLists.filter((list) => list.id !== listToDelete.id));
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
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="bg-blue-100 p-4 rounded-full">
              <ShoppingBag className="w-12 h-12 text-blue-600" />
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Nákupní seznamy
          </h1>
          
          <p className="text-lg text-gray-600 mb-8">
            Vytvořte nákupní seznamy pro okamžité použití
          </p>
        </div>

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
              />
              <div className="flex-1">
                <input
                  type="text"
                  value={newListCategory}
                  onChange={(e) => setNewListCategory(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && createShoppingList()}
                  placeholder="Zadejte kategorii..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={createShoppingList}
                disabled={!newListName.trim() || !newListCategory.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
              >
                Vytvořit
              </button>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Vaše nákupní seznamy ({homeShoppingLists.length})
          </h2>

          {homeShoppingLists.length === 0 ? (
            <div className="text-center py-12">
              <div className="flex justify-center mb-4">
                <ShoppingCart className="w-16 h-16 text-gray-400" />
              </div>
              <h3 className="text-xl font-medium text-gray-600 mb-2">
                Zatím žádné nákupní seznamy
              </h3>
              <Link
                href="/shopping-lists"
                className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
              >
                <ShoppingBag className="w-5 h-5 mr-2" />
                Zobrazit všechny nákupní seznamy
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {homeShoppingLists.map((list) => (
                  <ShoppingListCard
                    key={list.id}
                    shoppingList={list}
                    onEdit={openEditModal}
                    onDelete={handleDeleteClick}
                    onAddIngredients={openIngredientsModal}
                    onViewDetail={(list) => router.push(`/shopping-list/${list.id}`)}
                  />
                ))}
              </div>
              <div className="text-center mt-8">
                <Link
                  href="/shopping-lists"
                  className="inline-flex items-center px-6 py-3 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <ShoppingBag className="w-5 h-5 mr-2" />
                  Zobrazit všechny seznamy
                </Link>
              </div>
            </>
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
