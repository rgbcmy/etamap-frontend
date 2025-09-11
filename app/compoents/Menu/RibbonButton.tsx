import React from "react";
import { Dropdown } from "antd";
import { DownOutlined } from "@ant-design/icons";
import clsx from "clsx";

type RibbonButtonType = "normal" | "toggle" | "dropdown";
type RibbonButtonSize = "large" | "small";

interface RibbonButtonProps {
  type?: RibbonButtonType;
  size?: RibbonButtonSize;
  icon: React.ReactNode;
  label: string;
  active?: boolean;   // toggle 时有效
  menu?: any;         // dropdown 菜单
  onClick?: () => void;
}

export const RibbonButton: React.FC<RibbonButtonProps> = ({
  type = "normal",
  size = "large",
  icon,
  label,
  active,
  menu,
  onClick,
}) => {
  const content = (
    <div
      className={clsx(
        "flex items-center justify-center rounded-md cursor-pointer",
        size === "large"
          ? "flex-col w-16 h-16 text-xs gap-1"
          : "flex-row px-2 h-8 text-sm gap-1",
        active ? "bg-blue-100 text-blue-600" : "hover:bg-gray-100"
      )}
      onClick={onClick}
    >
      <div className={size === "large" ? "text-lg" : "text-base"}>{icon}</div>
      <div className={clsx(size === "large" ? "" : "leading-none")}>{label}</div>
    </div>
  );

  if (type === "dropdown" && menu) {
    return (
      <Dropdown menu={menu} trigger={["click"]}>
        <div className="relative">{content}
          {size === "large" && (
            <DownOutlined className="absolute bottom-1 right-1 text-[10px] text-gray-400" />
          )}
        </div>
      </Dropdown>
    );
  }

  return content;
};
