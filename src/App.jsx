import { useState, useEffect } from 'react';

function App() {
  const [bills, setBills] = useState([]);
  
  // Form States
  const [month, setMonth] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [rentAndWater, setRentAndWater] = useState('');
  const [electricity, setElectricity] = useState('');
  const [internet, setInternet] = useState('');

  const fetchBills = () => {
    fetch('https://family-bill-api.onrender.com')
      .then(res => res.json())
      .then(data => {
        if (data.status === 'Success') {
          // Sort bills so the newest appears at the top
          const sorted = data.data.sort((a, b) => b.year - a.year);
          setBills(sorted);
        }
      })
      .catch(err => console.error("Error fetching:", err));
  };

  useEffect(() => { fetchBills(); }, []);

  const togglePayment = (month, year, person, currentStatus) => {
    fetch('https://family-bill-api.onrender.com', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ month, year, person, has_paid: !currentStatus })
    })
    .then(res => res.json())
    .then(data => { if (data.status === 'Success') fetchBills(); })
    .catch(err => console.error("Error updating:", err));
  };

  const handleAddBill = (e) => {
    e.preventDefault(); // Prevents the page from refreshing on submit
    
    fetch('https://family-bill-api.onrender.com', {
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
        fetchBills(); // Refresh list to show new bill
        // Clear the form
        setMonth(''); setRentAndWater(''); setElectricity(''); setInternet('');
      }
    })
    .catch(err => console.error("Error adding bill:", err));
  };

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '20px', fontFamily: 'system-ui' }}>
      <h1 style={{ textAlign: 'center', color: '#333' }}>Family Bill Tracker</h1>
      
      {/* ADD NEW BILL FORM */}
      <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '10px', marginBottom: '30px', border: '1px solid #e2e8f0' }}>
        <h3 style={{ marginTop: 0, color: '#0f172a' }}>➕ Add New Month</h3>
        <form onSubmit={handleAddBill} style={{ display: 'grid', gap: '10px', gridTemplateColumns: '1fr 1fr' }}>
          <input required placeholder="Month (e.g. October)" value={month} onChange={e => setMonth(e.target.value)} style={{ padding: '8px' }} />
          <input required type="number" placeholder="Year" value={year} onChange={e => setYear(e.target.value)} style={{ padding: '8px' }} />
          <input required type="number" step="0.01" placeholder="Rent & Water (₱)" value={rentAndWater} onChange={e => setRentAndWater(e.target.value)} style={{ padding: '8px' }} />
          <input required type="number" step="0.01" placeholder="Electricity (₱)" value={electricity} onChange={e => setElectricity(e.target.value)} style={{ padding: '8px' }} />
          <input required type="number" step="0.01" placeholder="Internet (₱)" value={internet} onChange={e => setInternet(e.target.value)} style={{ padding: '8px', gridColumn: 'span 2' }} />
          <button type="submit" style={{ gridColumn: 'span 2', padding: '10px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>Save Bill to Database</button>
        </form>
      </div>

      {/* BILL LIST */}
      {bills.length === 0 ? <p style={{ textAlign: 'center' }}>Loading...</p> : (
        bills.map((bill) => (
          <div key={bill.id} style={{ border: '1px solid #ddd', padding: '20px', margin: '20px 0', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            <h2 style={{ margin: '0 0 10px 0', color: '#2563eb' }}>{bill.month} {bill.year}</h2>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
              <span><strong>Total Due:</strong> ₱{bill.totalDue}</span>
              <span><strong>Your Share:</strong> ₱{bill.contributionPerHead}</span>
            </div>
            <h4 style={{ margin: '0 0 10px 0' }}>Payment Status:</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', textAlign: 'center' }}>
              {['me', 'sister', 'cousin'].map(person => (
                <button key={person} onClick={() => togglePayment(bill.month, bill.year, person, bill.paymentStatus[person])}
                  style={{ padding: '10px', border: 'none', cursor: 'pointer', backgroundColor: bill.paymentStatus[person] ? '#dcfce7' : '#fee2e2', borderRadius: '5px', fontWeight: 'bold' }}>
                  {person.charAt(0).toUpperCase() + person.slice(1)}<br/>{bill.paymentStatus[person] ? '✅ Paid' : '❌ Unpaid'}
                </button>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default App;