interface RibbonGroupProps {
  title: string;
  children: React.ReactNode;
}

export const RibbonGroup: React.FC<RibbonGroupProps> = ({ title, children }) => {
  return (
    <div className="flex flex-col items-center px-2 border-r border-gray-300">
      <div className="flex gap-1 flex-wrap">{children}</div>
      <div className="text-xs text-gray-500 mt-1">{title}</div>
    </div>
  );
};