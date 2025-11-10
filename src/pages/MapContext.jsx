import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

const MapContext = createContext();

export const MapProvider = ({ children }) => {
  // Load from localStorage on initial render
  const getInitialMapImages = () => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("barangayMapImages");
      if (saved) {
        return JSON.parse(saved);
      }
    }
    return {
      spotMap: "/files/Barangay_Upper_Ichon_Spot_Map.jpg",
      detailedSpotMap: "/files/Barangay_Upper_Ichon_Spot_Map_Detailed.jpg",
      evacuationMap: "/files/Barangay_Upper_Ichon_Evacuation_Route.jpg",
    };
  };

  const [mapImages, setMapImages] = useState(getInitialMapImages);

  // Save to localStorage whenever mapImages changes
  useEffect(() => {
    localStorage.setItem("barangayMapImages", JSON.stringify(mapImages));
  }, [mapImages]);

  const updateMapImages = useCallback((newMapImages) => {
    setMapImages(newMapImages);
  }, []);

  const value = {
    mapImages,
    updateMapImages,
  };

  return <MapContext.Provider value={value}>{children}</MapContext.Provider>;
};

export const useMap = () => {
  const context = useContext(MapContext);
  if (!context) {
    throw new Error("useMap must be used within a MapProvider");
  }
  return context;
};
