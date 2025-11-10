import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import api from "../services/api";

// Modal component with portal rendering
const Modal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = "max-w-4xl",
}) => {
  if (!isOpen) return null;

  const modalContent = (
    <div
      className="modal-backdrop bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className={`bg-white/95 backdrop-blur-xl rounded-3xl ${maxWidth} w-full max-h-[90vh] overflow-y-auto shadow-2xl shadow-cyan-500/20 border border-white/20 relative`}
      >
        <div className="sticky top-0 bg-gradient-to-r from-[#0F4C81] to-[#58A1D3] px-8 py-6 rounded-t-3xl z-10">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                <div className="w-2 h-2 bg-cyan-300 rounded-full animate-pulse"></div>
                {title}
              </h3>
              {subtitle && (
                <p className="text-cyan-100 mt-1 text-sm">{subtitle}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white hover:bg-white/20 rounded-full p-2 transition-all duration-300 group"
            >
              <X
                size={24}
                className="group-hover:rotate-90 transition-transform duration-300"
              />
            </button>
          </div>
        </div>
        <div className="p-8">{children}</div>
      </div>
    </div>
  );

  // Render modal using portal to ensure it appears above all other content
  const modalRoot = document.getElementById("modal-root") || document.body;
  return createPortal(modalContent, modalRoot);
};

const ResidentVerificationModal = ({ open, onClose, onVerified }) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    birthDate: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await api.post("/requests/verify-resident", formData);

      if (response.data.verified) {
        onVerified(response.data.resident);
      } else {
        setError("No matching resident found. Please check your information.");
      }
    } catch (err) {
      setError("Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title="Verify Resident Identity"
      subtitle="Confirm your identity to proceed with certificate request"
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            First Name
          </label>
          <input
            type="text"
            required
            value={formData.firstName}
            onChange={(e) =>
              setFormData({ ...formData, firstName: e.target.value })
            }
            className="w-full mt-1 p-2 border rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Last Name
          </label>
          <input
            type="text"
            required
            value={formData.lastName}
            onChange={(e) =>
              setFormData({ ...formData, lastName: e.target.value })
            }
            className="w-full mt-1 p-2 border rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Birth Date
          </label>
          <input
            type="date"
            required
            value={formData.birthDate}
            onChange={(e) =>
              setFormData({ ...formData, birthDate: e.target.value })
            }
            className="w-full mt-1 p-2 border rounded-md"
          />
        </div>

        {error && (
          <div className="p-3 bg-red-100 text-red-800 rounded text-sm">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 rounded-md"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Verify"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

const RequestFormModal = ({ open, onClose, requesterType, residentData }) => {
  const [certTypes, setCertTypes] = useState([]);
  const [formData, setFormData] = useState({
    cert_type_id: "",
    purpose: "",
    fullName: "",
    contactNumber: "",
    email: "",
    address: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      loadCertificateTypes();

      // DEBUG: Log resident data
      console.log("🔍 Resident Data Debug:", {
        requesterType,
        residentData,
        hasEmail: !!residentData?.email,
        emailValue: residentData?.email,
      });

      // Prefill for residents
      if (requesterType === "resident" && residentData) {
        setFormData((prev) => ({
          ...prev,
          fullName: residentData.full_name || "",
          contactNumber: residentData.contact || "",
          email: residentData.email || "",
          address: residentData.address || "",
        }));
      } else {
        // Reset for non-residents
        setFormData({
          cert_type_id: "",
          purpose: "",
          fullName: "",
          contactNumber: "",
          email: "",
          address: "",
        });
      }
    }
  }, [open, requesterType, residentData]);

  const loadCertificateTypes = async () => {
    try {
      const response = await api.get("/requests/certificate-types", {
        params: { requesterType },
      });
      setCertTypes(response.data.data || []);
    } catch (err) {
      console.error("Failed to load certificate types:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        cert_type_id: formData.cert_type_id,
        purpose: formData.purpose,
        requester_type: requesterType,
        resident_id: residentData?.resident_id || null,
        fullName: formData.fullName,
        contactNumber: formData.contactNumber,
        email: formData.email,
        address: formData.address,
      };

      await api.post("/requests", payload);
      alert("Request submitted successfully!");
      window.dispatchEvent(new Event("requests:created"));
      onClose();
    } catch (err) {
      console.error("Submit error:", err);
      alert(
        "Failed to submit request: " +
          (err.response?.data?.message || err.message)
      );
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title={`Certificate Request - ${
        requesterType === "resident" ? "Resident" : "Non-Resident"
      }`}
      subtitle="Fill in the details to submit your certificate request"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Certificate Type *
          </label>
          <select
            required
            value={formData.cert_type_id}
            onChange={(e) =>
              setFormData({ ...formData, cert_type_id: e.target.value })
            }
            className="w-full mt-1 p-2 border rounded-md"
          >
            <option value="">Select certificate type</option>
            {certTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
          {requesterType === "non-resident" && (
            <p className="text-xs text-gray-500 mt-1">
              Limited certificates available for non-residents
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Purpose *
          </label>
          <textarea
            required
            value={formData.purpose}
            onChange={(e) =>
              setFormData({ ...formData, purpose: e.target.value })
            }
            className="w-full mt-1 p-2 border rounded-md"
            rows="3"
            placeholder="State the purpose of this certificate request"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Full Name *
          </label>
          <input
            type="text"
            required
            value={formData.fullName}
            onChange={(e) =>
              setFormData({ ...formData, fullName: e.target.value })
            }
            disabled={requesterType === "resident"}
            className="w-full mt-1 p-2 border rounded-md disabled:bg-gray-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Contact Number *
          </label>
          <input
            type="text"
            required
            value={formData.contactNumber}
            onChange={(e) =>
              setFormData({ ...formData, contactNumber: e.target.value })
            }
            className="w-full mt-1 p-2 border rounded-md"
            placeholder="09XX XXX XXXX"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Email *
          </label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            className="w-full mt-1 p-2 border rounded-md"
            placeholder="your.email@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Address *
          </label>
          <input
            type="text"
            required
            value={formData.address}
            onChange={(e) =>
              setFormData({ ...formData, address: e.target.value })
            }
            disabled={requesterType === "resident"}
            className="w-full mt-1 p-2 border rounded-md disabled:bg-gray-100"
            placeholder="Complete address"
          />
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 rounded-md"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Submit Request"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

const CertificateRequestFlow = ({
  buttonText = "Request Certificate",
  className = "",
  onClose = null,
  isOpen = false,
}) => {
  const [step, setStep] = useState("closed"); // 'choice', 'verify', 'form'
  const [requesterType, setRequesterType] = useState(null);
  const [residentData, setResidentData] = useState(null);

  // Handle external control via isOpen prop
  React.useEffect(() => {
    if (isOpen && step === "closed") {
      setStep("choice");
    } else if (!isOpen && step !== "closed") {
      handleClose();
    }
  }, [isOpen]);

  const handleTypeSelect = (type) => {
    setRequesterType(type);
    if (type === "resident") {
      setStep("verify");
    } else {
      setStep("form");
    }
  };

  const handleVerified = (data) => {
    setResidentData(data);
    setStep("form");
  };

  const handleClose = () => {
    setStep("closed");
    setRequesterType(null);
    setResidentData(null);
    if (onClose) onClose();
  };

  return (
    <>
      {!onClose && (
        <button
          onClick={() => setStep("choice")}
          className={`px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 ${className}`}
        >
          {buttonText}
        </button>
      )}

      {/* Choice Modal */}
      {step === "choice" && (
        <Modal
          isOpen={step === "choice"}
          onClose={handleClose}
          title="Select Requester Type"
          subtitle="Choose whether you are a registered resident or non-resident"
          maxWidth="max-w-md"
        >
          <div className="space-y-3">
            <button
              onClick={() => handleTypeSelect("resident")}
              className="w-full p-4 text-left border-2 border-blue-500 rounded-lg hover:bg-blue-50"
            >
              <h4 className="font-semibold">Resident</h4>
              <p className="text-sm text-gray-600">
                You are a registered resident. Access all certificate types.
              </p>
            </button>

            <button
              onClick={() => handleTypeSelect("non-resident")}
              className="w-full p-4 text-left border-2 border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <h4 className="font-semibold">Non-Resident</h4>
              <p className="text-sm text-gray-600">
                You are not a registered resident. Limited certificate types
                available.
              </p>
            </button>
          </div>
        </Modal>
      )}

      <ResidentVerificationModal
        open={step === "verify"}
        onClose={handleClose}
        onVerified={handleVerified}
      />

      <RequestFormModal
        open={step === "form"}
        onClose={handleClose}
        requesterType={requesterType}
        residentData={residentData}
      />
    </>
  );
};

export default CertificateRequestFlow;
