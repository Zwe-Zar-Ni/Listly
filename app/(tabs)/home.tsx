import React, { useCallback, useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useTheme } from "@/contexts/ThemeContext";
import Navbar from "@/components/layout/Navbar";
import { getPreviousTasks, getTasks } from "@/db/tasks";
import { Task } from "@/types/task";
import { FlatList, Text } from "react-native";
import { Button, ButtonText } from "@/components/ui/button";
import { Plus } from "lucide-react-native";
import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper
} from "@/components/ui/action-sheet";
import CreateTask from "@/components/tasks/CreateTask";
import TaskCard from "@/components/tasks/TaskCard";
import { useFocusEffect } from "expo-router";

const Home = () => {
  const { pallatte } = useTheme();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [futureTasks, setFutureTasks] = useState<Task[]>([]);
  const [previousTasks, setPreviousTasks] = useState<Task[]>([]);
  const [fetchedPrevious, setFetchedPrevious] = useState(false);
  const [creating, setCreating] = useState(false);

  const fetchData = async () => {
    const { todayTasks, futureTasks } = await getTasks();
    setTasks(todayTasks);
    setFutureTasks(futureTasks);
  };

  const fetchPreviousTasks = useCallback(async () => {
    setFetchedPrevious(true);
    const tks = await getPreviousTasks();
    setPreviousTasks(tks);
  }, []);

  const refresh = async () => {
    await fetchData();
    if (fetchedPrevious) {
      await fetchPreviousTasks();
    }
  };

  const createSuccess = () => {
    setCreating(false);
    fetchData();
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  return (
    <SafeAreaView
      className="h-full px-2"
      style={{ backgroundColor: pallatte.bg }}
    >
      <Navbar />
      {tasks.length || futureTasks.length || previousTasks.length ? (
        <>
          <Text
            style={{ color: pallatte.text }}
            className="mt-2 text-lg font-pbold"
          >
            Today Tasks
          </Text>
          <FlatList
            data={tasks}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item, index }) => (
              <>
                <TaskCard refresh={refresh} index={index} task={item} />
              </>
            )}
            ListFooterComponent={
              <>
                <Text
                  style={{ color: pallatte.text }}
                  className="mt-8 text-lg font-pbold"
                >
                  Future Tasks
                </Text>
                <FlatList
                  data={futureTasks}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={({ item, index }) => (
                    <>
                      <TaskCard index={index} refresh={refresh} task={item} />
                    </>
                  )}
                  ListFooterComponent={
                    <>
                      {previousTasks.length ? (
                        <FlatList
                          data={previousTasks}
                          keyExtractor={(item) => item.id.toString()}
                          renderItem={({ item, index }) => (
                            <>
                              <TaskCard
                                index={index}
                                refresh={refresh}
                                task={item}
                              />
                            </>
                          )}
                          ListHeaderComponent={
                            <Text
                              style={{ color: pallatte.text }}
                              className="mt-8 text-lg font-pbold"
                            >
                              Previous Tasks
                            </Text>
                          }
                        />
                      ) : fetchedPrevious ? (
                        <Text
                          className="mt-16 text-center"
                          style={{ color: pallatte.text }}
                        >
                          No Previous tasks found.
                        </Text>
                      ) : (
                        <Button
                          onPress={fetchPreviousTasks}
                          className="mt-8 bg-transparent"
                        >
                          <ButtonText
                            style={{ color: pallatte.text }}
                            className="underline"
                          >
                            View Previous Tasks
                          </ButtonText>
                        </Button>
                      )}
                    </>
                  }
                />
              </>
            }
          />
        </>
      ) : (
        <>
          <Text style={{ color: pallatte.text }} className="py-4 text-center">
            No tasks.
          </Text>
          {fetchedPrevious && !previousTasks.length ? (
            <Text
              style={{ color: pallatte.text }}
              className="mt-16 text-center"
            >
              No Previous tasks found.
            </Text>
          ) : (
            <Button
              onPress={fetchPreviousTasks}
              className="mt-16 bg-transparent"
            >
              <ButtonText
                style={{ color: pallatte.text }}
                className="underline"
              >
                View Previous Tasks
              </ButtonText>
            </Button>
          )}
        </>
      )}
      <Button
        onPress={() => setCreating(true)}
        style={{ backgroundColor: pallatte.primary }}
        className="w-[54px] h-[54px] rounded-full absolute bottom-8 right-8"
      >
        <Plus size={32} color={"white"} />
      </Button>
      <Actionsheet isOpen={creating} onClose={() => setCreating(false)}>
        <ActionsheetBackdrop />
        <ActionsheetContent
          style={{ backgroundColor: pallatte.bg, borderWidth: 0 }}
        >
          <ActionsheetDragIndicatorWrapper>
            <ActionsheetDragIndicator />
          </ActionsheetDragIndicatorWrapper>
          <CreateTask
            success={createSuccess}
            closeSheet={() => setCreating(false)}
          />
        </ActionsheetContent>
      </Actionsheet>
      <StatusBar style="light" backgroundColor={pallatte.bg} />
    </SafeAreaView>
  );
};

export default Home;
