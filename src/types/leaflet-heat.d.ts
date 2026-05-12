declare module 'leaflet.heat' {
  // Side-effect import: patches L with L.heatLayer when loaded.
  // The actual L.heatLayer type is accessed via (L as any).heatLayer.
}
