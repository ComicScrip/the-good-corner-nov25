import { useState } from "react";
import { type Tag, useDeleteTagMutation, useUpdateTagMutation } from "@/graphql/generated/schema";

interface TagTableProps {
  tags: Tag[];
  onRefetch: () => void;
}

export default function TagTable({ tags, onRefetch }: TagTableProps) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  const [validationError, setValidationError] = useState("");

  const [updateTag] = useUpdateTagMutation();
  const [deleteTag] = useDeleteTagMutation();

  const handleEdit = (tag: Tag) => {
    setEditingId(tag.id);
    setEditValue(tag.name);
  };

  const validateTagName = (name: string) => {
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
    const error = validateTagName(value);
    setValidationError(error);
  };

  const handleSave = async () => {
    const trimmedValue = editValue.trim();
    const error = validateTagName(editValue);

    if (error) {
      setValidationError(error);
      return;
    }

    if (editingId && trimmedValue) {
      try {
        await updateTag({
          variables: {
            updateTagId: editingId,
            data: { name: trimmedValue },
          },
        });
        onRefetch();
        setEditingId(null);
        setEditValue("");
        setValidationError("");
      } catch (error) {
        console.error("Erreur lors de la mise à jour du tag :", error);
      }
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditValue("");
    setValidationError("");
  };

  const handleDelete = async (tagId: number) => {
    if (confirm("Souhaitez-vous supprimer ce tag ?")) {
      try {
        await deleteTag({ variables: { deleteTagId: tagId } });
        onRefetch();
      } catch (error) {
        console.error("Erreur lors de la suppression du tag :", error);
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
            <th>Nom du Tag</th>
            <th className="w-48">Actions</th>
          </tr>
        </thead>
        <tbody>
          {tags.map((tag) => (
            <tr key={tag.id}>
              <td>
                {editingId === tag.id ? (
                  <div className="space-y-1">
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => handleInputChange(e.target.value)}
                      onKeyDown={handleKeyPress}
                      className={`input input-bordered input-sm w-full ${
                        validationError ? "input-error" : ""
                      }`}
                    />
                    {validationError && <div className="text-error text-xs">{validationError}</div>}
                  </div>
                ) : (
                  <button
                    type="button"
                    className="text-left cursor-pointer hover:bg-base-200 px-2 py-1 rounded bg-transparent border-none"
                    onClick={() => handleEdit(tag)}
                  >
                    {tag.name}
                  </button>
                )}
              </td>
              <td>
                <div className="flex gap-2">
                  {editingId === tag.id ? (
                    <>
                      <button
                        type="button"
                        onClick={handleSave}
                        className="btn btn-success btn-xs"
                        disabled={!editValue.trim() || !!validationError}
                      >
                        Sauver
                      </button>
                      <button type="button" onClick={handleCancel} className="btn btn-ghost btn-xs">
                        Annuler
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => handleEdit(tag)}
                        className="btn btn-primary btn-xs"
                      >
                        Éditer
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(tag.id)}
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
      {tags.length === 0 && <div className="text-center py-8 text-gray-500">Aucun tag trouvé</div>}
    </div>
  );
}
