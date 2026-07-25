import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiHome } from 'react-icons/fi';
import { getWarehouses, createWarehouse, updateWarehouse, deleteWarehouse } from '../../api/inventoryApi';
import toast from 'react-hot-toast';

const WarehouseManagement = () => {
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    manager: '',
    capacity: 0,
    isActive: true
  });

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const fetchWarehouses = async () => {
    try {
      setLoading(true);
      const response = await getWarehouses();
      setWarehouses(response.data);
    } catch (error) {
      toast.error('Failed to fetch warehouses');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingWarehouse) {
        await updateWarehouse(editingWarehouse.id, formData);
        toast.success('Warehouse updated successfully');
      } else {
        await createWarehouse(formData);
        toast.success('Warehouse created successfully');
      }
      setShowModal(false);
      setEditingWarehouse(null);
      setFormData({ name: '', location: '', manager: '', capacity: 0, isActive: true });
      fetchWarehouses();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this warehouse?')) {
      try {
        await deleteWarehouse(id);
        toast.success('Warehouse deleted successfully');
        fetchWarehouses();
      } catch (error) {
        toast.error('Failed to delete warehouse');
      }
    }
  };

  if (loading) return <div className="flex-center" style={{ height: '400px' }}>Loading...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Warehouse Management</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <FiPlus /> Add Warehouse
        </button>
      </div>

      <div className="grid-3">
        {warehouses.map((warehouse) => (
          <div key={warehouse.id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <div>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FiHome /> {warehouse.name}
                </h3>
                <span className={`badge ${warehouse.isActive ? 'badge-success' : 'badge-danger'}`}>
                  {warehouse.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div>
                <button
                  className="btn btn-sm btn-secondary"
                  onClick={() => {
                    setEditingWarehouse(warehouse);
                    setFormData(warehouse);
                    setShowModal(true);
                  }}
                  style={{ marginRight: '0.5rem' }}
                >
                  <FiEdit2 />
                </button>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => handleDelete(warehouse.id)}
                >
                  <FiTrash2 />
                </button>
              </div>
            </div>
            <div style={{ marginTop: '0.5rem' }}>
              <p style={{ color: '#6B7280' }}>Location: {warehouse.location || 'Not specified'}</p>
              <p style={{ color: '#6B7280' }}>Manager: {warehouse.manager || 'Not assigned'}</p>
              <p style={{ color: '#6B7280' }}>Capacity: {warehouse.capacity || 0} units</p>
            </div>
          </div>
        ))}
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
            width: '90%'
          }}>
            <h2>{editingWarehouse ? 'Edit Warehouse' : 'Add Warehouse'}</h2>
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
                <label>Location</label>
                <input
                  type="text"
                  className="input"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label>Manager</label>
                <input
                  type="text"
                  className="input"
                  value={formData.manager}
                  onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label>Capacity</label>
                <input
                  type="number"
                  className="input"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                />
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
                  {editingWarehouse ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowModal(false);
                    setEditingWarehouse(null);
                    setFormData({ name: '', location: '', manager: '', capacity: 0, isActive: true });
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

export default WarehouseManagement;