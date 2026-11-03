import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider } from "react-redux";
import { AppStore } from "../state/store";
import { CardSelectionScreen } from "./CardSelectionScreen";

export function App({ store }: { store: AppStore }) {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <CardSelectionScreen />
      </SafeAreaProvider>
    </Provider>
  );
}
