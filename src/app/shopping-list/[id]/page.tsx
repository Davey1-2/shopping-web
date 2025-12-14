"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Edit2, Trash2, Plus } from "lucide-react";
import { ShoppingList } from "@/types";
import { DEFAULT_SHOPPING_LISTS } from "@/constants/defaultData";
import Modal from "@/components/Modal";
import ConfirmDialog from "@/components/ConfirmDialog";

export default function ShoppingListDetail() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [shoppingList, setShoppingList] = useState<ShoppingList | null>(null);
  const [allLists, setAllLists] = useState<ShoppingList[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    const savedLists = localStorage.getItem("shoppingLists");
    let lists: ShoppingList[] = [];

    if (savedLists) {
      try {
        const parsedLists = JSON.parse(savedLists);
        lists = parsedLists;
      } catch (error) {
        console.error("Error loading shopping lists:", error);
        lists = DEFAULT_SHOPPING_LISTS;
      }
    } else {
      lists = DEFAULT_SHOPPING_LISTS;
    }

    setAllLists(lists);
    const foundList = lists.find((list) => list.id === id);
    setShoppingList(foundList || null);
  }, [id]);

  const handleSaveIngredients = (ingredients: string[]) => {
    if (!shoppingList) return;

    const updatedList = { ...shoppingList, ingredients };
    const updatedLists = allLists.map((list) =>
      list.id === id ? updatedList : list,
    );

    setAllLists(updatedLists);
    setShoppingList(updatedList);
    localStorage.setItem("shoppingLists", JSON.stringify(updatedLists));
  };

  const handleDeleteList = () => {
    const updatedLists = allLists.filter((list) => list.id !== id);
    setAllLists(updatedLists);
    localStorage.setItem("shoppingLists", JSON.stringify(updatedLists));
    router.push("/");
  };

  if (!shoppingList) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Nákupní seznam nenalezen
          </h1>
          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Zpět na nákupní seznamy
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-blue-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push("/")}
                className="flex items-center space-x-2 hover:bg-blue-700 px-3 py-2 rounded-md transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>zpět</span>
              </button>
              <h1 className="text-xl font-bold">{shoppingList.name}</h1>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center space-x-2 bg-green-500 hover:bg-green-600 px-3 py-2 rounded-md transition-colors"
              >
                <Edit2 className="w-4 h-4" />
                <span>Upravit ingredience</span>
              </button>
              <button
                onClick={() => setIsDeleteDialogOpen(true)}
                className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 px-3 py-2 rounded-md transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Smazat seznam</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Ingredience
            </h2>
            <p className="text-gray-600">
              celkem: {shoppingList.ingredients.length} položek
            </p>
          </div>

          {shoppingList.ingredients.length === 0 ? (
            <div className="text-center py-12">
              <Plus className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-600 mb-2">
                Zatím žádné ingredience
              </h3>
              <p className="text-gray-500 mb-4">Přidejte nějaké ingredience!</p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
              >
                Přidat ingredience
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {shoppingList.ingredients.map((ingredient, index) => (
                <div
                  key={index}
                  className="bg-gray-50 p-4 rounded-lg border border-gray-200"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-gray-800 font-medium">
                      {ingredient}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex justify-center items-center text-sm text-gray-500">
              <span>
                Naposledy aktualizováno: {new Date().toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </main>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveIngredients}
        title={`upravit ingredience - ${shoppingList.name}`}
        initialIngredients={shoppingList.ingredients}
        mode="ingredients"
      />

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        title="Smazat nákupní seznam"
        message={`Opravdu chcete smazat "${shoppingList.name}"? tuto akci nelze vrátit zpět.`}
        onConfirm={handleDeleteList}
        onCancel={() => setIsDeleteDialogOpen(false)}
        confirmText="Smazat"
        cancelText="Zrušit"
      />
    </div>
  );
}
