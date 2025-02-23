import { Text } from "react-native";
import React from "react";
import {
  AlertDialog,
  AlertDialogBackdrop,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogBody
} from "@/components/ui/alert-dialog";
import { useTheme } from "@/contexts/ThemeContext";
import { Button, ButtonText } from "./button";
type Props = {
  title: string;
  description?: string;
  show: boolean;
  handleClose: () => void;
};

const ErrorDialog = ({ title, description, show, handleClose }: Props) => {
  const { pallatte , mode } = useTheme();
  return (
    <>
      <AlertDialog isOpen={show} onClose={handleClose} size="md">
        <AlertDialogBackdrop />
        <AlertDialogContent
          style={{
            backgroundColor: mode == "light" ? "#f8fafc" : "#0F172A",
            borderWidth: 0
          }}
        >
          <AlertDialogHeader>
            <Text style={{ color: pallatte.text }} className="font-psemibold">
              {title}
            </Text>
          </AlertDialogHeader>
          <AlertDialogBody className="my-4">
            <Text style={{ color: pallatte.text }}>{description}</Text>
          </AlertDialogBody>
          <AlertDialogFooter className="mt-2">
            <Button style={{backgroundColor : pallatte.primary}} onPress={handleClose}>
              <ButtonText style={{color : pallatte.text}}>Okay</ButtonText>
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ErrorDialog;
