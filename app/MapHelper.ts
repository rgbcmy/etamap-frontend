import Map from "ol/Map";
import { toLonLat } from "ol/proj";

/**
 * 获取屏幕 DPI
 */
export function getScreenDPI(): number {
  const div = document.createElement("div");
  div.style.width = "1in";
  div.style.height = "1in";
  div.style.position = "absolute";
  div.style.left = "-100%";
  document.body.appendChild(div);

  const dpi = (div.offsetWidth + div.offsetHeight) / 2;
  document.body.removeChild(div);
  return dpi;
}

/**
 * 计算地图比例尺（考虑投影和纬度）
 * @param map OpenLayers Map 对象
 */
export function getScale(map: Map): number {
  const view = map.getView();
  const resolution = view.getResolution();
  if (!resolution) return 1;

  const projection = view.getProjection();
  const units = projection.getUnits(); // 'm' | 'degrees' | ...

  let metersPerPixel = resolution;

  if (units === "degrees") {
    // 经纬度投影 (EPSG:4326)
    // 取地图中心纬度来修正
    const center = toLonLat(view.getCenter()!, projection);
    const latitude = center[1] * Math.PI / 180; // 转弧度

    // 赤道上 1° ≈ 111320m，随纬度缩小
    metersPerPixel = resolution * 111320 * Math.cos(latitude);
  } else if (projection.getCode() === "EPSG:3857") {
    // Web Mercator
    const center = toLonLat(view.getCenter()!, projection);
    const latitude = center[1] * Math.PI / 180;

    // 修正 Mercator 的纬度失真
    metersPerPixel = resolution * Math.cos(latitude);
  }

  const dpi = getScreenDPI() * window.devicePixelRatio;
  const inchesPerMeter = 39.37;

  return metersPerPixel * dpi * inchesPerMeter;
}
