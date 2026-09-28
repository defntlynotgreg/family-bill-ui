import { useState, useEffect } from 'react';
import useSWR from 'swr';
import toast, { Toaster } from 'react-hot-toast';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const fetcher = url => fetch(url).then(res => res.json());

// --- BILL CARD (Now with Edit/Delete modes) ---
const BillCard = ({ bill, isDashboard = false, togglePayment, deleteBill, editBill, theme }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Edit Form States
  const [editRent, setEditRent] = useState(bill.payables ? bill.payables['Lola Flor (Rent & Water)'] : 0);
  const [editElec, setEditElec] = useState(bill.payables ? bill.payables['Meralco (Electricity)'] : 0);
  const [editInt, setEditInt] = useState(bill.payables ? bill.payables['Converge (Internet)'] : 0);

  const handleSaveEdit = () => {
    editBill(bill.month, bill.year, parseFloat(editRent), parseFloat(editElec), parseFloat(editInt));
    setIsEditing(false);
  };

  const editInputStyle = { padding: '8px', borderRadius: '6px', border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.textMain, width: '100px', boxSizing: 'border-box' };

  return (
    <div style={{ backgroundColor: theme.bgCard, padding: '20px', marginBottom: '15px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: isDashboard ? '2px solid #2563eb' : `1px solid ${theme.border}`, color: theme.textMain, transition: 'all 0.3s' }}>
      
      {/* HEADER ROW WITH ICONS */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h2 style={{ margin: 0, fontSize: isDashboard ? '24px' : '20px' }}>{bill.month} {bill.year}</h2>
        <div>
          {!isDashboard && (
            <>
              <button onClick={() => setIsEditing(!isEditing)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', marginRight: '10px' }}>✏️</button>
              <button onClick={() => deleteBill(bill.month, bill.year)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}>🗑️</button>
            </>
          )}
          {isDashboard && <span style={{ backgroundColor: '#2563eb', color: 'white', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>CURRENT</span>}
        </div>
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', backgroundColor: theme.highlightBg, padding: '15px', borderRadius: '10px' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '12px', color: theme.textSub, textTransform: 'uppercase', fontWeight: 'bold' }}>Total Due</span>
          <span style={{ fontSize: '20px', fontWeight: '800' }}>₱{bill.totalDue}</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <span style={{ fontSize: '12px', color: theme.textSub, textTransform: 'uppercase', fontWeight: 'bold' }}>Per Head</span>
          <span style={{ fontSize: '20px', fontWeight: '800', color: '#3b82f6' }}>₱{bill.contributionPerHead}</span>
        </div>
      </div>

      {/* EDITING MODE VS VIEWING MODE */}
      {isEditing ? (
        <div style={{ backgroundColor: theme.highlightBg, padding: '15px', borderRadius: '8px', marginBottom: '15px', fontSize: '14px', animation: 'fadeIn 0.2s' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span>Rent & Water:</span>
            <input type="number" value={editRent} onChange={e => setEditRent(e.target.value)} style={editInputStyle} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span>Electricity:</span>
            <input type="number" value={editElec} onChange={e => setEditElec(e.target.value)} style={editInputStyle} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <span>Internet:</span>
            <input type="number" value={editInt} onChange={e => setEditInt(e.target.value)} style={editInputStyle} />
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={handleSaveEdit} style={{ flex: 1, padding: '10px', backgroundColor: '#16a34a', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Save</button>
            <button onClick={() => setIsEditing(false)} style={{ flex: 1, padding: '10px', backgroundColor: theme.inputBg, color: theme.textSub, border: `1px solid ${theme.border}`, borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Cancel</button>
          </div>
        </div>
      ) : (
        <>
          <button onClick={() => setIsExpanded(!isExpanded)} style={{ width: '100%', padding: '10px', backgroundColor: theme.highlightBg, border: `1px solid ${theme.border}`, borderRadius: '8px', color: theme.textSub, fontWeight: 'bold', cursor: 'pointer', marginBottom: '15px', transition: '0.2s' }}>
            {isExpanded ? 'Hide Breakdown ▲' : 'Show Breakdown ▼'}
          </button>

          {isExpanded && bill.payables && (
            <div style={{ backgroundColor: theme.inputBg, padding: '15px', borderRadius: '8px', marginBottom: '15px', fontSize: '14px', animation: 'fadeIn 0.2s' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}><span>Rent & Water:</span><strong>₱{bill.payables['Lola Flor (Rent & Water)']}</strong></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}><span>Electricity:</span><strong>₱{bill.payables['Meralco (Electricity)']}</strong></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Internet:</span><strong>₱{bill.payables['Converge (Internet)']}</strong></div>
            </div>
          )}
        </>
      )}

      <h4 style={{ margin: '0 0 10px 0', color: theme.textSub, fontSize: '14px' }}>Tap to mark as paid:</h4>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
        {['me', 'sister', 'cousin'].map(person => (
          <button key={person} onClick={() => togglePayment(bill.month, bill.year, person, bill.paymentStatus[person])}
            style={{ padding: '12px 8px', border: 'none', cursor: 'pointer', borderRadius: '10px', fontWeight: 'bold', fontSize: '14px', transition: 'all 0.1s', backgroundColor: bill.paymentStatus[person] ? '#16a34a' : theme.highlightBg, color: bill.paymentStatus[person] ? 'white' : theme.textSub, transform: 'scale(1)' }}
            onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'} 
            onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}     
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            onTouchStart={(e) => e.currentTarget.style.transform = 'scale(0.95)'} 
            onTouchEnd={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            {person.charAt(0).toUpperCase() + person.slice(1)}<br/>
            <span style={{ fontSize: '18px', display: 'block', marginTop: '4px' }}>{bill.paymentStatus[person] ? '✓' : '○'}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

// --- MAIN APP COMPONENT ---
function App() {
  const [activeTab, setActiveTab] = useState('home'); 
  const API_BASE = "https://family-bill-api.onrender.com";

  // Theme Config
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
  useEffect(() => {
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    document.body.style.backgroundColor = isDarkMode ? '#0f172a' : '#f4f4f5';
  }, [isDarkMode]);

  const theme = {
    bgApp: isDarkMode ? '#0f172a' : '#f4f4f5', bgCard: isDarkMode ? '#1e293b' : 'white',
    textMain: isDarkMode ? '#f8fafc' : '#0f172a', textSub: isDarkMode ? '#94a3b8' : '#475569',
    border: isDarkMode ? '#334155' : '#e2e8f0', inputBg: isDarkMode ? '#0f172a' : '#f8fafc',
    highlightBg: isDarkMode ? '#334155' : '#f8fafc', navBg: isDarkMode ? '#1e293b' : 'white'
  };
  const inputStyle = { padding: '12px', borderRadius: '8px', border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.textMain, width: '100%', boxSizing: 'border-box' };

  // Data Fetching
  const { data: database, error, mutate } = useSWR(`${API_BASE}/bills/all`, fetcher);
  
  let bills = [];
  let chartData = [];
  if (database && database.status === 'Success') {
    bills = [...database.data].sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year; 
      return monthNames.indexOf(b.month) - monthNames.indexOf(a.month);
    });
    chartData = [...bills].reverse().slice(-6).map(b => ({ name: `${b.month.substring(0,3)}`, Total: b.totalDue }));
  }
  const isLoading = !database && !error;
  const currentBill = bills.length > 0 ? bills[0] : null;

  // Form States
  const [month, setMonth] = useState('September');
  const [year, setYear] = useState(2026);
  const [rentAndWater, setRentAndWater] = useState('');
  const [electricity, setElectricity] = useState('');
  const [internet, setInternet] = useState('');
  const [calcRent, setCalcRent] = useState('');
  const [calcElec, setCalcElec] = useState('');
  const [calcInt, setCalcInt] = useState('');
  
  const calcTotal = (parseFloat(calcRent || 0) + parseFloat(calcElec || 0) + parseFloat(calcInt || 0)).toFixed(2);
  const calcPerHead = (parseFloat(calcTotal) / 3).toFixed(2);

  // --- CRUD OPERATIONS ---
  const togglePayment = (month, year, person, currentStatus) => {
    const updatedStatus = !currentStatus; 
    const updatedBills = bills.map(b => (b.month === month && b.year === year) ? { ...b, paymentStatus: { ...b.paymentStatus, [person]: updatedStatus } } : b);
    mutate({ status: 'Success', data: updatedBills }, false);

    fetch(`${API_BASE}/bills/update-payment`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ month, year, person, has_paid: updatedStatus })
    }).then(res => res.json()).then(resData => { 
      if (resData.status === 'Success') {
        toast.success(`Updated ${person}'s payment!`, { style: { background: theme.bgCard, color: theme.textMain } });
        mutate(); 
      } else throw new Error();
    }).catch(() => {
      toast.error("Network error. Reverting change.");
      mutate(); 
    });
  };

  const handleAddBill = (e) => {
    e.preventDefault();
    const loadingToast = toast.loading("Saving to database...", { style: { background: theme.bgCard, color: theme.textMain } });
    fetch(`${API_BASE}/bills/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ month, year: parseInt(year), rent_and_water: parseFloat(rentAndWater), electricity: parseFloat(electricity), internet: parseFloat(internet) })
    }).then(res => res.json()).then(resData => {
      if (resData.status === 'Success') {
        toast.success("Bill saved!", { id: loadingToast, style: { background: theme.bgCard, color: theme.textMain } });
        mutate(); 
        setRentAndWater(''); setElectricity(''); setInternet('');
        setActiveTab('home'); 
      } else throw new Error();
    }).catch(() => toast.error("Failed to save.", { id: loadingToast }));
  };

  // DELETE Route Integration
  const deleteBill = (month, year) => {
    if (!window.confirm(`Are you sure you want to delete the bill for ${month} ${year}?`)) return;
    const loadingToast = toast.loading("Deleting...", { style: { background: theme.bgCard, color: theme.textMain } });
    
    // Optimistic UI Removal
    const updatedBills = bills.filter(b => !(b.month === month && b.year === year));
    mutate({ status: 'Success', data: updatedBills }, false);

    fetch(`${API_BASE}/bills/delete`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ month, year })
    }).then(res => res.json()).then(resData => {
      if (resData.status === 'Success') {
        toast.success("Bill deleted!", { id: loadingToast, style: { background: theme.bgCard, color: theme.textMain } });
        mutate();
      } else throw new Error();
    }).catch(() => {
      toast.error("Failed to delete.", { id: loadingToast });
      mutate();
    });
  };

  // EDIT Route Integration
  const editBill = (month, year, rent, elec, int) => {
    const loadingToast = toast.loading("Updating...", { style: { background: theme.bgCard, color: theme.textMain } });
    
    fetch(`${API_BASE}/bills/edit`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ month, year, rent_and_water: rent, electricity: elec, internet: int })
    }).then(res => res.json()).then(resData => {
      if (resData.status === 'Success') {
        toast.success("Bill updated!", { id: loadingToast, style: { background: theme.bgCard, color: theme.textMain } });
        mutate();
      } else throw new Error();
    }).catch(() => {
      toast.error("Failed to update.", { id: loadingToast });
    });
  };

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', backgroundColor: theme.bgApp, minHeight: '100vh', paddingBottom: '80px', color: theme.textMain, transition: 'all 0.3s' }}>
      <Toaster position="top-center" />

      <div style={{ backgroundColor: theme.bgCard, padding: '20px', position: 'sticky', top: 0, zIndex: 50, boxShadow: '0 2px 10px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.3s' }}>
        <h1 style={{ margin: 0, color: theme.textMain, fontSize: '20px', fontWeight: '800' }}>⚡ Bill Tracker</h1>
        <button onClick={() => setIsDarkMode(!isDarkMode)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}>
          {isDarkMode ? '☀️' : '🌙'}
        </button>
      </div>

      <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
        
        {activeTab === 'home' && (
          <div style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
            <h3 style={{ marginTop: 0, color: theme.textSub }}>Dashboard</h3>
            {!isLoading && chartData.length > 0 && (
              <div style={{ backgroundColor: theme.bgCard, padding: '15px 15px 5px 5px', borderRadius: '16px', marginBottom: '20px', border: `1px solid ${theme.border}` }}>
                <h4 style={{ margin: '0 0 15px 15px', color: theme.textSub, fontSize: '12px', textTransform: 'uppercase' }}>6-Month Trend (₱)</h4>
                <ResponsiveContainer width="100%" height={160}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={theme.border} vertical={false} />
                    <XAxis dataKey="name" stroke={theme.textSub} fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke={theme.textSub} fontSize={12} tickLine={false} axisLine={false} width={50} tickFormatter={(value) => `${(value/1000).toFixed(1)}k`} />
                    <Tooltip contentStyle={{ backgroundColor: theme.highlightBg, border: 'none', borderRadius: '8px', color: theme.textMain }} itemStyle={{ color: '#3b82f6', fontWeight: 'bold' }} />
                    <Line type="monotone" dataKey="Total" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6' }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
            {isLoading ? <p style={{ color: theme.textSub }}>Syncing data...</p> : currentBill ? <BillCard bill={currentBill} isDashboard={true} togglePayment={togglePayment} deleteBill={deleteBill} editBill={editBill} theme={theme} /> : <p>No bills found.</p>}
          </div>
        )}

        {activeTab === 'history' && (
          <div style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
            <h3 style={{ marginTop: 0, color: theme.textSub }}>Billing History</h3>
            {isLoading ? <p style={{ color: theme.textSub }}>Syncing data...</p> : bills.map(bill => <BillCard key={bill.id} bill={bill} togglePayment={togglePayment} deleteBill={deleteBill} editBill={editBill} theme={theme} />)}
          </div>
        )}

        {/* ... Calculator and Add Tabs remain exactly the same as Phase 2 ... */}
        {activeTab === 'calculator' && (
          <div style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
            <h3 style={{ marginTop: 0, color: theme.textSub }}>Quick Calculator</h3>
            <div style={{ backgroundColor: theme.bgCard, padding: '25px', borderRadius: '16px', border: `1px solid ${theme.border}` }}>
              <p style={{ margin: '0 0 15px 0', fontSize: '14px', color: theme.textSub }}>Input amounts to see the split.</p>
              <div style={{ display: 'grid', gap: '15px', marginBottom: '20px' }}>
                <input type="number" placeholder="Rent & Water (₱)" value={calcRent} onChange={e => setCalcRent(e.target.value)} style={inputStyle} />
                <input type="number" placeholder="Meralco (₱)" value={calcElec} onChange={e => setCalcElec(e.target.value)} style={inputStyle} />
                <input type="number" placeholder="Converge (₱)" value={calcInt} onChange={e => setCalcInt(e.target.value)} style={inputStyle} />
              </div>
              <div style={{ backgroundColor: isDarkMode ? '#1e3a8a' : '#eff6ff', padding: '15px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between' }}>
                <div><div style={{ fontSize: '12px', color: isDarkMode ? '#93c5fd' : '#3b82f6', fontWeight: 'bold' }}>TOTAL</div><div style={{ fontSize: '24px', fontWeight: '800', color: isDarkMode ? 'white' : '#1e3a8a' }}>₱{calcTotal}</div></div>
                <div style={{ textAlign: 'right' }}><div style={{ fontSize: '12px', color: isDarkMode ? '#93c5fd' : '#3b82f6', fontWeight: 'bold' }}>PER HEAD (3)</div><div style={{ fontSize: '24px', fontWeight: '800', color: isDarkMode ? 'white' : '#1e3a8a' }}>₱{calcPerHead}</div></div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'add' && (
          <div style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
            <h3 style={{ marginTop: 0, color: theme.textSub }}>Add New Month</h3>
            <div style={{ backgroundColor: theme.bgCard, padding: '25px', borderRadius: '16px', border: `1px solid ${theme.border}` }}>
              <form onSubmit={handleAddBill} style={{ display: 'grid', gap: '15px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <select required value={month} onChange={e => setMonth(e.target.value)} style={inputStyle}>
                    <option value="" disabled>Select Month</option>
                    {monthNames.map(m => (<option key={m} value={m}>{m}</option>))}
                  </select>
                  <input required type="number" placeholder="Year" value={year} onChange={e => setYear(e.target.value)} style={inputStyle} />
                </div>
                <input required type="number" step="0.01" placeholder="Rent & Water (₱)" value={rentAndWater} onChange={e => setRentAndWater(e.target.value)} style={inputStyle} />
                <input required type="number" step="0.01" placeholder="Meralco (₱)" value={electricity} onChange={e => setElectricity(e.target.value)} style={inputStyle} />
                <input required type="number" step="0.01" placeholder="Converge (₱)" value={internet} onChange={e => setInternet(e.target.value)} style={inputStyle} />
                
                <button type="submit" style={{ marginTop: '10px', padding: '15px', backgroundColor: '#16a34a', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer' }}>Save to Database</button>
              </form>
            </div>
          </div>
        )}
      </div>

      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: theme.navBg, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', padding: '15px 5px', borderTop: `1px solid ${theme.border}`, zIndex: 50, paddingBottom: 'env(safe-area-inset-bottom)', transition: 'all 0.3s' }}>
        {['home', 'history', 'calculator', 'add'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{ background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', color: activeTab === tab ? '#3b82f6' : theme.textSub, fontWeight: activeTab === tab ? 'bold' : 'normal', cursor: 'pointer' }}>
            <span style={{ fontSize: '22px', marginBottom: '4px' }}>
              {tab === 'home' ? '🏠' : tab === 'history' ? '📜' : tab === 'calculator' ? '🧮' : '➕'}
            </span>
            <span style={{ fontSize: '11px', textTransform: 'capitalize' }}>{tab === 'calculator' ? 'Calc' : tab}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default App;