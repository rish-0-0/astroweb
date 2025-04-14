import {useEffect, useState} from 'preact/hooks';
import {astro} from "./core/Astro.ts";
import {useToast} from "./components/Toast/Toast.tsx";
import {BirthInput} from "./components/BirthInput/BirthInput.tsx";
import {Chart, ChartData} from "./components/Chart/Chart.tsx";
import './app.css';

export function App() {
  const {displayToast} = useToast();
  const [result, setResult] = useState<ChartData | null>();
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
  useEffect(() => {
    console.log(result);
  }, [result]);
  return (
    <div className="App">
        <h1 className="text-center">AstroWeb (WASM based - Swiss Ephemeris)</h1>
        <BirthInput onSubmitBirthInfo={(res) => setResult(JSON.parse(res) as ChartData)} />
        <div className="spacer" />
        {result && (<Chart chartData={result} />)}
    </div>
  )
}
