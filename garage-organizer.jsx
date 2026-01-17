import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  onSnapshot
} from 'firebase/firestore';

// ⚠️ SETUP REQUIRED: Replace with your Firebase config
// Get this from: Firebase Console > Project Settings > Your Apps > Web App
const firebaseConfig = {
  apiKey: "AIzaSyDu8GnqAj_BQ7UddUA7GYwr70wbM6NXTic",
  authDomain: "garaj-9f6ac.firebaseapp.com",
  projectId: "garaj-9f6ac",
  storageBucket: "garaj-9f6ac.firebasestorage.app",
  messagingSenderId: "250262045467",
  appId: "1:250262045467:web:53eec3243853c2932f89be"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

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

const DISPOSITIONS = [
  { value: 'To Sort', label: 'To Sort', color: '#f1f5f9', textColor: '#64748b', icon: '📦' },
  { value: 'Keep', label: 'Keep', color: '#dcfce7', textColor: '#166534', icon: '✓' },
  { value: 'Sell', label: 'Sell', color: '#fef3c7', textColor: '#92400e', icon: '💰' },
  { value: 'Donate', label: 'Donate', color: '#dbeafe', textColor: '#1e40af', icon: '🎁' },
  { value: 'Dump', label: 'Dump', color: '#fee2e2', textColor: '#991b1b', icon: '🗑️' }
];

const GarageOrganizer = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', category: 'Kitchen Items', location: '' });
  const [filter, setFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editingItem, setEditingItem] = useState(null);

  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Firestore listener for items
  useEffect(() => {
    if (!user) {
      setItems([]);
      return;
    }

    const itemsRef = collection(db, 'users', user.uid, 'items');
    const q = query(itemsRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const itemsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setItems(itemsList);
    });

    return () => unsubscribe();
  }, [user]);

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Sign in error:', error);
      alert('Failed to sign in. Please try again.');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const addItem = async () => {
    if (!newItem.name.trim() || !user) return;

    try {
      const itemsRef = collection(db, 'users', user.uid, 'items');
      await addDoc(itemsRef, {
        name: newItem.name.trim(),
        category: newItem.category,
        location: newItem.location.trim() || 'Unassigned',
        status: 'To Sort',
        destination: '',
        notes: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      setNewItem({ name: '', category: newItem.category, location: newItem.location });
      setShowForm(false);
    } catch (error) {
      console.error('Error adding item:', error);
      alert('Failed to add item. Please try again.');
    }
  };

  const updateItemStatus = async (itemId, newStatus) => {
    if (!user) return;

    try {
      const itemRef = doc(db, 'users', user.uid, 'items', itemId);
      await updateDoc(itemRef, {
        status: newStatus,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating item:', error);
    }
  };

  const updateItemDestination = async (itemId, destination) => {
    if (!user) return;

    try {
      const itemRef = doc(db, 'users', user.uid, 'items', itemId);
      await updateDoc(itemRef, {
        destination: destination,
        updatedAt: new Date().toISOString()
      });
      setEditingItem(null);
    } catch (error) {
      console.error('Error updating destination:', error);
    }
  };

  const deleteItem = async (itemId) => {
    if (!user) return;

    try {
      const itemRef = doc(db, 'users', user.uid, 'items', itemId);
      await deleteDoc(itemRef);
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const filteredItems = items.filter(item => {
    const categoryMatch = filter === 'all' || item.category === filter;
    const statusMatch = statusFilter === 'all' || item.status === statusFilter;
    return categoryMatch && statusMatch;
  });

  const getCategoryCount = (category) => {
    return items.filter(item => item.category === category).length;
  };

  const getStatusCount = (status) => {
    return items.filter(item => item.status === status).length;
  };

  const getDisposition = (status) => {
    return DISPOSITIONS.find(d => d.value === status) || DISPOSITIONS[0];
  };

  // Loading state
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#f8fafc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📦</div>
          <p style={{ color: '#64748b' }}>Loading...</p>
        </div>
      </div>
    );
  }

  // Login screen
  if (!user) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#f8fafc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        padding: '20px'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '20px',
          padding: '40px 32px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          textAlign: 'center',
          maxWidth: '360px',
          width: '100%'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '24px' }}>📦</div>
          <h1 style={{ margin: '0 0 8px', fontSize: '28px', fontWeight: 700, color: '#1e293b' }}>
            Garage Organizer
          </h1>
          <p style={{ margin: '0 0 32px', fontSize: '16px', color: '#64748b' }}>
            Catalog your stuff, decide what stays
          </p>

          <button
            onClick={signInWithGoogle}
            style={{
              width: '100%',
              padding: '14px 24px',
              fontSize: '16px',
              fontWeight: 600,
              backgroundColor: 'white',
              color: '#1e293b',
              border: '2px solid #e2e8f0',
              borderRadius: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#f8fafc'}
            onMouseOut={(e) => e.target.style.backgroundColor = 'white'}
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign in with Google
          </button>

          <p style={{ margin: '24px 0 0', fontSize: '13px', color: '#94a3b8' }}>
            Your data is stored securely in your own Firebase account
          </p>
        </div>
      </div>
    );
  }

  // Main app
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}>Garage Organizer</h1>
            <p style={{ margin: '4px 0 0', fontSize: '14px', opacity: 0.8 }}>
              {items.length} items • {getStatusCount('To Sort')} to sort
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img
              src={user.photoURL}
              alt=""
              style={{ width: '32px', height: '32px', borderRadius: '50%' }}
            />
            <button
              onClick={handleSignOut}
              style={{
                padding: '6px 12px',
                fontSize: '13px',
                backgroundColor: 'rgba(255,255,255,0.1)',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Sign out
            </button>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{
        backgroundColor: 'white',
        padding: '16px 20px',
        borderBottom: '1px solid #e2e8f0'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '14px', fontWeight: 500, color: '#475569' }}>Sorting Progress</span>
          <span style={{ fontSize: '14px', color: '#64748b' }}>
            {items.length - getStatusCount('To Sort')} of {items.length} decided
          </span>
        </div>
        <div style={{
          height: '8px',
          backgroundColor: '#e2e8f0',
          borderRadius: '4px',
          overflow: 'hidden',
          display: 'flex'
        }}>
          {DISPOSITIONS.slice(1).map(disp => {
            const count = getStatusCount(disp.value);
            const percent = items.length > 0 ? (count / items.length) * 100 : 0;
            return (
              <div
                key={disp.value}
                style={{
                  width: `${percent}%`,
                  backgroundColor: disp.textColor,
                  transition: 'width 0.3s'
                }}
                title={`${disp.label}: ${count}`}
              />
            );
          })}
        </div>
        <div style={{ display: 'flex', gap: '16px', marginTop: '12px', flexWrap: 'wrap' }}>
          {DISPOSITIONS.slice(1).map(disp => (
            <span key={disp.value} style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: disp.textColor }}></span>
              {disp.label}: {getStatusCount(disp.value)}
            </span>
          ))}
        </div>
      </div>

      {/* Status Filter Pills */}
      <div style={{
        display: 'flex',
        gap: '8px',
        padding: '12px 20px',
        overflowX: 'auto',
        backgroundColor: 'white',
        borderBottom: '1px solid #e2e8f0'
      }}>
        <button
          onClick={() => setStatusFilter('all')}
          style={{
            padding: '6px 14px',
            borderRadius: '16px',
            border: 'none',
            backgroundColor: statusFilter === 'all' ? '#1e293b' : '#f1f5f9',
            color: statusFilter === 'all' ? 'white' : '#475569',
            fontSize: '13px',
            fontWeight: 500,
            cursor: 'pointer',
            whiteSpace: 'nowrap'
          }}
        >
          All Status
        </button>
        {DISPOSITIONS.map(disp => (
          <button
            key={disp.value}
            onClick={() => setStatusFilter(disp.value)}
            style={{
              padding: '6px 14px',
              borderRadius: '16px',
              border: 'none',
              backgroundColor: statusFilter === disp.value ? disp.color : '#f1f5f9',
              color: statusFilter === disp.value ? disp.textColor : '#475569',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            {disp.icon} {disp.label} ({getStatusCount(disp.value)})
          </button>
        ))}
      </div>

      {/* Category Filter */}
      <div style={{
        display: 'flex',
        gap: '8px',
        padding: '12px 20px',
        overflowX: 'auto',
        backgroundColor: '#f8fafc'
      }}>
        <button
          onClick={() => setFilter('all')}
          style={{
            padding: '6px 14px',
            borderRadius: '16px',
            border: 'none',
            backgroundColor: filter === 'all' ? '#3b82f6' : 'white',
            color: filter === 'all' ? 'white' : '#475569',
            fontSize: '13px',
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
              padding: '6px 14px',
              borderRadius: '16px',
              border: 'none',
              backgroundColor: filter === cat ? '#3b82f6' : 'white',
              color: filter === cat ? 'white' : '#475569',
              fontSize: '13px',
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
            <p style={{ margin: 0, fontSize: '16px' }}>
              {items.length === 0 ? 'No items yet' : 'No items match filters'}
            </p>
            <p style={{ margin: '8px 0 0', fontSize: '14px' }}>
              {items.length === 0 ? 'Tap the + button to start adding' : 'Try adjusting your filters'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredItems.map(item => {
              const disp = getDisposition(item.status);
              return (
                <div
                  key={item.id}
                  style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    padding: '16px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    borderLeft: `4px solid ${disp.textColor}`
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
                        {item.destination && (
                          <span style={{
                            padding: '4px 10px',
                            backgroundColor: '#dcfce7',
                            color: '#166534',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: 500
                          }}>
                            → {item.destination}
                          </span>
                        )}
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

                  {/* Decision Buttons */}
                  <div style={{
                    display: 'flex',
                    gap: '8px',
                    marginTop: '12px',
                    flexWrap: 'wrap'
                  }}>
                    {DISPOSITIONS.map(d => (
                      <button
                        key={d.value}
                        onClick={() => updateItemStatus(item.id, d.value)}
                        style={{
                          padding: '8px 12px',
                          borderRadius: '8px',
                          border: item.status === d.value ? `2px solid ${d.textColor}` : '2px solid transparent',
                          backgroundColor: d.color,
                          color: d.textColor,
                          fontSize: '13px',
                          fontWeight: 500,
                          cursor: 'pointer',
                          opacity: item.status === d.value ? 1 : 0.7
                        }}
                      >
                        {d.icon} {d.label}
                      </button>
                    ))}
                  </div>

                  {/* Destination input for Keep items */}
                  {item.status === 'Keep' && (
                    <div style={{ marginTop: '12px' }}>
                      {editingItem === item.id ? (
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <input
                            type="text"
                            defaultValue={item.destination}
                            placeholder="Where will it go? (e.g., Hall closet)"
                            autoFocus
                            style={{
                              flex: 1,
                              padding: '10px 12px',
                              fontSize: '14px',
                              border: '2px solid #e2e8f0',
                              borderRadius: '8px',
                              outline: 'none'
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                updateItemDestination(item.id, e.target.value);
                              } else if (e.key === 'Escape') {
                                setEditingItem(null);
                              }
                            }}
                            onBlur={(e) => updateItemDestination(item.id, e.target.value)}
                          />
                        </div>
                      ) : (
                        <button
                          onClick={() => setEditingItem(item.id)}
                          style={{
                            padding: '8px 12px',
                            fontSize: '13px',
                            backgroundColor: '#f1f5f9',
                            color: '#64748b',
                            border: '1px dashed #cbd5e1',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            width: '100%',
                            textAlign: 'left'
                          }}
                        >
                          {item.destination ? `📍 Destination: ${item.destination} (tap to edit)` : '+ Add destination (where will it go?)'}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
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
                onKeyDown={(e) => {
                  if (e.key === 'Enter') addItem();
                }}
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
              Category & location stay selected for batch entry
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
