import { useState, useEffect } from 'react';
import { activityStorage, sessionStorage } from '../utils/localStorage';
import { firAPI } from '../utils/api';
import { incidentTypes } from '../data/mockData';
import './FIRPage.css';

function FIRPage() {
  const [showForm, setShowForm] = useState(false);
  const [savedDrafts, setSavedDrafts] = useState([]);
  const [formData, setFormData] = useState({
    incidentType: '',
    incidentDate: '',
    location: '',
    estimatedLoss: '',
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    incidentNarrative: '',
    suspectName: '',
    suspectPhone: '',
    suspectAccount: '',
    suspectUPI: ''
  });

  useEffect(() => {
    loadDrafts();
  }, []);

  const loadDrafts = async () => {
    try {
      const session = sessionStorage.get();
      if (!session?.userId) return;
      const drafts = await firAPI.getAllByUser(session.userId);
      setSavedDrafts(Array.isArray(drafts) ? drafts : []);
    } catch (error) {
      console.error('Failed to load FIR records:', error);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSaveDraft = async () => {
    try {
      const session = sessionStorage.get();
      const draft = {
        incidentType: formData.incidentType,
        incidentDate: formData.incidentDate,
        location: formData.location,
        estimatedLoss: Number(formData.estimatedLoss || 0),
        contactDetails: {
          name: formData.contactName,
          phone: formData.contactPhone,
          email: formData.contactEmail
        },
        incidentNarrative: formData.incidentNarrative,
        suspectDetails: {
          name: formData.suspectName,
          phone: formData.suspectPhone,
          account: formData.suspectAccount,
          upi: formData.suspectUPI
        },
        evidence: [],
        status: 'Draft'
      };

      if (!session?.userId) {
        alert('Please login again before saving FIR draft.');
        return;
      }

      await firAPI.create(draft);
      activityStorage.add({ type: 'draft-saved', description: 'FIR draft saved' });
      await loadDrafts();
      alert('Draft saved successfully!');
    } catch (error) {
      alert(error.message || 'Unable to save draft');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await handleSaveDraft();
    setFormData({
      incidentType: '',
      incidentDate: '',
      location: '',
      estimatedLoss: '',
      contactName: '',
      contactPhone: '',
      contactEmail: '',
      incidentNarrative: '',
      suspectName: '',
      suspectPhone: '',
      suspectAccount: '',
      suspectUPI: ''
    });
    setShowForm(false);
  };

  const handleDeleteDraft = async (id) => {
    if (confirm('Are you sure you want to delete this draft?')) {
      try {
        await firAPI.delete(id);
        activityStorage.add({ type: 'draft-deleted', description: 'FIR draft deleted' });
        await loadDrafts();
      } catch (error) {
        alert(error.message || 'Unable to delete draft');
      }
    }
  };

  const handleGeneratePdf = async (id) => {
    try {
      const updated = await firAPI.generatePdf(id);
      if (updated?.pdfUrl) {
        window.open(updated.pdfUrl, '_blank');
      }
      await loadDrafts();
    } catch (error) {
      alert(error.message || 'Unable to generate PDF');
    }
  };

  const handleSubmitFir = async (id) => {
    try {
      await firAPI.submit(id);
      await loadDrafts();
      alert('FIR submitted successfully.');
    } catch (error) {
      alert(error.message || 'Unable to submit FIR');
    }
  };

  return (
    <div className="fir-page">
      <div className="page-header">
        <h2>Cyber & FIR Cockpit</h2>
        <p>Prepare structured, police-ready FIR drafts</p>
      </div>

      <div className="progress-tracker">
        <h3>Application Progress</h3>
        <div className="progress-steps">
          <div className="progress-step active">
            <div className="step-circle">1</div>
            <span>Incident Logged</span>
          </div>
          <div className="progress-step">
            <div className="step-circle">2</div>
            <span>Draft Under Review</span>
          </div>
          <div className="progress-step">
            <div className="step-circle">3</div>
            <span>Collector Verification</span>
          </div>
          <div className="progress-step">
            <div className="step-circle">4</div>
            <span>Relief Sanction</span>
          </div>
        </div>
      </div>

      {!showForm && (
        <div className="fir-actions">
          <button className="primary-btn large" onClick={() => setShowForm(true)}>
            + New FIR Draft
          </button>
        </div>
      )}

      {showForm && (
        <div className="fir-form-container card">
          <div className="form-header">
            <h3>FIR Intake Form</h3>
            <button className="close-form-btn" onClick={() => setShowForm(false)}>✕</button>
          </div>

          <form onSubmit={handleSubmit} className="fir-form">
            <div className="form-section">
              <h4>Incident Details</h4>
              
              <div className="form-group">
                <label htmlFor="incidentType">Incident Type *</label>
                <select
                  id="incidentType"
                  name="incidentType"
                  value={formData.incidentType}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select incident type</option>
                  {incidentTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="incidentDate">Incident Date *</label>
                  <input
                    type="date"
                    id="incidentDate"
                    name="incidentDate"
                    value={formData.incidentDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="estimatedLoss">Estimated Loss (₹) *</label>
                  <input
                    type="number"
                    id="estimatedLoss"
                    name="estimatedLoss"
                    value={formData.estimatedLoss}
                    onChange={handleInputChange}
                    placeholder="0"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="location">Location *</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="City, State"
                  required
                />
              </div>
            </div>

            <div className="form-section">
              <h4>Contact Details</h4>
              
              <div className="form-group">
                <label htmlFor="contactName">Full Name *</label>
                <input
                  type="text"
                  id="contactName"
                  name="contactName"
                  value={formData.contactName}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="contactPhone">Phone Number *</label>
                  <input
                    type="tel"
                    id="contactPhone"
                    name="contactPhone"
                    value={formData.contactPhone}
                    onChange={handleInputChange}
                    placeholder="10-digit mobile number"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="contactEmail">Email</label>
                  <input
                    type="email"
                    id="contactEmail"
                    name="contactEmail"
                    value={formData.contactEmail}
                    onChange={handleInputChange}
                    placeholder="your@email.com"
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h4>Incident Narrative *</h4>
              <div className="form-group">
                <label htmlFor="incidentNarrative">Describe what happened</label>
                <textarea
                  id="incidentNarrative"
                  name="incidentNarrative"
                  value={formData.incidentNarrative}
                  onChange={handleInputChange}
                  rows="6"
                  placeholder="Provide a detailed description of the incident..."
                  required
                />
              </div>
            </div>

            <div className="form-section">
              <h4>Suspect Details (if known)</h4>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="suspectName">Name</label>
                  <input
                    type="text"
                    id="suspectName"
                    name="suspectName"
                    value={formData.suspectName}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="suspectPhone">Phone Number</label>
                  <input
                    type="tel"
                    id="suspectPhone"
                    name="suspectPhone"
                    value={formData.suspectPhone}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="suspectAccount">Bank Account/UPI</label>
                  <input
                    type="text"
                    id="suspectAccount"
                    name="suspectAccount"
                    value={formData.suspectAccount}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="suspectUPI">UPI ID</label>
                  <input
                    type="text"
                    id="suspectUPI"
                    name="suspectUPI"
                    value={formData.suspectUPI}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="secondary-btn" onClick={handleSaveDraft}>
                Save Draft
              </button>
              <button type="submit" className="primary-btn">
                Save & Continue
              </button>
            </div>
          </form>
        </div>
      )}

      {savedDrafts.length > 0 && (
        <div className="saved-drafts card">
          <h3>Saved Drafts ({savedDrafts.length})</h3>
          <div className="drafts-list">
            {savedDrafts.map((draft) => (
                <div key={draft._id} className="draft-item">
                <div className="draft-info">
                  <h4>{draft.incidentType || 'Untitled Draft'}</h4>
                    <p>Loss: ₹{Number(draft.estimatedLoss || 0).toLocaleString()}</p>
                  <span className="draft-date">
                      Last modified: {new Date(draft.updatedAt || draft.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="draft-actions">
                  <span className="status-badge draft">{draft.status || 'Draft'}</span>
                    <button
                      className="secondary-btn"
                      onClick={() => handleSubmitFir(draft._id)}
                    >
                      Submit
                    </button>
                    <button
                      className="secondary-btn"
                      onClick={() => handleGeneratePdf(draft._id)}
                    >
                      PDF
                    </button>
                  <button
                    className="delete-btn"
                      onClick={() => handleDeleteDraft(draft._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="ai-guidance card">
        <h3>🤖 AI Guidance Status</h3>
        <p className="placeholder-text">
          AI-powered assistance coming soon: Auto-detect missing fields, suggest applicable schemes, 
          and help refine your FIR narrative.
        </p>
        <div className="roadmap-badge">Planned Feature</div>
      </div>
    </div>
  );
}

export default FIRPage;
