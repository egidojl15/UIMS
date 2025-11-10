import { useState } from 'react';

export default function ResidentForm({ onSave }) {
  const [form, setForm] = useState({
    full_name: '',
    birthdate: '',
    gender: '',
    purok: '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
    setForm({ full_name: '', birthdate: '', gender: '', purok: '' });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded-xl shadow-md">
      <h2 className="text-lg font-bold mb-3">Add Resident</h2>
      <div className="grid grid-cols-2 gap-4">
        <input
          type="text"
          name="full_name"
          placeholder="Full Name"
          value={form.full_name}
          onChange={handleChange}
          className="p-2 border rounded"
          required
        />
        <input
          type="date"
          name="birthdate"
          value={form.birthdate}
          onChange={handleChange}
          className="p-2 border rounded"
          required
        />
        <select
          name="gender"
          value={form.gender}
          onChange={handleChange}
          className="p-2 border rounded"
          required
        >
          <option value="">Select Gender</option>
          <option>Male</option>
          <option>Female</option>
        </select>
        <input
          type="text"
          name="purok"
          placeholder="Purok"
          value={form.purok}
          onChange={handleChange}
          className="p-2 border rounded"
          required
        />
      </div>
      <button
        type="submit"
        className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl"
      >
        Save
      </button>
    </form>
  );
}
