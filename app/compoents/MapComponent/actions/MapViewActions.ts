import type { Map } from "ol";
export class MapViewActions {
  private map: Map;

  constructor(map: Map) {
    this.map = map;
  }

  zoomIn() {
    const view = this.map.getView();
    view.setZoom((view.getZoom() || 0) + 1);
  }

  zoomOut() {
    const view = this.map.getView();
    view.setZoom((view.getZoom() || 0) - 1);
  }

  resetView() {
    const view = this.map.getView();
    view.setCenter([0, 0]);
    view.setZoom(2);
    view.setRotation(0);
  }
}