import { registerRootComponent } from "expo";
import { createUseCases } from "./composition-root";
import { createAppStore } from "./infrastructure/driving/state/store";
import { App } from "./infrastructure/driving/ui/App";

const store = createAppStore(createUseCases());

function Root() {
  return <App store={store} />;
}

registerRootComponent(Root);
