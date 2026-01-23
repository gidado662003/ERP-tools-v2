// client/app/page.tsx
"use client";

import { useEffect, useState } from "react";

export default function HomePage() {
  interface Location {
    latitude: number;
    longitude: number;
    accuracy: number
  }

  const [location, setLocation] = useState<Location | null>(null);

  useEffect(() => {
    // Request location permission on component mount
    requestLocationPermission();
  }, []);

  const requestLocationPermission = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          console.log("Location:", { latitude, longitude, accuracy });
          setLocation({ latitude, longitude, accuracy });
          // Send to backend
          // updateLocation(latitude, longitude, accuracy);
        },
        (error) => {
          console.error("Geolocation error:", error);
          handleLocationError(error);
        },
        {
          enableHighAccuracy: true, // Use GPS
          timeout: 10000,
          maximumAge: 300000 // Accept locations up to 5 minutes old
        }
      );
    } else {
      console.error("Geolocation not supported");
    }
  };



  const handleLocationError = (error: any) => {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        alert("Location access denied by user.");
        break;
      case error.POSITION_UNAVAILABLE:
        alert("Location information unavailable.");
        break;
      case error.TIMEOUT:
        alert("Location request timed out.");
        break;
      default:
        alert("An unknown location error occurred.");
        break;
    }
  };

  return (
    <div>
      <h1>Chat App</h1>
      {location && (
        <p>Location: {location.latitude}, {location.longitude}</p>
      )}
    </div>
  );
}