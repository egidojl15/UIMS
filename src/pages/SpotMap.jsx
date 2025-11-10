import React, { useState, useEffect } from "react";
import { MapPin, Download, ZoomIn, ZoomOut, X } from "lucide-react";
import { spotmapsAPI } from "../services/api";
import jsPDF from "jspdf";

const SpotMap = () => {
  const [enlargedImage, setEnlargedImage] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const { mapImages, updateMapImages } = useMap();

  // Load spot maps on component mount
  useEffect(() => {
    const loadSpotMaps = async () => {
      try {
        const result = await spotmapsAPI.getAll();
        if (result.success && result.data) {
          const timestamp = Date.now();
          const backendURL =
            import.meta.env.VITE_API_URL?.replace("/api", "") ||
            "http://localhost:5000";
          const updated = {};

          Object.keys(result.data).forEach((k) => {
            if (result.data[k]) {
              const imageUrl = result.data[k].startsWith("/uploads")
                ? `${backendURL}${result.data[k]}`
                : result.data[k];
              updated[k] = `${imageUrl}?t=${timestamp}`;
            } else {
              updated[k] = "";
            }
          });

          console.log("✅ Loaded spot maps:", updated);
          updateMapImages(updated);
        }
      } catch (err) {
        console.error("❌ Error loading spot maps:", err);
      }
    };

    loadSpotMaps();
  }, [updateMapImages]);

  // Simple individual image download
  const handleDownloadImage = async (imageUrl, imageName) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `BARANGAY_UPPER_ICHON_${imageName
        .toUpperCase()
        .replace(/\s+/g, "_")}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download error:", error);
      alert("Failed to download image. Please try again.");
    }
  };

  // PDF download (optional - keep if needed)
  const handleDownloadPDF = async () => {
    try {
      const imagesToDownload = [];
      const { spotMap, detailedSpotMap, evacuationMap } = mapImages;

      if (spotMap)
        imagesToDownload.push({
          url: spotMap,
          name: "Spot Map",
          title: "BARANGAY UPPER ICHON SPOT MAP",
        });
      if (detailedSpotMap)
        imagesToDownload.push({
          url: detailedSpotMap,
          name: "Detailed Spot Map",
          title: "DETAILED SPOT MAP",
        });
      if (evacuationMap)
        imagesToDownload.push({
          url: evacuationMap,
          name: "Evacuation Route",
          title: "EVACUATION ROUTE MAP",
        });

      if (imagesToDownload.length === 0) {
        alert(
          "No spot maps available to download. Please upload images first."
        );
        return;
      }

      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });
      const pageWidth = 297;
      const pageHeight = 210;
      const margin = 10;

      for (let i = 0; i < imagesToDownload.length; i++) {
        const image = imagesToDownload[i];
        try {
          const response = await fetch(image.url);
          if (!response.ok) continue;

          const blob = await response.blob();
          const base64 = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(blob);
          });

          if (i > 0) pdf.addPage();

          const img = new Image();
          img.src = base64;
          await new Promise((resolve) => {
            img.onload = resolve;
          });

          const aspectRatio = img.width / img.height;
          const availableWidth = pageWidth - 2 * margin;
          const availableHeight = pageHeight - 2 * margin;

          let finalWidth, finalHeight;
          if (aspectRatio > availableWidth / availableHeight) {
            finalWidth = availableWidth;
            finalHeight = availableWidth / aspectRatio;
          } else {
            finalHeight = availableHeight;
            finalWidth = availableHeight * aspectRatio;
          }

          const x = (pageWidth - finalWidth) / 2;
          const y = (pageHeight - finalHeight) / 2;
          pdf.addImage(base64, "JPEG", x, y, finalWidth, finalHeight);
        } catch (err) {
          console.error(`Error adding ${image.name} to PDF:`, err);
        }
      }

      pdf.save("BARANGAY_UPPER_ICHON_SPOT_MAPS.pdf");
    } catch (error) {
      console.error("Download error:", error);
      alert("Failed to generate PDF. Please try again.");
    }
  };

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () =>
    setZoomLevel((prev) => Math.max(prev - 0.25, 0.5));

  const Modal = ({ title, children, onClose }) => (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl max-w-4xl w-full shadow-2xl border border-white/20">
        <div className="sticky top-0 bg-gradient-to-r from-[#0F4C81] to-[#58A1D3] px-8 py-6 rounded-t-3xl">
          <div className="flex justify-between items-center">
            <h2 className="text-3xl font-bold text-white">{title}</h2>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white rounded-full p-2 transition-all"
            >
              <X size={24} />
            </button>
          </div>
        </div>
        <div className="p-8">{children}</div>
      </div>
    </div>
  );

  const MapCard = ({ title, imageUrl, imageKey }) => (
    <div className="bg-white rounded-2xl shadow-lg border border-white/20 overflow-hidden hover:shadow-xl transition-all duration-300">
      <h3 className="p-4 text-lg font-semibold text-[#06172E] text-center bg-gray-50">
        {title}
      </h3>
      <div className="p-4">
        {imageUrl ? (
          <div>
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-48 object-contain cursor-pointer rounded-lg hover:opacity-90 transition-opacity"
              onClick={() => {
                setEnlargedImage({ src: imageUrl, title });
                setZoomLevel(1);
              }}
              onError={(e) => {
                console.error(`Failed to load image: ${e.target.src}`);
                e.target.alt = "Image not available";
                e.target.classList.add("opacity-30");
              }}
            />
          </div>
        ) : (
          <div className="h-48 flex items-center justify-center bg-gray-100 rounded-lg">
            <p className="text-gray-500 text-sm text-center">
              No {title.toLowerCase()} available
            </p>
          </div>
        )}
      </div>
    </div>
  );

  const { spotMap, detailedSpotMap, evacuationMap } = mapImages;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#B3DEF8] via-white to-[#58A1D3]">
      {/* Header Section */}
      <div className="relative pt-32 pb-16 px-6 sm:px-8 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#0F4C81] to-[#58A1D3] bg-clip-text text-transparent mb-6">
              Barangay Maps
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Explore detailed maps of Upper Ichon including spot locations and
              evacuation routes
            </p>
          </div>

          {/* Download Button */}
          <div className="flex justify-center">
            <button
              onClick={handleDownloadPDF}
              className="px-6 py-3 bg-gradient-to-r from-[#0F4C81] to-[#58A1D3] text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300 group flex items-center gap-2 font-medium"
            >
              <Download
                size={18}
                className="group-hover:scale-110 transition-transform"
              />
              Download Full Map Document
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="px-6 sm:px-8 lg:px-12 pb-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            {/* Maps Section */}
            <div className="xl:col-span-3">
              <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20">
                <div className="p-6 border-b border-white/20">
                  <h2 className="text-2xl font-bold text-[#06172E] flex items-center gap-3">
                    <MapPin size={24} className="text-[#0F4C81]" />
                    Barangay Maps
                  </h2>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <MapCard
                      title="Spot Map"
                      imageUrl={spotMap}
                      imageKey="spotMap"
                    />
                    <MapCard
                      title="Detailed Spot Map"
                      imageUrl={detailedSpotMap}
                      imageKey="detailedSpotMap"
                    />
                    <MapCard
                      title="Evacuation Route"
                      imageUrl={evacuationMap}
                      imageKey="evacuationMap"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Google Map Section */}
            <div className="xl:col-span-1">
              <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 h-full">
                <div className="p-6 border-b border-white/20">
                  <h2 className="text-2xl font-bold text-[#06172E] flex items-center gap-3">
                    <MapPin size={24} className="text-[#0F4C81]" />
                    Google Map Location
                  </h2>
                </div>
                <div className="p-6 h-64">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3961.9999999999995!2d124.9085!3d10.1162!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x33a5f%3A0x0!2sUpper%20Ichon%2C%20Macrohon%2C%206601%2C%20Philippines!5e0!3m2!1sen!2sus!4v1690000000000"
                    className="w-full h-full rounded-xl border-0"
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Enlarged Image Modal */}
      {enlargedImage && (
        <Modal
          title={enlargedImage.title}
          onClose={() => {
            setEnlargedImage(null);
            setZoomLevel(1);
          }}
        >
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <button
                onClick={handleZoomOut}
                disabled={zoomLevel <= 0.5}
                className={`p-2 rounded-lg ${
                  zoomLevel <= 0.5
                    ? "text-gray-400 cursor-not-allowed bg-gray-100"
                    : "text-gray-600 hover:bg-gray-200 bg-gray-100"
                } transition-colors`}
              >
                <ZoomOut size={20} />
              </button>
              <span className="text-sm font-medium">
                Zoom: {Math.round(zoomLevel * 100)}%
              </span>
              <button
                onClick={handleZoomIn}
                disabled={zoomLevel >= 3}
                className={`p-2 rounded-lg ${
                  zoomLevel >= 3
                    ? "text-gray-400 cursor-not-allowed bg-gray-100"
                    : "text-gray-600 hover:bg-gray-200 bg-gray-100"
                } transition-colors`}
              >
                <ZoomIn size={20} />
              </button>
            </div>

            <div className="flex justify-center bg-gray-50 rounded-xl p-4 max-h-[60vh] overflow-auto">
              <img
                src={enlargedImage.src}
                alt={enlargedImage.title}
                className="max-w-full object-contain"
                style={{
                  transform: `scale(${zoomLevel})`,
                  transition: "transform 0.2s ease-in-out",
                }}
                onError={(e) => {
                  console.error(
                    `Failed to load enlarged image: ${e.target.src}`
                  );
                  e.target.alt = "Image failed to load";
                }}
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default SpotMap;
