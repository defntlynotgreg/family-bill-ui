import { useState } from 'react';
import useSWR from 'swr';
import toast, { Toaster } from 'react-hot-toast';

const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const BillCard = ({ bill, isDashboard = false, togglePayment }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div style={{ backgroundColor: 'white', padding: '20px', marginBottom: '15px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: isDashboard ? '2px solid #2563eb' : '1px solid #e2e8f0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h2 style={{ margin: 0, color: '#0f172a', fontSize: isDashboard ? '24px' : '20px' }}>{bill.month} {bill.year}</h2>
        {isDashboard && <span style={{ backgroundColor: '#2563eb', color: 'white', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>CURRENT</span>}
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', backgroundColor: '#f8fafc', padding: '15px', borderRadius: '10px' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: 'bold' }}>Total Due</span>
          <span style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a' }}>₱{bill.totalDue}</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <span style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: 'bold' }}>Per Head</span>
          <span style={{ fontSize: '20px', fontWeight: '800', color: '#2563eb' }}>₱{bill.contributionPerHead}</span>
        </div>
      </div>

      <button onClick={() => setIsExpanded(!isExpanded)} style={{ width: '100%', padding: '10px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#64748b', fontWeight: 'bold', cursor: 'pointer', marginBottom: '15px', transition: '0.2s' }}>
        {isExpanded ? 'Hide Breakdown ▲' : 'Show Breakdown ▼'}
      </button>

      {isExpanded && bill.payables && (
        <div style={{ backgroundColor: '#f1f5f9', padding: '15px', borderRadius: '8px', marginBottom: '15px', fontSize: '14px', color: '#334155', animation: 'fadeIn 0.2s' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}><span>Rent & Water (Lola Flor):</span><strong>₱{bill.payables['Lola Flor (Rent & Water)']}</strong></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}><span>Electricity (Meralco):</span><strong>₱{bill.payables['Meralco (Electricity)']}</strong></div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Internet (Converge):</span><strong>₱{bill.payables['Converge (Internet)']}</strong></div>
        </div>
      )}

      <h4 style={{ margin: '0 0 10px 0', color: '#475569', fontSize: '14px' }}>Tap to mark as paid:</h4>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
        {['me', 'sister', 'cousin'].map(person => (
          <button key={person} onClick={() => togglePayment(bill.month, bill.year, person, bill.paymentStatus[person])}
            style={{ padding: '12px 8px', border: 'none', cursor: 'pointer', borderRadius: '10px', fontWeight: 'bold', fontSize: '14px', transition: 'all 0.1s', backgroundColor: bill.paymentStatus[person] ? '#16a34a' : '#f1f5f9', color: bill.paymentStatus[person] ? 'white' : '#64748b', transform: 'scale(1)' }}
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

// Data fetcher for the SWR cache
const fetcher = url => fetch(url).then(res => res.json());

function App() {
  const [activeTab, setActiveTab] = useState('home'); 
  const API_BASE = "https://family-bill-api.onrender.com";

  // --- SWR ADVANCED CACHING ---
  const { data: database, error, mutate } = useSWR(`${API_BASE}/bills/all`, fetcher);
  
  // Format and sort the cached data
  let bills = [];
  if (database && database.status === 'Success') {
    bills = [...database.data].sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year; 
      return monthNames.indexOf(b.month) - monthNames.indexOf(a.month);
    });
  }
  const isLoading = !database && !error;
  const currentBill = bills.length > 0 ? bills[0] : null;

  const inputStyle = { padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', color: '#0f172a', width: '100%', boxSizing: 'border-box' };

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

  // --- OPTIMISTIC UI + TOAST ALERTS ---
  const togglePayment = (month, year, person, currentStatus) => {
    const updatedStatus = !currentStatus; 

    // Update local cache instantly
    const updatedBills = bills.map(bill => {
      if (bill.month === month && bill.year === year) {
        return { ...bill, paymentStatus: { ...bill.paymentStatus, [person]: updatedStatus } };
      }
      return bill;
    });
    
    // Mutate local cache without waiting for server
    mutate({ status: 'Success', data: updatedBills }, false);

    fetch(`${API_BASE}/bills/update-payment`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ month, year, person, has_paid: updatedStatus })
    })
    .then(res => res.json())
    .then(resData => { 
      if (resData.status === 'Success') {
        toast.success(`Updated ${person.charAt(0).toUpperCase() + person.slice(1)}'s payment!`);
        mutate(); // Silently confirm data with backend
      } else {
        throw new Error();
      }
    })
    .catch(() => {
      toast.error("Network error. Reverting change.");
      mutate(); // Reverts UI to database truth on failure
    });
  };

  const handleAddBill = (e) => {
    e.preventDefault();
    const loadingToast = toast.loading("Saving to database...");

    fetch(`${API_BASE}/bills/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ month, year: parseInt(year), rent_and_water: parseFloat(rentAndWater), electricity: parseFloat(electricity), internet: parseFloat(internet) })
    })
    .then(res => res.json())
    .then(resData => {
      if (resData.status === 'Success') {
        toast.success("Bill saved successfully!", { id: loadingToast });
        mutate(); // Triggers a fresh cache fetch
        setRentAndWater(''); setElectricity(''); setInternet('');
        setActiveTab('home'); 
      } else {
        throw new Error();
      }
    })
    .catch(() => toast.error("Failed to save bill. Try again.", { id: loadingToast }));
  };

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', backgroundColor: '#f4f4f5', minHeight: '100vh', paddingBottom: '80px', color: '#0f172a' }}>
      {/* Toast Notification Container */}
      <Toaster position="top-center" reverseOrder={false} />

      <div style={{ backgroundColor: 'white', padding: '20px', position: 'sticky', top: 0, zIndex: 50, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
        <h1 style={{ margin: 0, textAlign: 'center', color: '#0f172a', fontSize: '20px', fontWeight: '800' }}>⚡ Bill Tracker</h1>
      </div>

      <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
        
        {activeTab === 'home' && (
          <div style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
            <h3 style={{ marginTop: 0, color: '#475569' }}>Dashboard</h3>
            {isLoading ? <p>Syncing data...</p> : currentBill ? <BillCard bill={currentBill} isDashboard={true} togglePayment={togglePayment} /> : <p>No bills found.</p>}
          </div>
        )}

        {activeTab === 'history' && (
          <div style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
            <h3 style={{ marginTop: 0, color: '#475569' }}>Billing History</h3>
            {isLoading ? <p>Syncing data...</p> : bills.map(bill => <BillCard key={bill.id} bill={bill} togglePayment={togglePayment} />)}
          </div>
        )}

        {activeTab === 'calculator' && (
          <div style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
            <h3 style={{ marginTop: 0, color: '#475569' }}>Quick Calculator</h3>
            <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
              <p style={{ margin: '0 0 15px 0', fontSize: '14px', color: '#64748b' }}>Input amounts to see the split.</p>
              <div style={{ display: 'grid', gap: '15px', marginBottom: '20px' }}>
                <input type="number" placeholder="Rent & Water (₱)" value={calcRent} onChange={e => setCalcRent(e.target.value)} style={inputStyle} />
                <input type="number" placeholder="Meralco (₱)" value={calcElec} onChange={e => setCalcElec(e.target.value)} style={inputStyle} />
                <input type="number" placeholder="Converge (₱)" value={calcInt} onChange={e => setCalcInt(e.target.value)} style={inputStyle} />
              </div>
              <div style={{ backgroundColor: '#eff6ff', padding: '15px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between' }}>
                <div><div style={{ fontSize: '12px', color: '#3b82f6', fontWeight: 'bold' }}>TOTAL</div><div style={{ fontSize: '24px', fontWeight: '800', color: '#1e3a8a' }}>₱{calcTotal}</div></div>
                <div style={{ textAlign: 'right' }}><div style={{ fontSize: '12px', color: '#3b82f6', fontWeight: 'bold' }}>PER HEAD (3)</div><div style={{ fontSize: '24px', fontWeight: '800', color: '#1e3a8a' }}>₱{calcPerHead}</div></div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'add' && (
          <div style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
            <h3 style={{ marginTop: 0, color: '#475569' }}>Add New Month</h3>
            <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
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

      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: 'white', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', padding: '15px 5px', borderTop: '1px solid #e2e8f0', zIndex: 50, paddingBottom: 'env(safe-area-inset-bottom)' }}>
        {['home', 'history', 'calculator', 'add'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{ background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', color: activeTab === tab ? '#2563eb' : '#94a3b8', fontWeight: activeTab === tab ? 'bold' : 'normal', cursor: 'pointer' }}>
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