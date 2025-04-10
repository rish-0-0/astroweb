import {useEffect} from 'preact/hooks';
import {astro} from "./core/Astro.ts";
import {useToast} from "./components/Toast/Toast.tsx";

export function App() {
  const {displayToast} = useToast();
  useEffect(() => {
    displayToast('info', 'Initiating AstroWeb');
    astro.preloadWebAssemblyModule((err) => {
      if (err) {
        displayToast('error', 'Failed to load AstroWeb: ' + err);
      }
      // on preloaded
      displayToast('success', 'AstroWeb successfully loaded');
    });
  }, []);
  return (
    <div>
      <h1>Hello</h1>
    </div>
  )
}
