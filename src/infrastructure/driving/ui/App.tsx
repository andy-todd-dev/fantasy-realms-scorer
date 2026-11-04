import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider } from "react-redux";
import { AppStore } from "../state/store";
import { Screens } from "./Screens";

export function App({ store }: { store: AppStore }) {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <Screens />
      </SafeAreaProvider>
    </Provider>
  );
}
