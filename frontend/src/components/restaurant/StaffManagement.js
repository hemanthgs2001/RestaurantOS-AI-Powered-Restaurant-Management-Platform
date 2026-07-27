import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiUser } from 'react-icons/fi';
import { getStaff, createStaff, updateStaff, deleteStaff } from '../../api/restaurantApi';
import toast from 'react-hot-toast';

// ---- Dropdown option lists ----
const ALL_POSITIONS = ['Chef', 'Waiter', 'Manager', 'Cashier'];
const SHIFT_OPTIONS = ['Morning', 'Evening', 'Night', 'Flexible'];

// ---- Validation helpers ----
// Only allows Gmail addresses, e.g. someone@gmail.com
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
// Only allows exactly 10 digits
const PHONE_REGEX = /^\d{10}$/;

const StaffManagement = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    position: '',
    email: '',
    phone: '',
    hireDate: '',
    salary: 0,
    shift: '',
    isActive: true
  });

  // Position dropdown now includes Manager for everyone
  const positionOptions = ALL_POSITIONS;

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const response = await getStaff();
      setStaff(response.data);
    } catch (error) {
      toast.error('Failed to fetch staff');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};

    if (formData.email && !EMAIL_REGEX.test(formData.email)) {
      errors.email = 'Please enter a valid Gmail address (e.g. name@gmail.com)';
    }

    if (formData.phone && !PHONE_REGEX.test(formData.phone)) {
      errors.phone = 'Phone number must be exactly 10 digits';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    try {
      if (editingStaff) {
        await updateStaff(editingStaff.id, formData);
        toast.success('Staff updated successfully');
      } else {
        await createStaff(formData);
        toast.success('Staff created successfully. A welcome email has been sent.');
      }
      setShowModal(false);
      setEditingStaff(null);
      setFormErrors({});
      setFormData({ name: '', position: '', email: '', phone: '', hireDate: '', salary: 0, shift: '', isActive: true });
      fetchStaff();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this staff member?')) {
      try {
        await deleteStaff(id);
        toast.success('Staff deleted successfully');
        fetchStaff();
      } catch (error) {
        toast.error('Failed to delete staff');
      }
    }
  };

  // Restrict phone input to digits only, max 10 characters
  const handlePhoneChange = (e) => {
    const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 10);
    setFormData({ ...formData, phone: digitsOnly });
  };

  if (loading) return <div className="flex-center" style={{ height: '400px' }}>Loading...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Staff Management</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <FiPlus /> Add Staff
        </button>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Position</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Shift</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {staff.map((member) => (
              <tr key={member.id}>
                <td><strong>{member.name}</strong></td>
                <td>{member.position}</td>
                <td>{member.email}</td>
                <td>{member.phone}</td>
                <td>{member.shift || 'Flexible'}</td>
                <td>
                  <span className={`badge ${member.isActive ? 'badge-success' : 'badge-danger'}`}>
                    {member.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  <button
                    className="btn btn-sm btn-secondary"
                    onClick={() => {
                      setEditingStaff(member);
                      setFormData(member);
                      setFormErrors({});
                      setShowModal(true);
                    }}
                    style={{ marginRight: '0.5rem' }}
                  >
                    <FiEdit2 />
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDelete(member.id)}
                  >
                    <FiTrash2 />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <h2>{editingStaff ? 'Edit Staff' : 'Add Staff'}</h2>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label>Name</label>
                <input
                  type="text"
                  className="input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label>Position</label>
                <select
                  className="input"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  required
                >
                  <option value="">Select Position</option>
                  {positionOptions.map((pos) => (
                    <option key={pos} value={pos}>{pos}</option>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label>Email</label>
                <input
                  type="email"
                  className="input"
                  placeholder="name@gmail.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
                {formErrors.email && (
                  <small style={{ color: '#DC2626' }}>{formErrors.email}</small>
                )}
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label>Phone</label>
                <input
                  type="text"
                  inputMode="numeric"
                  className="input"
                  placeholder="10 digit phone number"
                  maxLength={10}
                  value={formData.phone}
                  onChange={handlePhoneChange}
                />
                {formErrors.phone && (
                  <small style={{ color: '#DC2626' }}>{formErrors.phone}</small>
                )}
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label>Hire Date</label>
                <input
                  type="date"
                  className="input"
                  value={formData.hireDate}
                  onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })}
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label>Salary (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  className="input"
                  value={formData.salary}
                  onChange={(e) => setFormData({ ...formData, salary: parseFloat(e.target.value) })}
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label>Shift</label>
                <select
                  className="input"
                  value={formData.shift}
                  onChange={(e) => setFormData({ ...formData, shift: e.target.value })}
                >
                  <option value="">Select Shift</option>
                  {SHIFT_OPTIONS.map((shift) => (
                    <option key={shift} value={shift}>{shift}</option>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label>
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                  Active
                </label>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  {editingStaff ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowModal(false);
                    setEditingStaff(null);
                    setFormErrors({});
                    setFormData({ name: '', position: '', email: '', phone: '', hireDate: '', salary: 0, shift: '', isActive: true });
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffManagement;