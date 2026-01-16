import React, { useState, useEffect } from 'react';

const CATEGORIES = [
  'Kitchen Items',
  'Lamps & Lighting',
  'Office Supplies',
  'Furniture',
  'Sporting Goods',
  'Electronics',
  'Tools',
  'Decor',
  'Clothing',
  'Books & Media',
  'Holiday Items',
  'Outdoor/Garden',
  'Other'
];

const GarageOrganizer = () => {
  const [items, setItems] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', category: 'Kitchen Items', location: '' });
  const [filter, setFilter] = useState('all');

  // Load from memory (in real app, would use localStorage)
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!initialized) {
      // Sample items to demonstrate the app
      setItems([
        { id: 1, name: 'Extra blender', category: 'Kitchen Items', location: 'Box 1', status: 'To Sort', createdAt: new Date().toISOString() },
        { id: 2, name: 'Desk lamp (brass)', category: 'Lamps & Lighting', location: 'Box 2', status: 'To Sort', createdAt: new Date().toISOString() },
      ]);
      setInitialized(true);
    }
  }, [initialized]);

  const addItem = () => {
    if (!newItem.name.trim()) return;

    const item = {
      id: Date.now(),
      name: newItem.name.trim(),
      category: newItem.category,
      location: newItem.location.trim() || 'Unassigned',
      status: 'To Sort',
      createdAt: new Date().toISOString()
    };

    setItems([item, ...items]);
    setNewItem({ name: '', category: newItem.category, location: newItem.location }); // Keep category & location for batch entry
    setShowForm(false);
  };

  const deleteItem = (id) => {
    setItems(items.filter(item => item.id !== id));
  };

  const filteredItems = filter === 'all'
    ? items
    : items.filter(item => item.category === filter);

  const getCategoryCount = (category) => {
    return items.filter(item => item.category === category).length;
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: '#1e293b',
        color: 'white',
        padding: '16px 20px',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}>Garage Organizer</h1>
        <p style={{ margin: '4px 0 0', fontSize: '14px', opacity: 0.8 }}>
          {items.length} items tracked
        </p>
      </div>

      {/* Quick Stats */}
      <div style={{
        display: 'flex',
        gap: '12px',
        padding: '16px 20px',
        overflowX: 'auto',
        backgroundColor: 'white',
        borderBottom: '1px solid #e2e8f0'
      }}>
        <button
          onClick={() => setFilter('all')}
          style={{
            padding: '8px 16px',
            borderRadius: '20px',
            border: 'none',
            backgroundColor: filter === 'all' ? '#3b82f6' : '#e2e8f0',
            color: filter === 'all' ? 'white' : '#475569',
            fontSize: '14px',
            fontWeight: 500,
            cursor: 'pointer',
            whiteSpace: 'nowrap'
          }}
        >
          All ({items.length})
        </button>
        {CATEGORIES.filter(cat => getCategoryCount(cat) > 0).map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              border: 'none',
              backgroundColor: filter === cat ? '#3b82f6' : '#e2e8f0',
              color: filter === cat ? 'white' : '#475569',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            {cat.split(' ')[0]} ({getCategoryCount(cat)})
          </button>
        ))}
      </div>

      {/* Items List */}
      <div style={{ padding: '16px 20px', paddingBottom: '100px' }}>
        {filteredItems.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: '#64748b'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📦</div>
            <p style={{ margin: 0, fontSize: '16px' }}>No items yet</p>
            <p style={{ margin: '8px 0 0', fontSize: '14px' }}>Tap the + button to start adding</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredItems.map(item => (
              <div
                key={item.id}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  padding: '16px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#1e293b' }}>
                      {item.name}
                    </h3>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
                      <span style={{
                        padding: '4px 10px',
                        backgroundColor: '#dbeafe',
                        color: '#1e40af',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: 500
                      }}>
                        {item.category}
                      </span>
                      <span style={{
                        padding: '4px 10px',
                        backgroundColor: '#fef3c7',
                        color: '#92400e',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: 500
                      }}>
                        📍 {item.location}
                      </span>
                      <span style={{
                        padding: '4px 10px',
                        backgroundColor: '#f1f5f9',
                        color: '#64748b',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: 500
                      }}>
                        {item.status}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteItem(item.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '20px',
                      cursor: 'pointer',
                      padding: '4px',
                      opacity: 0.5
                    }}
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Button */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            fontSize: '32px',
            fontWeight: 300,
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          +
        </button>
      )}

      {/* Add Item Form Modal */}
      {showForm && (
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: 'white',
          borderTopLeftRadius: '20px',
          borderTopRightRadius: '20px',
          boxShadow: '0 -4px 20px rgba(0,0,0,0.15)',
          padding: '24px 20px',
          paddingBottom: '40px',
          zIndex: 200
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>Quick Add Item</h2>
            <button
              onClick={() => setShowForm(false)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: '#64748b'
              }}
            >
              ×
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '6px', color: '#475569' }}>
                Item Name *
              </label>
              <input
                type="text"
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                placeholder="e.g., Extra blender, Old desk lamp"
                autoFocus
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  fontSize: '16px',
                  border: '2px solid #e2e8f0',
                  borderRadius: '10px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '6px', color: '#475569' }}>
                Category
              </label>
              <select
                value={newItem.category}
                onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  fontSize: '16px',
                  border: '2px solid #e2e8f0',
                  borderRadius: '10px',
                  outline: 'none',
                  backgroundColor: 'white',
                  boxSizing: 'border-box'
                }}
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '6px', color: '#475569' }}>
                Current Location
              </label>
              <input
                type="text"
                value={newItem.location}
                onChange={(e) => setNewItem({ ...newItem, location: e.target.value })}
                placeholder="e.g., Box 1, Garage shelf, Near door"
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  fontSize: '16px',
                  border: '2px solid #e2e8f0',
                  borderRadius: '10px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
              />
            </div>

            <button
              onClick={addItem}
              disabled={!newItem.name.trim()}
              style={{
                width: '100%',
                padding: '16px',
                fontSize: '16px',
                fontWeight: 600,
                backgroundColor: newItem.name.trim() ? '#3b82f6' : '#cbd5e1',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                cursor: newItem.name.trim() ? 'pointer' : 'not-allowed',
                marginTop: '8px'
              }}
            >
              Add Item
            </button>

            <p style={{
              textAlign: 'center',
              fontSize: '13px',
              color: '#94a3b8',
              margin: '4px 0 0'
            }}>
              Category & location are remembered for batch entry
            </p>
          </div>
        </div>
      )}

      {/* Backdrop for modal */}
      {showForm && (
        <div
          onClick={() => setShowForm(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.3)',
            zIndex: 150
          }}
        />
      )}
    </div>
  );
};

export default GarageOrganizer;
