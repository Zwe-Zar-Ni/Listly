import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, ButtonText } from "@/components/ui/button";
import {
  ArrowLeft,
  Edit,
  EllipsisVertical,
  Plus,
  Trash
} from "lucide-react-native";
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory
} from "@/db/categories";
import { FlatList, Text, TextInput, View } from "react-native";
import { Category } from "@/types/category";
import { useTheme } from "@/contexts/ThemeContext";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import ErrorDialog from "@/components/ui/error-dialog";
import {
  Drawer,
  DrawerBackdrop,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter
} from "@/components/ui/drawer";
import { Menu, MenuItem, MenuItemLabel } from "@/components/ui/menu";
const Categories = () => {
  const { pallatte, mode } = useTheme();

  const [categories, setCategories] = useState<Category[]>([]);
  const [cat, setCat] = useState({ show: false, id: 0, name: "" });
  const [editCat, setEditCat] = useState({
    show: false,
    id: 0,
    name: ""
  });

  const [error, setError] = useState({
    show: false,
    title: "",
    description: ""
  });

  const createCat = async () => {
    try {
      await createCategory(cat);
      const data = await getCategories();
      setCategories(data);
      setCat({
        name: "",
        id: 0,
        show: false
      });
    } catch (e) {
      setError({
        show: true,
        title: "Error creating category.",
        description: "Error creating category. Please try again"
      });
    }
  };
  const updateCat = async () => {
    try {
      await updateCategory(editCat.id, editCat);
      const data = await getCategories();
      setCategories(data);
      setEditCat({
        show: false,
        id: 0,
        name: ""
      });
    } catch (e) {
      setError({
        show: true,
        title: "Error updating category.",
        description: "Error updating category. Please try again"
      });
    }
  };
  const deleteCat = async (id: number) => {
    try {
      deleteCategory(id);
      const data = await getCategories();
      setCategories(data);
    } catch (e) {
      setError({
        show: true,
        title: "Error deleting category.",
        description: "Error deleting category. Please try again"
      });
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const data = await getCategories();
      setCategories(data);
    };
    fetchData();
  }, []);

  return (
    <SafeAreaView
      style={{ backgroundColor: pallatte.bg }}
      className="h-full p-2"
    >
      <ErrorDialog
        show={error.show}
        handleClose={() =>
          setError({ show: false, title: "", description: "" })
        }
        title={error.title}
        description={error.description}
      />
      <View className="flex flex-row items-center gap-2 mt-2">
        <ArrowLeft onPress={() => router.back()} color={pallatte.text} />
        <Text
          style={{ color: pallatte.text }}
          className="text-lg font-psemibold"
        >
          Manage Categories
        </Text>
      </View>
      <Text
        style={{ backgroundColor: pallatte.tint, color: pallatte.bold }}
        className="py-2 my-4 text-center rounded font-psemibold"
      >
        Categories display on Homepage
      </Text>
      {categories.length ? (
        <FlatList
          data={categories}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <>
              <View className="flex flex-row items-center justify-center gap-4 py-2">
                <Button
                  // style={{ backgroundColor: pallatte.tint }}
                  className={`flex-grow text-start flex flex-row justify-start bg-transparent`}
                  onPress={async () => {
                    await updateCategory(item.id, {
                      ...item,
                      name: `${item.name}`
                    });
                    const data = await getCategories();
                    setCategories(data);
                  }}
                >
                  <ButtonText style={{ color: pallatte.text }}>
                    {item.name}
                  </ButtonText>
                </Button>

                <Menu
                  placement="bottom right"
                  offset={0}
                  style={{
                    backgroundColor: mode == "light" ? "#f8fafc" : "#0F172A",
                    borderWidth: 0
                  }}
                  trigger={({ ...triggerProps }) => {
                    return (
                      <Button className="bg-transparent" {...triggerProps}>
                        <EllipsisVertical size={20} color={pallatte.text} />
                      </Button>
                    );
                  }}
                >
                  <MenuItem
                    className="flex flex-row gap-3 hover:bg-transparent"
                    key="Edit"
                    textValue="Edit"
                    onPress={() => {
                      setEditCat({
                        show: true,
                        id: item.id,
                        name: item.name
                      });
                    }}
                  >
                    <Edit size="18" color={pallatte.text} />
                    <MenuItemLabel style={{ color: pallatte.text }}>
                      Edit
                    </MenuItemLabel>
                  </MenuItem>
                  <MenuItem
                    className="flex flex-row gap-3"
                    key="Delete"
                    textValue="Delete"
                    onPress={() => deleteCat(item.id)}
                  >
                    <Trash size="18" color={pallatte.text} />
                    <MenuItemLabel style={{ color: pallatte.text }}>
                      Delete
                    </MenuItemLabel>
                  </MenuItem>
                </Menu>
              </View>
            </>
          )}
        />
      ) : null}

      {/* Create button */}
      <Button
        style={{ borderWidth: 1, borderColor: pallatte.primary }}
        className={`bg-transparent mb-2`}
        onPress={() => setCat({ ...cat, show: true })}
      >
        <Plus color={pallatte.primary} size={20} />
        <ButtonText
          className="text-lg font-psemibold"
          style={{ color: pallatte.primary }}
        >
          Create New
        </ButtonText>
      </Button>

      {/* Create dialog */}
      <Drawer
        isOpen={cat.show}
        onClose={() => setCat({ show: false, id: 0, name: "" })}
        anchor="bottom"
        style={{
          backgroundColor: mode == "light" ? "#f8fafc" : "#0F172A",
          borderWidth: 0
        }}
      >
        <DrawerBackdrop />
        <DrawerContent
          style={{
            backgroundColor: mode == "light" ? "#f8fafc" : "#0F172A",
            borderWidth: 0
          }}
        >
          <DrawerHeader>
            <Text
              className="text-xl font-pbold"
              style={{ color: pallatte.primary }}
            >
              Create Category
            </Text>
          </DrawerHeader>
          <DrawerBody>
            <TextInput
              className="py-3 px-2 mx-0.5 rounded border-0 caret-[#94a3b8] bg-slate-300"
              style={{ borderColor: pallatte.tint }}
              placeholder="Category name"
              value={cat.name}
              onChangeText={(e) => setCat({ ...cat, name: e })}
            />
          </DrawerBody>
          <DrawerFooter>
            <Button
              onPress={createCat}
              size="lg"
              style={{ backgroundColor: pallatte.primary }}
            >
              <ButtonText style={{ color: pallatte.text }}>Create</ButtonText>
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* Edit dialog */}
      <Drawer
        isOpen={editCat.show}
        onClose={() => setEditCat({ show: false, id: 0, name: "" })}
        anchor="bottom"
        style={{
          backgroundColor: mode == "light" ? "#f8fafc" : "#0F172A",
          borderWidth: 0
        }}
      >
        <DrawerBackdrop />
        <DrawerContent
          style={{
            backgroundColor: mode == "light" ? "#f8fafc" : "#0F172A",
            borderWidth: 0
          }}
        >
          <DrawerHeader>
            <Text
              className="text-xl font-pbold"
              style={{ color: pallatte.primary }}
            >
              Edit Category
            </Text>
          </DrawerHeader>
          <DrawerBody>
            <TextInput
              className="py-3 px-2 mx-0.5 border rounded caret-[#94a3b8] placeholder:bg-slate-300"
              style={{ borderColor: pallatte.tint }}
              placeholder="Category name"
              value={editCat.name}
              onChangeText={(e) => setEditCat({ ...editCat, name: e })}
            />
          </DrawerBody>
          <DrawerFooter>
            <Button
              onPress={updateCat}
              size="lg"
              style={{ backgroundColor: pallatte.primary }}
            >
              <ButtonText style={{ color: pallatte.text }}>Update</ButtonText>
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      <StatusBar style="light" backgroundColor={pallatte.bg} />
    </SafeAreaView>
  );
};

export default Categories;
