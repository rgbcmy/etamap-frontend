//todo 添加其他菜单按钮
export type MenuAction =
  | "newFile"
  | "openFile"
  | "saveFile"
  | "saveAsFile"

  export const MenuActionKeys = {
  newFile: "newFile",
  openFile: "openFile",
  saveFile: "saveFile",
  saveAsFile: "saveAsFile",
  // ...
} as const;