"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { ShoppingList } from "@/types";
import ShoppingListCard from "./ShoppingListCard";

interface CategorySectionProps {
  categoryName: string;
  lists: ShoppingList[];
  onEdit: (list: ShoppingList) => void;
  onDelete: (list: ShoppingList) => void;
  onAddIngredients: (list: ShoppingList) => void;
  onViewDetail: (list: ShoppingList) => void;
  onToggleDone: (list: ShoppingList) => void;
}

export default function CategorySection({
  categoryName,
  lists,
  onEdit,
  onDelete,
  onAddIngredients,
  onViewDetail,
  onToggleDone,
}: CategorySectionProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="mb-6">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center space-x-2 w-full text-left p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 mb-4"
      >
        {isExpanded ? (
          <ChevronDown className="w-5 h-5 text-gray-600" />
        ) : (
          <ChevronRight className="w-5 h-5 text-gray-600" />
        )}
        <h2 className="text-xl font-bold text-gray-800">{categoryName}</h2>
        <span className="text-sm text-gray-500 ml-auto">
          ({lists.length} {lists.length === 1 ? "seznam" : "seznamů"})
        </span>
      </button>

      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pl-4">
          {lists.map((list) => (
            <ShoppingListCard
              key={list.id}
              shoppingList={list}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddIngredients={onAddIngredients}
              onViewDetail={onViewDetail}
              onToggleDone={onToggleDone}
            />
          ))}
        </div>
      )}
    </div>
  );
}
