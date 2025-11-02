export interface ShoppingList {
  id: string;
  name: string;
  ingredients: string[];
  createdAt: Date;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (ingredients: string[], name?: string) => void;
  title: string;
  initialIngredients?: string[];
  initialName?: string;
  mode: "ingredients" | "edit";
}
