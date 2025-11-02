"use client";

import { useState, useEffect } from "react";
import { ShoppingCart } from "lucide-react";
import Navbar from "@/components/Navbar";
import ShoppingListCard from "@/components/ShoppingListCard";
import Modal from "@/components/Modal";
import { ShoppingList } from "@/types";

export default function Home() {
  const [shoppingLists, setShoppingLists] = useState<ShoppingList[]>([]);
  const [newListName, setNewListName] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingList, setEditingList] = useState<ShoppingList | null>(null);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMode, setModalMode] = useState<"ingredients" | "edit">(
    "ingredients"
  );

  useEffect(() => {
    const savedLists = localStorage.getItem("shoppingLists");
    if (savedLists && shoppingLists.length === 0) {
      try {
        const parsedLists = JSON.parse(savedLists);
        const listsWithDates = parsedLists.map(
          (list: Omit<ShoppingList, "createdAt"> & { createdAt: string }) => ({
            ...list,
            createdAt: new Date(list.createdAt),
          })
        );
        setShoppingLists(listsWithDates);
      } catch (error) {
        console.error("Error loading shopping lists from localStorage:", error);
      }
    }
  }, [shoppingLists.length]);

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
    if (newListName.trim()) {
      const newList: ShoppingList = {
        id: Date.now().toString(),
        name: newListName.trim(),
        ingredients: [],
        createdAt: new Date(),
      };
      setShoppingLists([...shoppingLists, newList]);
      setNewListName("");
    }
  };

  const deleteShoppingList = (id: string) => {
    setShoppingLists(shoppingLists.filter((list) => list.id !== id));
  };

  const openIngredientsModal = (list: ShoppingList) => {
    setEditingList(list);
    setModalTitle(`Manage Ingredients - ${list.name}`);
    setModalMode("ingredients");
    setIsModalOpen(true);
  };

  const openEditModal = (list: ShoppingList) => {
    setEditingList(list);
    setModalTitle(`Edit Shopping List - ${list.name}`);
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
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Create New Shopping List
          </h2>
          <div className="flex gap-4">
            <input
              type="text"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && createShoppingList()}
              placeholder="Enter shopping list name..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={createShoppingList}
              disabled={!newListName.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
            >
              Create
            </button>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Your Shopping Lists ({shoppingLists.length})
          </h2>

          {shoppingLists.length === 0 ? (
            <div className="text-center py-12">
              <div className="flex justify-center mb-4">
                <ShoppingCart className="w-16 h-16 text-gray-400" />
              </div>
              <h3 className="text-xl font-medium text-gray-600 mb-2">
                No shopping lists yet
              </h3>
              <p className="text-gray-500">
                Create your first shopping list to get started!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {shoppingLists.map((list) => (
                <ShoppingListCard
                  key={list.id}
                  shoppingList={list}
                  onEdit={openEditModal}
                  onDelete={deleteShoppingList}
                  onAddIngredients={openIngredientsModal}
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
    </div>
  );
}
