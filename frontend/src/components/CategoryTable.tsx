import { useState } from "react";
import { Category, useUpdateCategoryMutation, useDeleteCategoryMutation } from "@/graphql/generated/schema";

interface CategoryTableProps {
  categories: Category[];
  onRefetch: () => void;
}

export default function CategoryTable({ categories, onRefetch }: CategoryTableProps) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  const [validationError, setValidationError] = useState("");

  const [updateCategory] = useUpdateCategoryMutation();
  const [deleteCategory] = useDeleteCategoryMutation();

  const handleEdit = (category: Category) => {
    setEditingId(category.id);
    setEditValue(category.name);
  };

  const validateCategoryName = (name: string) => {
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      return "Le nom doit contenir au moins 2 caractères";
    }
    if (trimmed.length > 20) {
      return "Le nom ne peut pas dépasser 20 caractères";
    }
    return "";
  };

  const handleInputChange = (value: string) => {
    setEditValue(value);
    const error = validateCategoryName(value);
    setValidationError(error);
  };

  const handleSave = async () => {
    const trimmedValue = editValue.trim();
    const error = validateCategoryName(editValue);

    if (error) {
      setValidationError(error);
      return;
    }

    if (editingId && trimmedValue) {
      try {
        await updateCategory({
          variables: {
            updateCategoryId: editingId,
            data: { name: trimmedValue }
          }
        });
        onRefetch();
        setEditingId(null);
        setEditValue("");
        setValidationError("");
      } catch (error) {
        console.error("Erreur lors de la mise à jour de la catégorie :", error);
      }
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditValue("");
    setValidationError("");
  };

  const handleDelete = async (categoryId: number) => {
    if (confirm("Souhaitez-vous supprimer cette catégorie ?")) {
      try {
        await deleteCategory({ variables: { deleteCategoryId: categoryId } });
        onRefetch();
      } catch (error) {
        console.error("Erreur lors de la suppression de la catégorie :", error);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="table table-zebra w-full">
        <thead>
          <tr>
            <th>Nom de la Catégorie</th>
            <th className="w-48">Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category) => (
            <tr key={category.id}>
              <td>
                {editingId === category.id ? (
                  <div className="space-y-1">
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => handleInputChange(e.target.value)}
                      onKeyDown={handleKeyPress}
                      className={`input input-bordered input-sm w-full ${
                        validationError ? "input-error" : ""
                      }`}
                      autoFocus
                    />
                    {validationError && (
                      <div className="text-error text-xs">{validationError}</div>
                    )}
                  </div>
                ) : (
                  <span
                    className="cursor-pointer hover:bg-base-200 px-2 py-1 rounded"
                    onClick={() => handleEdit(category)}
                  >
                    {category.name}
                  </span>
                )}
              </td>
              <td>
                <div className="flex gap-2">
                  {editingId === category.id ? (
                    <>
                      <button
                        onClick={handleSave}
                        className="btn btn-success btn-xs"
                        disabled={!editValue.trim() || !!validationError}
                      >
                        Sauver
                      </button>
                      <button
                        onClick={handleCancel}
                        className="btn btn-ghost btn-xs"
                      >
                        Annuler
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleEdit(category)}
                        className="btn btn-primary btn-xs"
                      >
                        Éditer
                      </button>
                      <button
                        onClick={() => handleDelete(category.id)}
                        className="btn btn-error btn-xs"
                      >
                        Supprimer
                      </button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {categories.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          Aucune catégorie trouvée
        </div>
      )}
    </div>
  );
}