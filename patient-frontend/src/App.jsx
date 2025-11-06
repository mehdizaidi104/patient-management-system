import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Plus, User, Edit2, Trash2, X, ChevronRight, Inbox, Calendar, Phone, Mail, LogOut, Shield } from 'lucide-react';

// --- Reusable Components (No change) ---
const Input = ({ id, label, value, onChange, ...props }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-slate-700">
      {label}
    </label>
    <div className="mt-1">
      <input
        id={id}
        name={id}
        value={value}
        onChange={onChange}
        className="block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        {...props}
      />
    </div>
  </div>
);

const Button = ({ children, onClick, variant = 'primary', ...props }) => {
  const baseStyle = "inline-flex justify-center items-center gap-2 rounded-md border border-transparent px-4 py-2 text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2";
  const variants = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500",
    secondary: "bg-slate-100 text-indigo-700 hover:bg-slate-200 focus:ring-indigo-500",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
  };
  return (
    <button type="button" onClick={onClick} className={`${baseStyle} ${variants[variant]}`} {...props}>
      {children}
    </button>
  );
};

// --- NEW: Authentication Component ---
const AuthComponent = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    const url = isLogin ? '/auth/login' : '/auth/register';
    const body = JSON.stringify({ username, password });
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: body,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || (isLogin ? 'Login failed' : 'Registration failed'));
      }

      if (isLogin) {
        const data = await response.json(); // Expecting { token: "..." }
        onLoginSuccess(data.token);
      } else {
        setMessage('Registration successful! Please log in.');
        setIsLogin(true); // Flip to login form
        setUsername(''); // Clear fields
        setPassword('');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-100 items-center justify-center">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <div className="flex justify-center">
          <Shield size={48} className="text-indigo-600" />
        </div>
        <h2 className="text-2xl font-bold text-center text-slate-800">
          {isLogin ? 'Patient System Login' : 'Create Account'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input id="username" label="Username" value={username} onChange={(e) => setUsername(e.target.value)} type="text" required />
          <Input id="password" label="Password" value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
          
          {error && <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm">{error}</div>}
          {message && <div className="p-3 bg-green-100 text-green-700 rounded-md text-sm">{message}</div>}

          <div>
            <Button type="submit" variant="primary" className="w-full">
              {isLogin ? 'Login' : 'Register'}
            </Button>
          </div>
        </form>
        
        <div className="text-sm text-center">
          <button onClick={() => setIsLogin(!isLogin)} className="font-medium text-indigo-600 hover:text-indigo-500">
            {isLogin ? 'Need an account? Register' : 'Have an account? Login'}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- NEW: Main Dashboard Component ---
const PatientDashboard = ({ token, onLogout }) => {
  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [formState, setFormState] = useState('new');
  const [formData, setFormData] = useState({
    id: null, firstName: '', lastName: '', dob: '', phone: '',
    email: '', insuranceProvider: '', insurancePolicyNumber: '',
  });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const API_URL = '/api/patients'; // This is correct

  // === NEW: API calls now use the token ===
  const getAuthHeaders = useCallback(() => {
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` // Attach the JWT
    });
    return headers;
  }, [token]);

  const fetchPatients = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(API_URL, {
        headers: getAuthHeaders() // Send token
      });
      if (!response.ok) {
        if (response.status === 401) onLogout(); // Token is bad, log out
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setPatients(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Failed to fetch patients:", e);
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  }, [getAuthHeaders, onLogout]);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const handleCreatePatient = async (patient) => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: getAuthHeaders(), // Send token
        body: JSON.stringify(patient),
      });
      if (!response.ok) throw new Error('Failed to create patient');
      const newPatient = await response.json();
      setPatients([newPatient, ...patients]);
      resetForm();
    } catch (e) {
      console.error(e);
      setError('Failed to create patient.');
    }
  };

  const handleUpdatePatient = async (patient) => {
    try {
      const response = await fetch(`${API_URL}/${patient.id}`, {
        method: 'PUT',
        headers: getAuthHeaders(), // Send token
        body: JSON.stringify(patient),
      });
      if (!response.ok) throw new Error('Failed to update patient');
      await fetchPatients();
      resetForm();
    } catch (e) {
      console.error(e);
      setError('Failed to update patient.');
    }
  };

  const handleDeletePatient = async (id) => {
    if (window.confirm('Are you sure you want to delete this patient?')) {
      try {
        const response = await fetch(`${API_URL}/${id}`, {
          method: 'DELETE',
          headers: getAuthHeaders() // Send token
        });
        if (!response.ok) throw new Error('Failed to delete patient');
        setPatients(patients.filter(p => p.id !== id));
        if (selectedPatientId === id) {
          setSelectedPatientId(null);
        }
      } catch (e) {
        console.error(e);
        setError('Failed to delete patient.');
      }
    }
  };

  // --- (Rest of the file is identical) ---
  const resetForm = () => {
    setFormData({
      id: null, firstName: '', lastName: '', dob: '', phone: '',
      email: '', insuranceProvider: '', insurancePolicyNumber: '',
    });
    setFormState('new');
  };
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (formState === 'new') {
      handleCreatePatient(formData);
    } else {
      handleUpdatePatient(formData);
    }
  };
  const handleSelectPatient = (patient) => {
    setSelectedPatientId(patient.id);
  };
  const handleEditPatient = (patient) => {
    setFormState('edit');
    const formattedPatient = {
      ...patient,
      dob: patient.dob ? new Date(patient.dob).toISOString().split('T')[0] : ''
    };
    setFormData(formattedPatient);
  };
  const selectedPatient = useMemo(() => {
    return patients.find((p) => p.id === selectedPatientId);
  }, [patients, selectedPatientId]);
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      date.setUTCDate(date.getUTCDate() + 1);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (_e) {
      return dateString;
    }
  };

  return (
    <div className="flex flex-col h-screen antialiased text-slate-700 bg-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold text-indigo-600">
              Patient Management System
            </h1>
            <div className="flex items-center gap-4">
              <Button onClick={() => { resetForm(); /* show add form */ }} variant="primary">
                <Plus size={18} /> New Patient
              </Button>
              <Button onClick={onLogout} variant="secondary">
                <LogOut size={16} /> Logout
              </Button>
            </div>
          </div>
        </div>
      </header>
      {/* ... (rest of the dashboard JSX is identical) ... */}
      <main className="flex-1 overflow-hidden">
        <div className="max-w-7xl mx-auto h-full grid grid-cols-1 lg:grid-cols-3 gap-6 px-4 sm:px-6 lg:px-8 py-6">
          
          {/* Column 1: Patient List */}
          <section className="lg:col-span-1 bg-white rounded-lg shadow-md flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-200">
              <h2 className="text-lg font-semibold">Patients ({patients.length})</h2>
            </div>
            {isLoading && <div className="p-4 text-center text-slate-500">Loading...</div>}
            {error && (
              <div className="p-4 m-4 bg-red-100 text-red-700 rounded-md">
                <strong>Error:</strong> {error}
              </div>
            )}
            <ul className="flex-1 divide-y divide-slate-200 overflow-y-auto">
              {/* ... (patient list map) ... */}
              {patients.length > 0 ? patients.map((patient) => (
                <li key={patient.id}>
                  <button
                    onClick={() => handleSelectPatient(patient)}
                    className={`w-full text-left p-4 hover:bg-slate-50 ${selectedPatientId === patient.id ? 'bg-indigo-50' : ''}`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-indigo-700">
                          {patient.firstName} {patient.lastName}
                        </p>
                        <p className="text-sm text-slate-500">{patient.email}</p>
                      </div>
                      <ChevronRight size={18} className="text-slate-400" />
                    </div>
                  </button>
                </li>
              )) : (
                !isLoading && !error && (
                  <li className="p-4 text-center text-slate-500">
                    <Inbox size={32} className="mx-auto mb-2" />
                    No patients found.
                  </li>
                )
              )}
            </ul>
          </section>

          {/* Column 2: Patient Details */}
          <section className="lg:col-span-1 bg-white rounded-lg shadow-md flex flex-col overflow-hidden">
            {/* ... (patient details content) ... */}
            <div className="p-4 border-b border-slate-200">
              <h2 className="text-lg font-semibold">Patient Details</h2>
            </div>
            {selectedPatient ? (
              <div className="flex-1 p-6 overflow-y-auto">
                {/* ... (details) ... */}
                <div className="flex items-center mb-6">
                  <span className="flex-shrink-0 inline-flex items-center justify-center h-16 w-16 rounded-full bg-indigo-100 text-indigo-600">
                    <User size={32} />
                  </span>
                  <div className="ml-4">
                    <h3 className="text-2xl font-bold">
                      {selectedPatient.firstName} {selectedPatient.lastName}
                    </h3>
                    <p className="text-sm text-slate-500">Patient ID: {selectedPatient.id}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Calendar size={18} className="text-slate-400 mr-3" />
                    <span className="font-medium">Born:</span>
                    <span className="ml-2">{formatDate(selectedPatient.dob)}</span>
                  </div>
                  <div className="flex items-center">
                    <Phone size={18} className="text-slate-400 mr-3" />
                    <span className="font-medium">Phone:</span>
                    <span className="ml-2">{selectedPatient.phone}</span>
                  </div>
                  <div className="flex items-center">
                    <Mail size={18} className="text-slate-400 mr-3" />
                    <span className="font-medium">Email:</span>
                    <span className="ml-2">{selectedPatient.email}</span>
                  </div>
                  <div className="pt-4 border-t border-slate-200">
                    <h4 className="text-sm font-semibold text-slate-500 mb-2">Insurance</h4>
                    <p><strong>Provider:</strong> {selectedPatient.insuranceProvider}</p>
                    <p><strong>Policy #:</strong> {selectedPatient.insurancePolicyNumber}</p>
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t border-slate-200 flex space-x-3">
                  <Button onClick={() => handleEditPatient(selectedPatient)}>
                    <Edit2 size={16} /> Edit
                  </Button>
                  <Button onClick={() => handleDeletePatient(selectedPatient.id)} variant="danger">
                    <Trash2 size={16} /> Delete
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex-1 p-6 flex items-center justify-center text-center text-slate-500">
                <div>
                  <User size={48} className="mx-auto mb-2" />
                  Select a patient to view their details.
                </div>
              </div>
            )}
          </section>

          {/* Column 3: Add/Edit Form */}
          <section className="lg:col-span-1 bg-white rounded-lg shadow-md flex flex-col overflow-hidden">
            {/* ... (form content) ... */}
            <div className="p-4 border-b border-slate-200">
              <h2 className="text-lg font-semibold">
                {formState === 'new' ? 'Add New Patient' : `Edit ${formData.firstName} ${formData.lastName}`}
              </h2>
            </div>
            <form onSubmit={handleFormSubmit} className="flex-1 p-6 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input id="firstName" label="First Name" value={formData.firstName} onChange={handleFormChange} required />
                <Input id="lastName" label="Last Name" value={formData.lastName} onChange={handleFormChange} required />
              </div>
              <Input id="dob" label="Date of Birth" value={formData.dob} onChange={handleFormChange} type="date" required />
              <Input id="phone" label="Phone" value={formData.phone} onChange={handleFormChange} type="tel" required />
              <Input id="email" label="Email" value={formData.email} onChange={handleFormChange} type="email" required />
              <Input id="insuranceProvider" label="Insurance Provider" value={formData.insuranceProvider} onChange={handleFormChange} />
              <Input id="insurancePolicyNumber" label="Policy Number" value={formData.insurancePolicyNumber} onChange={handleFormChange} />
              
              <div className="flex items-center justify-end space-x-3 pt-4">
                <Button onClick={resetForm} variant="secondary" type="button">
                  Cancel
                </Button>
                <Button type="submit">
                  {formState === 'new' ? 'Save Patient' : 'Update Patient'}
                </Button>
              </div>
            </form>
          </section>

        </div>
      </main>
    </div>
  );
};


// --- NEW: Top-Level App Component ---
// This component manages the authentication state
// and decides whether to show the Login form or the Dashboard
export default function App() {
  // Try to get the token from browser's local storage
  const [token, setToken] = useState(() => localStorage.getItem('jwtToken'));

  const handleLoginSuccess = (newToken) => {
    localStorage.setItem('jwtToken', newToken); // Save token
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('jwtToken'); // Delete token
    setToken(null);
  };

  // Conditionally render:
  // If we have a token, show the dashboard.
  // If not, show the login/register component.
  return (
    <div>
      {token ? (
        <PatientDashboard token={token} onLogout={handleLogout} />
      ) : (
        <AuthComponent onLoginSuccess={handleLoginSuccess} />
      )}
    </div>
  );
}