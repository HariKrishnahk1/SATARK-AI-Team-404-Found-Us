'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Challenge } from '../lib/types';

interface MapProps {
  challenges: Challenge[];
  selectedChallengeId?: string;
  onSelectChallenge?: (challenge: Challenge) => void;
}

export const LeafletMap: React.FC<MapProps> = ({ challenges, selectedChallengeId, onSelectChallenge }) => {
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || typeof window === 'undefined' || !containerRef.current) return;

    // Load Leaflet dynamically client side
    const L = require('leaflet');
    require('leaflet/dist/leaflet.css');

    // Fix default marker icon paths in Leaflet
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
    });

    // Clean up any existing Leaflet instance on the container safely
    if (mapInstanceRef.current) {
      try {
        mapInstanceRef.current.off();
        mapInstanceRef.current.remove();
      } catch (e) {
        // Ignore unmount error if pane already detached
      }
      mapInstanceRef.current = null;
    }
    if ((containerRef.current as any)._leaflet_id) {
      (containerRef.current as any)._leaflet_id = null;
    }

    // Center map on India (Geographic Center approx 20.5937, 78.9629)
    const map = L.map(containerRef.current, {
      zoomAnimation: false,
      fadeAnimation: false,
      markerZoomAnimation: false
    }).setView([20.5937, 78.9629], 5);

    mapInstanceRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; SATARK AI Platform'
    }).addTo(map);

    const bounds: L.LatLngTuple[] = [];

    challenges.forEach((ch) => {
      if (ch.latitude && ch.longitude) {
        bounds.push([ch.latitude, ch.longitude]);
      }

      let color = '#0ea5e9'; // Cyan medium
      if (ch.priority === 'URGENT' || ch.severity === 'CRITICAL') color = '#ef4444'; // Red
      else if (ch.priority === 'HIGH') color = '#f97316'; // Orange
      else if (ch.status === 'RESOLVED') color = '#10b981'; // Green

      const marker = L.circleMarker([ch.latitude, ch.longitude], {
        radius: 9,
        fillColor: color,
        color: '#ffffff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.85
      }).addTo(map);

      const popupHtml = `
        <div style="font-family: sans-serif; font-size: 12px; color: #0f172a; max-width: 220px;">
          <div style="font-weight: bold; margin-bottom: 4px; color: #0284c7;">${ch.title}</div>
          <div style="font-size: 10px; color: #64748b; margin-bottom: 4px;">📍 ${ch.district} • ${ch.category}</div>
          <div style="display: flex; gap: 4px; font-weight: bold; margin-bottom: 6px;">
            <span style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px;">Priority: ${ch.priority_score}/100</span>
            <span style="background: #e0f2fe; color: #0369a1; padding: 2px 6px; border-radius: 4px;">${ch.status}</span>
          </div>
          <p style="margin: 0; color: #334155; font-size: 11px;">${ch.citizen_description ? ch.citizen_description.substring(0, 80) : ''}...</p>
        </div>
      `;

      marker.bindPopup(popupHtml);

      if (onSelectChallenge) {
        marker.on('click', () => onSelectChallenge(ch));
      }
    });

    if (bounds.length > 0) {
      try {
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 7, animate: false });
      } catch (e) {
        // Fallback bounds
      }
    }

    return () => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.off();
          mapInstanceRef.current.remove();
        } catch (e) {
          // Ignore unmount cleanup error
        }
        mapInstanceRef.current = null;
      }
    };
  }, [mounted, challenges]);

  if (!mounted) {
    return (
      <div className="w-full h-[400px] bg-slate-900 animate-pulse flex items-center justify-center text-slate-500 text-sm">
        Loading GIS Map...
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="w-full h-[450px] rounded-2xl shadow-inner border border-slate-800 z-10"
    />
  );
};
