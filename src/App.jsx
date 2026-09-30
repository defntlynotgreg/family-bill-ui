import { useState, useEffect, useRef } from 'react';
import useSWR from 'swr';
import toast, { Toaster } from 'react-hot-toast';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const fetcher = url => fetch(url).then(res => res.json());

// --- SKELETON LOADER ---
const SkeletonCard = ({ theme }) => (
  <div style={{ backgroundColor: theme.bgCard, padding: '24px', marginBottom: '16px', borderRadius: '24px', border: `1px solid ${theme.border}`, animation: 'pulse 1.5s infinite ease-in-out' }}>
    <div style={{ height: '24px', width: '120px', backgroundColor: theme.highlightBg, borderRadius: '8px', marginBottom: '20px' }}></div>
    <div style={{ height: '70px', width: '100%', backgroundColor: theme.highlightBg, borderRadius: '12px', marginBottom: '15px' }}></div>
    <div style={{ height: '45px', width: '100%', backgroundColor: theme.highlightBg, borderRadius: '12px' }}></div>
  </div>
);

// --- BILL CARD ---
const BillCard = ({ bill, isDashboard = false, togglePayment, deleteBill, editBill, theme }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Swipe-to-Action States
  const [swipeOffset, setSwipeOffset] = useState(0);
  
  // Advanced Touch Tracking (Solves the hyper-sensitivity bug)
  const touchState = useRef({ startX: 0, startY: 0, isScrolling: false, isSwiping: false });

  // Edit States
  const [editRent, setEditRent] = useState(bill.payables ? bill.payables['Lola Flor (Rent & Water)'] : 0);
  const [editElec, setEditElec] = useState(bill.payables ? bill.payables['Meralco (Electricity)'] : 0);
  const [editInt, setEditInt] = useState(bill.payables ? bill.payables['Converge (Internet)'] : 0);

  const handleTouchStart = (e) => { 
    if (isDashboard || isEditing) return;
    touchState.current = {
      startX: e.touches[0].clientX,
      startY: e.touches[0].clientY,
      isScrolling: false,
      isSwiping: false
    };
  };

  const handleTouchMove = (e) => {
    if (isDashboard || isEditing) return;
    
    const deltaX = e.touches[0].clientX - touchState.current.startX;
    const deltaY = e.touches[0].clientY - touchState.current.startY;

    // Detect user's intent within the first few pixels of movement
    if (!touchState.current.isSwiping && !touchState.current.isScrolling) {
      if (Math.abs(deltaY) > Math.abs(deltaX)) {
        touchState.current.isScrolling = true; // User is trying to scroll vertically
      } else if (Math.abs(deltaX) > 15) { 
        touchState.current.isSwiping = true; // User intentionally swiped horizontally past the 15px deadzone
      }
    }

    if (touchState.current.isScrolling) return; // Completely ignore horizontal movement if scrolling

    if (touchState.current.isSwiping) {
      if (deltaX < 0 && deltaX > -120) setSwipeOffset(deltaX);
    }
  };

  const handleTouchEnd = () => {
    if (isDashboard || isEditing || touchState.current.isScrolling) return;
    
    if (swipeOffset < -50) setSwipeOffset(-120); // Snap open if swiped far enough
    else setSwipeOffset(0); // Snap closed if not
    
    touchState.current.isSwiping = false;
  };

  const handleSaveEdit = () => {
    editBill(bill.month, bill.year, parseFloat(editRent), parseFloat(editElec), parseFloat(editInt));
    setIsEditing(false);
    setSwipeOffset(0); 
  };

  const editInputStyle = { padding: '10px', borderRadius: '8px', border: `1px solid ${theme.border}`, backgroundColor: theme.bgApp, color: theme.textMain, width: '100px', fontFamily: "'Outfit', sans-serif" };

  return (
    <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '24px', marginBottom: '16px' }}>
      
      {!isDashboard && (
        <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '120px', display: 'flex', gap: '8px', padding: '0 16px', justifyContent: 'flex-end', alignItems: 'center', backgroundColor: '#ef4444', borderRadius: '24px' }}>
           <button onClick={() => { setIsEditing(true); setSwipeOffset(0); }} style={{ width: '40px', height: '40px', borderRadius: '50%', border: 'none', backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', fontSize: '16px', cursor: 'pointer' }}>✏️</button>
           <button onClick={() => deleteBill(bill.month, bill.year)} style={{ width: '40px', height: '40px', borderRadius: '50%', border: 'none', backgroundColor: 'white', color: '#ef4444', fontSize: '18px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>🗑️</button>
        </div>
      )}

      <div 
        onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}
        style={{ 
          backgroundColor: theme.bgCard, padding: '24px', borderRadius: '24px', 
          border: isDashboard ? '2px solid #3b82f6' : `1px solid ${theme.border}`, 
          color: theme.textMain, position: 'relative', zIndex: 2, 
          transform: `translateX(${swipeOffset}px)`,
          transition: swipeOffset === 0 || swipeOffset === -120 ? 'transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)' : 'none',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          {/* Explicitly bound color to textMain to fix Light Mode bug */}
          <h2 style={{ margin: 0, fontSize: isDashboard ? '26px' : '22px', fontWeight: '800', color: theme.textMain }}>{bill.month} {bill.year}</h2>
          {isDashboard && <span style={{ backgroundColor: '#3b82f6', color: 'white', padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '800', letterSpacing: '0.5px' }}>CURRENT</span>}
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', backgroundColor: theme.highlightBg, padding: '16px 20px', borderRadius: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '12px', color: theme.textSub, textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.5px' }}>Total Due</span>
            <span style={{ fontSize: '22px', fontWeight: '800', color: theme.textMain }}>₱{bill.totalDue}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <span style={{ fontSize: '12px', color: theme.textSub, textTransform: 'uppercase', fontWeight: '600', letterSpacing: '0.5px' }}>Per Head</span>
            <span style={{ fontSize: '22px', fontWeight: '800', color: '#3b82f6' }}>₱{bill.contributionPerHead}</span>
          </div>
        </div>

        {isEditing ? (
          <div style={{ backgroundColor: theme.highlightBg, padding: '20px', borderRadius: '16px', marginBottom: '20px', animation: 'fadeIn 0.3s' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', color: theme.textMain }}><span>Rent & Water:</span><input type="number" value={editRent} onChange={e => setEditRent(e.target.value)} style={editInputStyle} /></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', color: theme.textMain }}><span>Electricity:</span><input type="number" value={editElec} onChange={e => setEditElec(e.target.value)} style={editInputStyle} /></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', color: theme.textMain }}><span>Internet:</span><input type="number" value={editInt} onChange={e => setEditInt(e.target.value)} style={editInputStyle} /></div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={handleSaveEdit} style={{ flex: 1, padding: '12px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '800', cursor: 'pointer' }}>Save</button>
              <button onClick={() => setIsEditing(false)} style={{ flex: 1, padding: '12px', backgroundColor: theme.bgApp, color: theme.textSub, border: `1px solid ${theme.border}`, borderRadius: '12px', fontWeight: '800', cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
        ) : (
          <>
            <button onClick={() => setIsExpanded(!isExpanded)} style={{ width: '100%', padding: '12px', backgroundColor: 'transparent', border: `1px solid ${theme.border}`, borderRadius: '12px', color: theme.textSub, fontWeight: '600', cursor: 'pointer', marginBottom: '20px', transition: '0.2s', fontFamily: "'Outfit', sans-serif" }}>
              {isExpanded ? 'Hide Breakdown ▲' : 'Show Breakdown ▼'}
            </button>
            <div style={{ maxHeight: isExpanded ? '300px' : '0px', opacity: isExpanded ? 1 : 0, overflow: 'hidden', transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)' }}>
              {bill.payables && (
                <div style={{ backgroundColor: theme.highlightBg, padding: '16px', borderRadius: '12px', marginBottom: '20px', fontSize: '15px', color: theme.textMain }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}><span>Rent & Water:</span><strong style={{ fontWeight: '800' }}>₱{bill.payables['Lola Flor (Rent & Water)']}</strong></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}><span>Electricity:</span><strong style={{ fontWeight: '800' }}>₱{bill.payables['Meralco (Electricity)']}</strong></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Internet:</span><strong style={{ fontWeight: '800' }}>₱{bill.payables['Converge (Internet)']}</strong></div>
                </div>
              )}
            </div>
          </>
        )}

        <h4 style={{ margin: '0 0 12px 0', color: theme.textSub, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tap to mark as paid:</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
          {['me', 'sister', 'cousin'].map(person => (
            <button key={person} onClick={() => togglePayment(bill.month, bill.year, person, bill.paymentStatus[person])}
              style={{ padding: '14px 8px', border: 'none', cursor: 'pointer', borderRadius: '14px', fontWeight: '800', fontSize: '14px', transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)', backgroundColor: bill.paymentStatus[person] ? '#10b981' : theme.highlightBg, color: bill.paymentStatus[person] ? 'white' : theme.textSub, fontFamily: "'Outfit', sans-serif", transform: 'scale(1)' }}
              onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.93)'} 
              onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}     
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              onTouchStart={(e) => e.currentTarget.style.transform = 'scale(0.93)'} 
              onTouchEnd={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              {person.charAt(0).toUpperCase() + person.slice(1)}<br/>
              <span style={{ fontSize: '20px', display: 'block', marginTop: '6px' }}>{bill.paymentStatus[person] ? '✓' : '○'}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- MAIN APP ---
function App() {
  const [activeTab, setActiveTab] = useState('home'); 
  const API_BASE = "https://family-bill-api.onrender.com";

  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
  useEffect(() => {
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    document.body.style.backgroundColor = isDarkMode ? '#000000' : '#f4f4f5';
  }, [isDarkMode]);

  const theme = {
    bgApp: isDarkMode ? '#000000' : '#f4f4f5', 
    bgCard: isDarkMode ? '#0a0a0a' : '#ffffff',
    textMain: isDarkMode ? '#ffffff' : '#000000', // Deepened to pitch black for max Light Mode visibility
    textSub: isDarkMode ? '#737373' : '#475569',
    border: isDarkMode ? '#262626' : '#cbd5e1', 
    inputBg: isDarkMode ? '#171717' : '#ffffff',
    highlightBg: isDarkMode ? '#171717' : '#f1f5f9', 
    navBg: isDarkMode ? 'rgba(0,0,0,0.75)' : 'rgba(255,255,255,0.85)',
    glassBorder: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'
  };
  
  // Explicitly bound textMain color to ensure dropdown options don't turn white
  const inputStyle = { padding: '16px', borderRadius: '12px', border: `1px solid ${theme.border}`, backgroundColor: theme.inputBg, color: theme.textMain, width: '100%', boxSizing: 'border-box', fontFamily: "'Outfit', sans-serif", fontSize: '16px' };

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

  const togglePayment = (month, year, person, currentStatus) => {
    const updatedStatus = !currentStatus; 
    const updatedBills = bills.map(b => (b.month === month && b.year === year) ? { ...b, paymentStatus: { ...b.paymentStatus, [person]: updatedStatus } } : b);
    mutate({ status: 'Success', data: updatedBills }, false);
    fetch(`${API_BASE}/bills/update-payment`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ month, year, person, has_paid: updatedStatus }) })
      .then(res => res.json()).then(resData => { if (resData.status === 'Success') mutate(); else throw new Error(); })
      .catch(() => { toast.error("Network error."); mutate(); });
  };

  const handleAddBill = (e) => {
    e.preventDefault();
    const loadingToast = toast.loading("Saving to database...", { style: { background: theme.bgCard, color: theme.textMain, borderRadius: '12px' } });
    fetch(`${API_BASE}/bills/add`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ month, year: parseInt(year), rent_and_water: parseFloat(rentAndWater), electricity: parseFloat(electricity), internet: parseFloat(internet) }) })
      .then(res => res.json()).then(resData => {
        if (resData.status === 'Success') {
          toast.success("Bill saved!", { id: loadingToast, style: { background: theme.bgCard, color: theme.textMain, borderRadius: '12px' } });
          mutate(); setRentAndWater(''); setElectricity(''); setInternet(''); setActiveTab('home'); 
        } else throw new Error();
      }).catch(() => toast.error("Failed to save.", { id: loadingToast }));
  };

  const deleteBill = (month, year) => {
    if (!window.confirm(`Are you sure you want to delete the bill for ${month} ${year}?`)) return;
    const loadingToast = toast.loading("Deleting...", { style: { background: theme.bgCard, color: theme.textMain, borderRadius: '12px' } });
    const updatedBills = bills.filter(b => !(b.month === month && b.year === year));
    mutate({ status: 'Success', data: updatedBills }, false);
    fetch(`${API_BASE}/bills/delete`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ month, year }) })
      .then(res => res.json()).then(resData => { if (resData.status === 'Success') { toast.success("Deleted!", { id: loadingToast }); mutate(); } else throw new Error(); })
      .catch(() => { toast.error("Failed to delete.", { id: loadingToast }); mutate(); });
  };

  const editBill = (month, year, rent, elec, int) => {
    const loadingToast = toast.loading("Updating...", { style: { background: theme.bgCard, color: theme.textMain, borderRadius: '12px' } });
    fetch(`${API_BASE}/bills/edit`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ month, year, rent_and_water: rent, electricity: elec, internet: int }) })
      .then(res => res.json()).then(resData => { if (resData.status === 'Success') { toast.success("Updated!", { id: loadingToast }); mutate(); } else throw new Error(); })
      .catch(() => toast.error("Failed to update.", { id: loadingToast }));
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;800&display=swap');
        @keyframes pulse { 0% { opacity: 0.6; } 50% { opacity: 0.3; } 100% { opacity: 0.6; } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <div style={{ fontFamily: "'Outfit', sans-serif", backgroundColor: theme.bgApp, minHeight: '100vh', paddingBottom: '90px', color: theme.textMain, transition: 'background-color 0.3s' }}>
        <Toaster position="top-center" />

        <div style={{ backgroundColor: theme.navBg, backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', padding: '20px', position: 'sticky', top: 0, zIndex: 50, borderBottom: `1px solid ${theme.glassBorder}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ margin: 0, color: theme.textMain, fontSize: '20px', fontWeight: '800', letterSpacing: '0.5px' }}>⚡ Bills Tracker <span style={{ color: '#3b82f6' }}>by GREG</span></h1>
          <button onClick={() => setIsDarkMode(!isDarkMode)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', padding: '0' }}>{isDarkMode ? '☀️' : '🌙'}</button>
        </div>

        <div style={{ padding: '24px', maxWidth: '600px', margin: '0 auto' }}>
          
          {activeTab === 'home' && (
            <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
              <h3 style={{ marginTop: 0, color: theme.textSub, letterSpacing: '1px', textTransform: 'uppercase', fontSize: '13px', fontWeight: '800' }}>Dashboard</h3>
              
              {!isLoading && chartData.length > 0 && (
                <div style={{ backgroundColor: theme.bgCard, padding: '20px 20px 5px 5px', borderRadius: '24px', marginBottom: '24px', border: `1px solid ${theme.border}`, boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                  <h4 style={{ margin: '0 0 20px 20px', color: theme.textSub, fontSize: '12px', textTransform: 'uppercase', fontWeight: '800', letterSpacing: '0.5px' }}>6-Month Trend (₱)</h4>
                  <ResponsiveContainer width="100%" height={160}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke={theme.border} vertical={false} />
                      {/* Explicit stroke colors on charts to guarantee Light Mode contrast */}
                      <XAxis dataKey="name" stroke={theme.textSub} fontSize={12} tickLine={false} axisLine={false} fontFamily="'Outfit', sans-serif" fontWeight={600} />
                      <YAxis stroke={theme.textSub} fontSize={12} tickLine={false} axisLine={false} width={45} tickFormatter={(v) => `${(v/1000).toFixed(1)}k`} fontFamily="'Outfit', sans-serif" fontWeight={600} />
                      <Tooltip contentStyle={{ backgroundColor: theme.bgApp, border: `1px solid ${theme.border}`, borderRadius: '12px', color: theme.textMain, fontWeight: '600' }} itemStyle={{ color: '#3b82f6', fontWeight: '800' }} />
                      <Line type="monotone" dataKey="Total" stroke="#3b82f6" strokeWidth={4} dot={{ r: 5, fill: '#3b82f6', strokeWidth: 2, stroke: theme.bgCard }} activeDot={{ r: 7 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}

              {error ? <p style={{ color: '#ef4444', fontWeight: 'bold' }}>⚠️ Server is asleep. Please refresh in 60s.</p> : isLoading ? <SkeletonCard theme={theme} /> : currentBill ? <BillCard bill={currentBill} isDashboard={true} togglePayment={togglePayment} deleteBill={deleteBill} editBill={editBill} theme={theme} /> : <p>No bills found.</p>}
            </div>
          )}

          {activeTab === 'history' && (
            <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
              <h3 style={{ marginTop: 0, color: theme.textSub, letterSpacing: '1px', textTransform: 'uppercase', fontSize: '13px', fontWeight: '800' }}>Billing History</h3>
              <p style={{ fontSize: '13px', color: theme.textSub, marginBottom: '20px' }}>*Swipe left on a card to edit or delete.</p>
              {error ? <p style={{ color: '#ef4444', fontWeight: 'bold' }}>⚠️ Server is asleep. Please refresh in 60s.</p> : isLoading ? <><SkeletonCard theme={theme} /><SkeletonCard theme={theme} /></> : bills.map(bill => <BillCard key={bill.id} bill={bill} togglePayment={togglePayment} deleteBill={deleteBill} editBill={editBill} theme={theme} />)}
            </div>
          )}

          {activeTab === 'calculator' && (
             <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
             <h3 style={{ marginTop: 0, color: theme.textSub, letterSpacing: '1px', textTransform: 'uppercase', fontSize: '13px', fontWeight: '800' }}>Quick Calculator</h3>
             <div style={{ backgroundColor: theme.bgCard, padding: '24px', borderRadius: '24px', border: `1px solid ${theme.border}`, boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
               <p style={{ margin: '0 0 20px 0', fontSize: '15px', color: theme.textSub }}>Input amounts to see the split.</p>
               <div style={{ display: 'grid', gap: '16px', marginBottom: '24px' }}>
                 <input type="number" placeholder="Rent & Water (₱)" value={calcRent} onChange={e => setCalcRent(e.target.value)} style={inputStyle} />
                 <input type="number" placeholder="Meralco (₱)" value={calcElec} onChange={e => setCalcElec(e.target.value)} style={inputStyle} />
                 <input type="number" placeholder="Converge (₱)" value={calcInt} onChange={e => setCalcInt(e.target.value)} style={inputStyle} />
               </div>
               <div style={{ backgroundColor: isDarkMode ? '#0f172a' : '#eff6ff', padding: '20px', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', border: `1px solid ${isDarkMode ? '#1e293b' : '#bfdbfe'}` }}>
                 <div><div style={{ fontSize: '12px', color: '#3b82f6', fontWeight: '800', letterSpacing: '0.5px' }}>TOTAL</div><div style={{ fontSize: '26px', fontWeight: '800', color: isDarkMode ? 'white' : '#1e3a8a' }}>₱{calcTotal}</div></div>
                 <div style={{ textAlign: 'right' }}><div style={{ fontSize: '12px', color: '#3b82f6', fontWeight: '800', letterSpacing: '0.5px' }}>PER HEAD (3)</div><div style={{ fontSize: '26px', fontWeight: '800', color: isDarkMode ? 'white' : '#1e3a8a' }}>₱{calcPerHead}</div></div>
               </div>
             </div>
           </div>
          )}

          {activeTab === 'add' && (
            <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
              <h3 style={{ marginTop: 0, color: theme.textSub, letterSpacing: '1px', textTransform: 'uppercase', fontSize: '13px', fontWeight: '800' }}>Add New Month</h3>
              <div style={{ backgroundColor: theme.bgCard, padding: '24px', borderRadius: '24px', border: `1px solid ${theme.border}`, boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                <form onSubmit={handleAddBill} style={{ display: 'grid', gap: '16px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <select required value={month} onChange={e => setMonth(e.target.value)} style={inputStyle}>
                      <option value="" disabled style={{ color: theme.textMain }}>Select Month</option>
                      {monthNames.map(m => (<option key={m} value={m} style={{ color: theme.textMain }}>{m}</option>))}
                    </select>
                    <input required type="number" placeholder="Year" value={year} onChange={e => setYear(e.target.value)} style={inputStyle} />
                  </div>
                  <input required type="number" step="0.01" placeholder="Rent & Water (₱)" value={rentAndWater} onChange={e => setRentAndWater(e.target.value)} style={inputStyle} />
                  <input required type="number" step="0.01" placeholder="Meralco (₱)" value={electricity} onChange={e => setElectricity(e.target.value)} style={inputStyle} />
                  <input required type="number" step="0.01" placeholder="Converge (₱)" value={internet} onChange={e => setInternet(e.target.value)} style={inputStyle} />
                  
                  <button type="submit" style={{ marginTop: '8px', padding: '16px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '800', fontSize: '16px', cursor: 'pointer', fontFamily: "'Outfit', sans-serif", letterSpacing: '0.5px', boxShadow: '0 4px 14px rgba(59, 130, 246, 0.3)' }}>Save to Database</button>
                </form>
              </div>
            </div>
          )}
        </div>

        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: theme.navBg, backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', padding: '15px 5px', borderTop: `1px solid ${theme.glassBorder}`, zIndex: 50, paddingBottom: 'env(safe-area-inset-bottom)' }}>
          {['home', 'history', 'calculator', 'add'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{ background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', color: activeTab === tab ? '#3b82f6' : theme.textSub, fontWeight: activeTab === tab ? '800' : '600', cursor: 'pointer', fontFamily: "'Outfit', sans-serif" }}>
              <span style={{ fontSize: '24px', marginBottom: '4px', transform: activeTab === tab ? 'scale(1.15)' : 'scale(1)', transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)' }}>
                {tab === 'home' ? '🏠' : tab === 'history' ? '📜' : tab === 'calculator' ? '🧮' : '➕'}
              </span>
              <span style={{ fontSize: '11px', textTransform: 'capitalize', letterSpacing: '0.5px' }}>{tab === 'calculator' ? 'Calc' : tab}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

export default App;