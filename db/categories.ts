import { Category } from "@/types/category";
import db from "./database";

export const createCategory = async (category: Category) => {
  try {
    const result = await db.runAsync(
      "INSERT INTO categories (name) VALUES (?)",
      category.name,
    );
    return {
      name: category.name,
      id: result.lastInsertRowId
    };
  } catch(e) {
    throw new Error('Failed to create category.')
  }
};

export const getCategories = async () => {
    const categories : Category[] = await db.getAllAsync('SELECT * FROM categories');
    return categories;
}

export const updateCategory = async (id : number , category : Category) => {
    await db.runAsync('UPDATE categories SET name = ? WHERE id = ?', category.name , id);
    return id;
}

export const deleteCategory = async (id : number) => {
    await db.runAsync('DELETE FROM categories WHERE id = $id', { $id: id });
    return id;
}