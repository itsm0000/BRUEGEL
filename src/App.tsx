import { MainScene } from '~features/world/MainScene';
import ErrorBoundary from '~components/ui/ErrorBoundary';
import { A11yAnnouncer } from '~components/a11y/A11yAnnouncer';

function App() {
    return (
        <>
            <A11yAnnouncer />
            <ErrorBoundary>
                <MainScene />
            </ErrorBoundary>
        </>
    );
}

export default App;
