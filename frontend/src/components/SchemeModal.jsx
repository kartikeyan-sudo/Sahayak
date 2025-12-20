import './SchemeModal.css';
import { useEffect, useRef } from 'react';

function SchemeModal({ scheme, onClose }) {
  const closeRef = useRef(null);

  useEffect(() => {
    // focus close button for accessibility
    if (closeRef.current) closeRef.current.focus();
  }, []);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{scheme.name}</h2>
          <button ref={closeRef} className="modal-close" onClick={onClose} aria-label="Close modal">✕</button>
        </div>

        <div className="modal-body" tabIndex={0}>
          <section className="modal-section">
            <h3>📋 Objectives</h3>
            <ul>
              {scheme.objectives.map((obj, idx) => (
                <li key={idx}>{obj}</li>
              ))}
            </ul>
          </section>

          <section className="modal-section">
            <h3>📝 Application Process</h3>
            <div className="process-steps">
              {scheme.process.map((step) => (
                <div key={step.step} className="process-step">
                  <div className="step-number">{step.step}</div>
                  <div className="step-description">{step.description}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="modal-section">
            <h3>📄 Required Documents</h3>
            <ul>
              {scheme.requiredDocuments.map((doc, idx) => (
                <li key={idx}>{doc}</li>
              ))}
            </ul>
          </section>

          <section className="modal-section">
            <h3>✓ Eligibility Criteria</h3>
            <ul>
              {scheme.eligibility.map((criteria, idx) => (
                <li key={idx}>{criteria}</li>
              ))}
            </ul>
          </section>

          <div className="dos-donts-grid">
            <section className="modal-section dos">
              <h3>✅ Do's</h3>
              <ul>
                {scheme.dos.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </section>

            <section className="modal-section donts">
              <h3>❌ Don'ts</h3>
              <ul>
                {scheme.donts.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </section>
          </div>

          <section className="modal-section stats-section">
            <h3>📊 Government Statistics</h3>
            <div className="stats-grid-modal">
              <div className="stat-item-modal">
                <strong>{scheme.statistics.beneficiaries.toLocaleString()}</strong>
                <span>Total Beneficiaries</span>
              </div>
              <div className="stat-item-modal">
                <strong>{scheme.statistics.amountDisbursed}</strong>
                <span>Amount Disbursed</span>
              </div>
              <div className="stat-item-modal">
                <strong>{scheme.statistics.successRate}</strong>
                <span>Success Rate</span>
              </div>
            </div>
          </section>
        </div>
        
      </div>
    </div>
  );
}

export default SchemeModal;
