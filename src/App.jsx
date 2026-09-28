import { useState, useEffect } from 'react';

function App() {
  const [bills, setBills] = useState([]);
  
  // Navigation State
  const [activeTab, setActiveTab] = useState('home'); // 'home', 'history', 'calculator'
  
  // Form States
  const [month, setMonth] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [rentAndWater, setRentAndWater] = useState('');
  const [electricity, setElectricity] = useState('');
  const [internet, setInternet] = useState('');

  const fetchBills = () => {
    // Replace this URL with your live Render URL if testing on production
    fetch('https://family-bill-api.onrender.com/') 
      .then(res => res.json())
      .then(data => {
        if (data.status === 'Success') {
          // Sort by year, assuming newest is added last. 
          // For a production app, adding a numeric timestamp to the backend is best.
          const sorted = data.data.reverse(); 
          setBills(sorted);
        }
      })
      .catch(err => console.error("Error fetching:", err));
  };

  useEffect(() => { fetchBills(); }, []);

  const togglePayment = (month, year, person, currentStatus) => {
    fetch('https://family-bill-api.onrender.com/', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ month, year, person, has_paid: !currentStatus })
    })
    .then(res => res.json())
    .then(data => { if (data.status === 'Success') fetchBills(); })
    .catch(err => console.error("Error updating:", err));
  };

  const handleAddBill = (e) => {
    e.preventDefault();
    fetch('https://family-bill-api.onrender.com/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        month: month,
        year: parseInt(year),
        rent_and_water: parseFloat(rentAndWater),
        electricity: parseFloat(electricity),
        internet: parseFloat(internet)
      })
    })
    .then(res => res.json())
    .then(data => {
      if (data.status === 'Success') {
        fetchBills();
        setMonth(''); setRentAndWater(''); setElectricity(''); setInternet('');
        setActiveTab('home'); // Instantly redirect to home after saving
      }
    })
    .catch(err => console.error("Error adding bill:", err));
  };

  // The newest bill is always the first one in the sorted array
  const currentBill = bills.length > 0 ? bills[0] : null;

  // --- REUSABLE UI COMPONENTS ---
  const BillCard = ({ bill, isDashboard = false }) => (
    <div style={{ backgroundColor: 'white', padding: '20px', marginBottom: '15px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: isDashboard ? '2px solid #2563eb' : '1px solid #e2e8f0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h2 style={{ margin: 0, color: '#0f172a', fontSize: isDashboard ? '24px' : '20px' }}>{bill.month} {bill.year}</h2>
        {isDashboard && <span style={{ backgroundColor: '#2563eb', color: 'white', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>CURRENT</span>}
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', backgroundColor: '#f8fafc', padding: '15px', borderRadius: '10px' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: 'bold' }}>Total Due</span>
          <span style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a' }}>₱{bill.totalDue}</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <span style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: 'bold' }}>Per Head</span>
          <span style={{ fontSize: '20px', fontWeight: '800', color: '#2563eb' }}>₱{bill.contributionPerHead}</span>
        </div>
      </div>

      <h4 style={{ margin: '0 0 10px 0', color: '#475569', fontSize: '14px' }}>Tap to mark as paid:</h4>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
        {['me', 'sister', 'cousin'].map(person => (
          <button key={person} onClick={() => togglePayment(bill.month, bill.year, person, bill.paymentStatus[person])}
            style={{ 
              padding: '12px 8px', border: 'none', cursor: 'pointer', borderRadius: '10px', fontWeight: 'bold', fontSize: '14px', transition: 'all 0.2s',
              backgroundColor: bill.paymentStatus[person] ? '#16a34a' : '#f1f5f9',
              color: bill.paymentStatus[person] ? 'white' : '#64748b'
            }}>
            {person.charAt(0).toUpperCase() + person.slice(1)}<br/>
            <span style={{ fontSize: '18px', display: 'block', marginTop: '4px' }}>{bill.paymentStatus[person] ? '✓' : '○'}</span>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', backgroundColor: '#f4f4f5', minHeight: '100vh', paddingBottom: '80px' }}>
      
      {/* STICKY HEADER */}
      <div style={{ backgroundColor: 'white', padding: '20px', position: 'sticky', top: 0, zIndex: 50, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
        <h1 style={{ margin: 0, textAlign: 'center', color: '#0f172a', fontSize: '20px', fontWeight: '800' }}>⚡ Bill Tracker</h1>
      </div>

      {/* MAIN CONTENT AREA */}
      <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
        
        {/* VIEW: HOME DASHBOARD */}
        {activeTab === 'home' && (
          <div style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
            <h3 style={{ marginTop: 0, color: '#475569' }}>Dashboard</h3>
            {bills.length === 0 ? <p>Loading data...</p> : currentBill ? <BillCard bill={currentBill} isDashboard={true} /> : <p>No bills added yet.</p>}
          </div>
        )}

        {/* VIEW: HISTORY */}
        {activeTab === 'history' && (
          <div style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
            <h3 style={{ marginTop: 0, color: '#475569' }}>Billing History</h3>
            {bills.length === 0 ? <p>Loading data...</p> : bills.map(bill => <BillCard key={bill.id} bill={bill} />)}
          </div>
        )}

        {/* VIEW: CALCULATOR (FORM) */}
        {activeTab === 'calculator' && (
          <div style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
            <h3 style={{ marginTop: 0, color: '#475569' }}>Calculate New Month</h3>
            <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
              <form onSubmit={handleAddBill} style={{ display: 'grid', gap: '15px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <input required placeholder="Month" value={month} onChange={e => setMonth(e.target.value)} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc' }} />
                  <input required type="number" placeholder="Year" value={year} onChange={e => setYear(e.target.value)} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc' }} />
                </div>
                <input required type="number" step="0.01" placeholder="Rent & Water (₱)" value={rentAndWater} onChange={e => setRentAndWater(e.target.value)} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc' }} />
                <input required type="number" step="0.01" placeholder="Meralco (₱)" value={electricity} onChange={e => setElectricity(e.target.value)} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc' }} />
                <input required type="number" step="0.01" placeholder="Converge (₱)" value={internet} onChange={e => setInternet(e.target.value)} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc' }} />
                
                <button type="submit" style={{ marginTop: '10px', padding: '15px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px' }}>Calculate & Save</button>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* BOTTOM NAVIGATION BAR */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: 'white', display: 'flex', justifyContent: 'space-around', padding: '15px 10px', borderTop: '1px solid #e2e8f0', zIndex: 50, paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <button onClick={() => setActiveTab('home')} style={{ background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', color: activeTab === 'home' ? '#2563eb' : '#94a3b8', fontWeight: activeTab === 'home' ? 'bold' : 'normal' }}>
          <span style={{ fontSize: '24px', marginBottom: '4px' }}>🏠</span>
          <span style={{ fontSize: '12px' }}>Home</span>
        </button>
        <button onClick={() => setActiveTab('history')} style={{ background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', color: activeTab === 'history' ? '#2563eb' : '#94a3b8', fontWeight: activeTab === 'history' ? 'bold' : 'normal' }}>
          <span style={{ fontSize: '24px', marginBottom: '4px' }}>📜</span>
          <span style={{ fontSize: '12px' }}>History</span>
        </button>
        <button onClick={() => setActiveTab('calculator')} style={{ background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', color: activeTab === 'calculator' ? '#2563eb' : '#94a3b8', fontWeight: activeTab === 'calculator' ? 'bold' : 'normal' }}>
          <span style={{ fontSize: '24px', marginBottom: '4px' }}>🧮</span>
          <span style={{ fontSize: '12px' }}>Calculator</span>
        </button>
      </div>

    </div>
  );
}

export default App;