import AnimatedNumber from './AnimatedNumber';

type Variable = {
  label: string;
  value: string | number | boolean | null;
  highlight?: boolean;
};

type Counter = {
  label: string;
  value: number;
};

type Props = {
  code: string[];
  activeLines: number[];
  variables?: Variable[];
  counters?: Counter[];
  variableLabels?: string[];
  counterLabels?: string[];
  dataStructure?: {
    label: string;
    items: string[];
  };
  dataStructureLabel?: string;
  explanation?: string;
  isComplete?: boolean;
};

export default function DebugPanel({
  code,
  activeLines,
  variables,
  counters,
  variableLabels,
  counterLabels,
  dataStructure,
  dataStructureLabel,
  explanation,
  isComplete,
}: Props) {
  // Always show variable section if we have labels or values
  const showVars = (variables && variables.length > 0) || (variableLabels && variableLabels.length > 0);
  const displayVars = variables && variables.length > 0
    ? variables
    : (variableLabels ?? []).map((label) => ({ label, value: null as string | number | boolean | null, highlight: false }));

  // Always show counters if we have labels or values
  const showCounters = (counters && counters.length > 0) || (counterLabels && counterLabels.length > 0);
  const displayCounters = counters && counters.length > 0
    ? counters
    : (counterLabels ?? []).map((label) => ({ label, value: 0 }));

  // Always show data structure if we have a label
  const showDs = dataStructure || dataStructureLabel;
  const dsLabel = dataStructure?.label ?? dataStructureLabel ?? '';
  const dsItems = dataStructure?.items ?? [];

  return (
    <div className="debug-panel">
      <div className="debug-code">
        {code.map((line, i) => (
          <div
            key={i}
            className={`debug-line ${activeLines.includes(i) ? 'active' : ''}`}
          >
            <span className="debug-lineno">{i + 1}</span>
            <span className="debug-text">{line}</span>
          </div>
        ))}
      </div>

      {showVars && (
        <div className="debug-vars">
          <div className="debug-section-title">Variables</div>
          <div className="debug-var-grid">
            {displayVars.map((v, i) => (
              <div
                key={i}
                className={`debug-var ${v.highlight ? 'highlight' : ''}`}
              >
                <span className="debug-var-label">{v.label}</span>
                <span className="debug-var-value">
                  {v.value === null ? '\u2014' : String(v.value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {showDs && (
        <div className="debug-ds">
          <div className="debug-section-title">{dsLabel}</div>
          <div className="debug-ds-items">
            {dsItems.length === 0 ? (
              <span className="debug-ds-empty">empty</span>
            ) : (
              dsItems.map((item, i) => (
                <span key={i} className="debug-ds-item">
                  {item}
                </span>
              ))
            )}
          </div>
        </div>
      )}

      {showCounters && (
        <div className="debug-counters">
          {displayCounters.map((c, i) => (
            <div key={i} className="debug-counter">
              <span className="debug-counter-value"><AnimatedNumber value={c.value} /></span>
              <span className="debug-counter-label">{c.label}</span>
            </div>
          ))}
        </div>
      )}

      <div className={`debug-explanation ${!explanation ? 'empty' : ''}${isComplete ? ' done' : ''}`}>
        {explanation || 'Hit Play or Step to begin'}
      </div>
    </div>
  );
}
