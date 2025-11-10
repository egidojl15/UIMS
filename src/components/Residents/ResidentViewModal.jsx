export default function ResidentViewModal({ resident, onClose }) {
  if (!resident) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white p-6 rounded-xl w-96 shadow-lg">
        <h2 className="text-lg font-bold mb-4">Resident Details</h2>
        <p><strong>Name:</strong> {resident.full_name}</p>
        <p><strong>Age:</strong> {resident.age}</p>
        <p><strong>Gender:</strong> {resident.gender}</p>
        <p><strong>Purok:</strong> {resident.purok}</p>
        <button
          onClick={onClose}
          className="mt-4 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-xl"
        >
          Close
        </button>
      </div>
    </div>
  );
}
