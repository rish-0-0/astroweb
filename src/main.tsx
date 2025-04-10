import { render } from 'preact';
import { App } from './app.tsx';
import {ToastProvider} from './components/Toast/Toast.tsx'

render(
    <ToastProvider>
        <App />
    </ToastProvider>, document.getElementById('app')!);