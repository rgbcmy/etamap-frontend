1.node版本大于等于20
2.包管理使用pnpm



features:
//todo
数据源管理
数据源管理-tilewms中的参数params组件还需要优化ParamsJsonEditor.tsx还需要优化 新增参数 折叠按钮图标修改，加减号不合适，当子参数越来越多，第一个输入框无法展示
-重要
数据源管理要参考qgis只保存连接,点击连接获取图层源数据，这样可以简化很多没必要的参数，而且能获取gis web服务列表
数据源管理还需要管理自己平台的gis数据，右键能加载到地图（再弹窗选择加载的数据格式，默认策略为数据<2k为geojson,超过为vectortile）

图层树(图层，图层组，属性，样式)
基础控件(指北针等)
添加状态栏渲染开关开关
//样式编辑，使用geostyler，他能转换openlayers,sld,mapbox等样式，还提供了react组件
https://geostyler.org/

1.0要做的数据源编辑服务，只保存连接
wms/wmts 连接服务
WMS / WMTS
├── ImageWMS （动态渲染）
├── TileWMS （WMS-C / 瓦片优化）
└── WMTS （原生切片服务）
逻辑判断上可以：
先判断服务是否支持 GetCapabilities
根据根节点判断是 WMS 还是 WMTS
然后再判断 WMS 是否声明了 TILED=true 或 TileMatrixSet