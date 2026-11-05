// NativeWind needs this outside the file that registers the root component, which is main.tsx.
import "./global.css";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider } from "react-redux";
import { AppStore } from "../state/store";
import { GluestackUIProvider } from "./gluestack/gluestack-ui-provider";
import { Screens } from "./Screens";

export function App({ store }: { store: AppStore }) {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <GluestackUIProvider mode="dark">
          <Screens />
        </GluestackUIProvider>
      </SafeAreaProvider>
    </Provider>
  );
}
