import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import './App.css';
import { registry } from './registry';
import SortingVisualizer from './visualizers/sorting/SortingVisualizer';
import PathfindingVisualizer from './visualizers/pathfinding/PathfindingVisualizer';
import TreeVisualizer from './visualizers/tree/TreeVisualizer';
import KadaneVisualizer from './visualizers/kadane/KadaneVisualizer';
import FloydVisualizer from './visualizers/floyd/FloydVisualizer';
import MinSubarrayVisualizer from './visualizers/minsubarray/MinSubarrayVisualizer';
import JumpGameVisualizer from './visualizers/jumpgame/JumpGameVisualizer';

const visualizerComponents: Record<string, React.FC> = {
  sorting: SortingVisualizer,
  pathfinding: PathfindingVisualizer,
  tree: TreeVisualizer,
  kadane: KadaneVisualizer,
  floyd: FloydVisualizer,
  'jump-game': JumpGameVisualizer,
  'min-subarray': MinSubarrayVisualizer,
};

function App() {
  const [activeViz, setActiveViz] = useState<string | null>(null);

  const ActiveComponent = activeViz ? visualizerComponents[activeViz] : null;

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1>Alight</h1>
          <p>see algorithms think</p>
        </div>
        <nav className="sidebar-nav">
          {registry.map((category) => (
            <div key={category.id} className="nav-section">
              <div className="nav-section-title">{category.label}</div>
              {category.items.map((item) => (
                <button
                  key={item.id}
                  className={`nav-item ${activeViz === item.id ? 'active' : ''}`}
                  onClick={() => setActiveViz(item.id)}
                >
                  <span className="nav-icon">{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </div>
          ))}
        </nav>
      </aside>

      <main className="main-content">
        <div className="visualizer-area">
          <AnimatePresence mode="wait">
            {ActiveComponent ? (
              <motion.div
                key={activeViz}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                style={{ height: '100%' }}
              >
                <ActiveComponent />
              </motion.div>
            ) : (
              <motion.div
                key="welcome"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
              >
                <div className="welcome">
                  <div className="welcome-hero">
                    <h1>Alight</h1>
                    <p className="welcome-tagline">see algorithms think</p>
                    <p className="welcome-sub">
                      Step through classic algorithms one operation at a time.
                      Watch the code, variables, and visualization update together.
                    </p>
                  </div>
                  <div className="feature-grid">
                    {registry.map((cat) => (
                      <div key={cat.id} className="feature-card">
                        <div className="feature-card-header">
                          <h3>{cat.label}</h3>
                          <span className="feature-card-count">
                            {cat.items.length} {cat.items.length === 1 ? 'algo' : 'algos'}
                          </span>
                        </div>
                        <p className="feature-card-desc">{cat.description}</p>
                        <div className="feature-card-items">
                          {cat.items.map((item) => (
                            <button
                              key={item.id}
                              className="feature-card-item"
                              onClick={() => setActiveViz(item.id)}
                            >
                              <span className="feature-card-icon">{item.icon}</span>
                              {item.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

export default App;
