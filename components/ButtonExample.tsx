import { Camera } from "lucide-react-native";
import { Button, ButtonText } from "./ui/button";

const ButtonExample = () => {
  return (
    <Button className="my-2 bg-primary-500" size="xl" variant="solid">
      <Camera size={24} color={"#f1f5f9"} />
      <ButtonText className="text-slate-100">Hello World</ButtonText>
    </Button>
  );
};

export default ButtonExample;
