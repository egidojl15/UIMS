import { Eye, Edit2, Trash2 } from 'lucide-react';

export default function ResidentsTable({ residents, onView, onEdit, onDelete }) {
  return (
    <div className="overflow-x-auto rounded-xl shadow-md">
      <table className="min-w-full bg-white rounded-xl">
        <thead>
          <tr className="bg-gray-200 text-gray-700">
            <th className="py-3 px-4 text-left">Full Name</th>
            <th className="py-3 px-4 text-left">Age</th>
            <th className="py-3 px-4 text-left">Gender</th>
            <th className="py-3 px-4 text-left">Purok</th>
            <th className="py-3 px-4 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {residents.length === 0 ? (
            <tr>
              <td colSpan="5" className="text-center py-6 text-gray-500">
                No residents found.
              </td>
            </tr>
          ) : (
            residents.map((resident) => (
              <tr key={resident.resident_id} className="hover:bg-gray-50">
                <td className="py-3 px-4">{resident.full_name}</td>
                <td className="py-3 px-4">{resident.age}</td>
                <td className="py-3 px-4">{resident.gender}</td>
                <td className="py-3 px-4">{resident.purok}</td>
                <td className="py-3 px-4 space-x-2">
                  <button
                    className="p-2 text-blue-500 hover:text-blue-700"
                    onClick={() => onView(resident)}
                  >
                    <Eye size={18} />
                  </button>
                  <button
                    className="p-2 text-green-500 hover:text-green-700"
                    onClick={() => onEdit(resident)}
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    className="p-2 text-red-500 hover:text-red-700"
                    onClick={() => onDelete(resident.resident_id)}
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
