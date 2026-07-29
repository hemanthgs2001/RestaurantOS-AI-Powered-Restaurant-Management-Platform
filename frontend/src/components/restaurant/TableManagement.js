import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiCheck, FiX, FiClock } from 'react-icons/fi';
import { getTables, createTable, updateTable, deleteTable, updateTableStatus } from '../../api/restaurantApi';
import toast from 'react-hot-toast';

// Fixed list of sections shown in the dropdown. Adjust to match your venue.
const SECTIONS = ['Main', 'Patio', 'VIP', 'Outdoor', 'Private'];

// Each section can hold at most this many tables.
const MAX_TABLES_PER_SECTION = 10;

// A reservation only asks for a date + in-time; the out-time (when the
// table auto-frees) is computed automatically as in-time + this duration.
// Change this single value to adjust the default booking slot length.
const DEFAULT_BOOKING_DURATION_HOURS = 12;

// Statuses a table can hold. "Occupied" has been removed - a table is
// either open for walk-ins (available), booked for a time window
// (reserved), or taken out of service (maintenance).
const STATUS_OPTIONS = ['available', 'reserved', 'maintenance','occupied'];

// How often to re-fetch tables so reservations that have passed their
// out-time automatically flip back to "available" in the UI (the backend
// also auto-releases on every fetch - this just keeps the screen fresh
// without requiring a manual refresh or manual status change).
const REFRESH_INTERVAL_MS = 30000;

const DEFAULT_FORM_STATE = {
  tableNumber: '',
  capacity: 4,
  section: SECTIONS[0],
  status: 'available'
};

const TableManagement = () => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTable, setEditingTable] = useState(null);
  const [formData, setFormData] = useState(DEFAULT_FORM_STATE);

  // Only used when creating a new table with status = 'reserved', so the
  // reservation window is set in the same step the table is created -
  // it never sits briefly as "available" for someone else to grab.
  const [newBookingDate, setNewBookingDate] = useState('');
  const [newBookingInTime, setNewBookingInTime] = useState('');

  // Booking modal state - shown when an EXISTING table's status is
  // switched to "reserved" from the list, so we can capture date + in-time.
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingTable, setBookingTable] = useState(null);
  const [bookingDate, setBookingDate] = useState('');
  const [inTimeInput, setInTimeInput] = useState('');

  useEffect(() => {
    fetchTables();
    const interval = setInterval(fetchTables, REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  const fetchTables = async () => {
    try {
      setLoading(true);
      const response = await getTables();
      setTables(response.data);
    } catch (error) {
      toast.error('Failed to fetch tables');
    } finally {
      setLoading(false);
    }
  };

  // Counts of tables per section - used to enforce the 10-per-section cap
  // and to show live "X/10 available" info next to the section dropdown.
  const getSectionCounts = () => {
    const counts = {};
    SECTIONS.forEach((s) => { counts[s] = { total: 0, available: 0 }; });
    tables.forEach((t) => {
      const key = t.section;
      if (!counts[key]) counts[key] = { total: 0, available: 0 };
      counts[key].total += 1;
      if (t.status === 'available') counts[key].available += 1;
    });
    return counts;
  };
  const sectionCounts = getSectionCounts();

  const combineDateTime = (dateStr, timeStr) => new Date(`${dateStr}T${timeStr}`);

  // Out-time is derived automatically - in-time plus the default slot length.
  const computeOutDateTime = (inDateTime) =>
    new Date(inDateTime.getTime() + DEFAULT_BOOKING_DURATION_HOURS * 60 * 60 * 1000);

  const resetCreateForm = () => {
    setShowModal(false);
    setEditingTable(null);
    setFormData(DEFAULT_FORM_STATE);
    setNewBookingDate('');
    setNewBookingInTime('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const targetSection = formData.section;
    const isChangingSection = !editingTable || editingTable.section !== targetSection;
    const countInSection = tables.filter(
      (t) => t.section === targetSection && (!editingTable || t.id !== editingTable.id)
    ).length;

    if (isChangingSection && countInSection >= MAX_TABLES_PER_SECTION) {
      toast.error(`${targetSection} section already has the maximum of ${MAX_TABLES_PER_SECTION} tables`);
      return;
    }

    const payload = { ...formData };

    // Creating a new table as "Reserved" - status and the reservation
    // window are both set here, in one step.
    if (!editingTable && formData.status === 'reserved') {
      if (!newBookingDate || !newBookingInTime) {
        toast.error('Please select a date and in-time for the reservation');
        return;
      }
      const inDateTime = combineDateTime(newBookingDate, newBookingInTime);
      payload.inTime = inDateTime.toISOString();
    }

    try {
      if (editingTable) {
        await updateTable(editingTable.id, payload);
        toast.success('Table updated successfully');
      } else {
        await createTable(payload);
        toast.success(formData.status === 'reserved' ? 'Table created and reserved' : 'Table created successfully');
      }
      resetCreateForm();
      fetchTables();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this table?')) {
      try {
        await deleteTable(id);
        toast.success('Table deleted successfully');
        fetchTables();
      } catch (error) {
        toast.error('Failed to delete table');
      }
    }
  };

  // status: 'available' | 'reserved' | 'maintenance'
  // inTime: ISO string, only used (and required) for 'reserved'
  const handleStatusChange = async (id, status, inTime = null) => {
    try {
      const payload = { status };
      if (status === 'reserved') {
        payload.inTime = inTime;
      }
      await updateTableStatus(id, payload);
      toast.success(status === 'reserved' ? 'Table reserved' : 'Table status updated');
      fetchTables();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  // Intercepts status changes from an existing table's row dropdown.
  // "Reserved" needs a date + in-time first, everything else applies
  // immediately.
  const onStatusSelect = (table, newStatus) => {
    if (newStatus === 'reserved') {
      setBookingTable(table);
      setBookingDate(new Date().toISOString().slice(0, 10));
      setInTimeInput('');
      setShowBookingModal(true);
    } else {
      handleStatusChange(table.id, newStatus);
    }
  };

  const confirmBooking = async () => {
    if (!bookingDate || !inTimeInput) {
      toast.error('Please select a date and in-time');
      return;
    }

    const inDateTime = combineDateTime(bookingDate, inTimeInput);
    await handleStatusChange(bookingTable.id, 'reserved', inDateTime.toISOString());
    cancelBooking();
  };

  const cancelBooking = () => {
    setShowBookingModal(false);
    setBookingTable(null);
    setBookingDate('');
    setInTimeInput('');
  };

  const getStatusBadge = (status) => {
    const badges = {
      available: 'badge-success',
      occupied: 'badge-danger',
      reserved: 'badge-warning',
      maintenance: 'badge-info'
    };
    return badges[status] || 'badge-info';
  };

  const formatDateTime = (value) => {
    if (!value) return '-';
    return new Date(value).toLocaleString();
  };

  if (loading) return <div className="flex-center" style={{ height: '400px' }}>Loading...</div>;

  const totalTables = tables.length;
  const availableCount = tables.filter((t) => t.status === 'available').length;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h1>Table Management</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <FiPlus /> Add Table
        </button>
      </div>

      {/* Live available table counter */}
      <div
        className="badge badge-success"
        style={{
          display: 'inline-block',
          fontSize: '0.95rem',
          padding: '0.5rem 1rem',
          marginBottom: '0.75rem'
        }}
      >
        {availableCount} of {totalTables} tables available
      </div>

      {/* Per-section capacity breakdown */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        {SECTIONS.map((section) => {
          const count = sectionCounts[section] || { total: 0, available: 0 };
          return (
            <span
              key={section}
              className="badge badge-info"
              style={{ padding: '0.4rem 0.75rem' }}
            >
              {section}: {count.available} avail · {count.total}/{MAX_TABLES_PER_SECTION} tables
            </span>
          );
        })}
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Table #</th>
              <th>Capacity</th>
              <th>Section</th>
              <th>Status</th>
              <th>In-Time</th>
              <th>Out-Time</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tables.map((table) => (
              <tr key={table.id}>
                <td><strong>{table.tableNumber}</strong></td>
                <td>{table.capacity} seats</td>
                <td>{table.section || 'Main'}</td>
                <td>
                  {table.status === 'reserved' ? (
                    <span
                      className={`badge ${getStatusBadge('reserved')}`}
                      title="Auto-frees at out-time, cannot be changed manually"
                    >
                      <FiClock /> Reserved
                    </span>
                  ) : (
                    <select
                      className={`badge ${getStatusBadge(table.status)}`}
                      value={table.status}
                      onChange={(e) => onStatusSelect(table, e.target.value)}
                      style={{ cursor: 'pointer', border: 'none' }}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                      ))}
                    </select>
                  )}
                </td>
                <td>{formatDateTime(table.bookedAt)}</td>
                <td>{formatDateTime(table.outTime)}</td>
                <td>
                  <button
                    className="btn btn-sm btn-secondary"
                    onClick={() => {
                      setEditingTable(table);
                      setFormData(table);
                      setShowModal(true);
                    }}
                    style={{ marginRight: '0.5rem' }}
                  >
                    <FiEdit2 />
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDelete(table.id)}
                  >
                    <FiTrash2 />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Table Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '12px',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <h2>{editingTable ? 'Edit Table' : 'Add New Table'}</h2>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label>Table Number</label>
                <input
                  type="number"
                  className="input"
                  value={formData.tableNumber}
                  onChange={(e) => setFormData({ ...formData, tableNumber: parseInt(e.target.value) })}
                  required
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label>Capacity</label>
                <input
                  type="number"
                  className="input"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                  required
                  min="1"
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label>Section</label>
                <select
                  className="input"
                  value={formData.section || SECTIONS[0]}
                  onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                >
                  {SECTIONS.map((section) => {
                    const count = sectionCounts[section] || { total: 0 };
                    const isFull = count.total >= MAX_TABLES_PER_SECTION
                      && (!editingTable || editingTable.section !== section);
                    return (
                      <option key={section} value={section} disabled={isFull}>
                        {section} ({count.total}/{MAX_TABLES_PER_SECTION}{isFull ? ' - full' : ''})
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Status is only chosen at creation time, so a table never
                  briefly sits "available" before its real status is set. */}
              {!editingTable && (
                <>
                  <div style={{ marginBottom: '1rem' }}>
                    <label>Status</label>
                    <select
                      className="input"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                      ))}
                    </select>
                  </div>

                  {formData.status === 'reserved' && (
                    <>
                      <div style={{ marginBottom: '1rem' }}>
                        <label>Date</label>
                        <input
                          type="date"
                          className="input"
                          value={newBookingDate}
                          onChange={(e) => setNewBookingDate(e.target.value)}
                          required
                        />
                      </div>
                      <div style={{ marginBottom: '1rem' }}>
                        <label>In-Time</label>
                        <input
                          type="time"
                          className="input"
                          value={newBookingInTime}
                          onChange={(e) => setNewBookingInTime(e.target.value)}
                          required
                        />
                      </div>
                      {newBookingDate && newBookingInTime && (
                        <p style={{ fontSize: '0.85rem', color: '#666' }}>
                          Table auto-frees at: <strong>
                            {computeOutDateTime(combineDateTime(newBookingDate, newBookingInTime)).toLocaleString()}
                          </strong>
                        </p>
                      )}
                    </>
                  )}
                </>
              )}

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  {editingTable ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={resetCreateForm}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Booking Modal - captures date and in-time when reserving an
          EXISTING table from the row status dropdown. Out-time is
          auto-computed (in-time + DEFAULT_BOOKING_DURATION_HOURS). Status
          auto-reverts to "available" once that out-time passes; there is
          no manual override. */}
      {showBookingModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '12px',
            maxWidth: '450px',
            width: '90%'
          }}>
            <h2>Reserve Table {bookingTable?.tableNumber}</h2>
            <p style={{ marginTop: '0.5rem', color: '#666' }}>
              This table will show as <strong>Reserved</strong> and automatically become
              <strong> Available</strong> again after a {DEFAULT_BOOKING_DURATION_HOURS}-hour slot -
              no manual step needed.
            </p>
            <div style={{ marginBottom: '1rem', marginTop: '1rem' }}>
              <label>Date</label>
              <input
                type="date"
                className="input"
                value={bookingDate}
                onChange={(e) => setBookingDate(e.target.value)}
                required
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label>In-Time</label>
              <input
                type="time"
                className="input"
                value={inTimeInput}
                onChange={(e) => setInTimeInput(e.target.value)}
                required
              />
            </div>
            {bookingDate && inTimeInput && (
              <p style={{ fontSize: '0.85rem', color: '#666' }}>
                Table auto-frees at: <strong>
                  {computeOutDateTime(combineDateTime(bookingDate, inTimeInput)).toLocaleString()}
                </strong>
              </p>
            )}
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <button
                type="button"
                className="btn btn-primary"
                style={{ flex: 1 }}
                onClick={confirmBooking}
              >
                <FiCheck /> Confirm Reservation
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={cancelBooking}
              >
                <FiX /> Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TableManagement;