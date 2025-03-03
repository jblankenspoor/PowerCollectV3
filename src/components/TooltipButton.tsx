import React from 'react';

/**
 * Props for the TooltipButton component
 * @interface TooltipButtonProps
 * @property {Function} onClick - Function to execute when the button is clicked
 * @property {React.ComponentType<any>} icon - Icon component to render inside the button
 * @property {string} tooltipText - Text to display in the tooltip
 * @property {string} ariaLabel - Accessibility label for the button
 * @property {'blue' | 'red'} [colorClass='blue'] - Color theme for the button hover state
 */
interface TooltipButtonProps {
  onClick: () => void;
  icon: React.ComponentType<any>;
  tooltipText: string;
  ariaLabel: string;
  colorClass?: 'blue' | 'red';
}

/**
 * TooltipButton component
 * - Reusable button with tooltip functionality
 * - Supports different color themes
 * - Handles tooltip visibility on hover
 * 
 * @param {TooltipButtonProps} props - Component props
 * @returns {JSX.Element} Rendered component
 */
const TooltipButton: React.FC<TooltipButtonProps> = ({ 
  onClick, 
  icon: Icon, 
  tooltipText, 
  ariaLabel, 
  colorClass = "blue" 
}) => {
  // Map color class names based on the color prop
  const colorMapping = {
    blue: "hover:text-blue-600",
    red: "hover:text-red-600"
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={onClick}
        className={`p-1.5 text-gray-400 ${colorMapping[colorClass]} cursor-pointer transition-colors duration-200 rounded-md tooltip-trigger`}
        aria-label={ariaLabel}
        onMouseEnter={(e) => {
          const tooltip = e.currentTarget.nextElementSibling;
          if (tooltip) tooltip.classList.add('tooltip-visible');
        }}
        onMouseLeave={(e) => {
          const tooltip = e.currentTarget.nextElementSibling;
          if (tooltip) tooltip.classList.remove('tooltip-visible');
        }}
      >
        <Icon className="h-5 w-5" />
      </button>
      {/* 
       * Tooltip container
       * - Appears on hover with no delay
       * - Positioned above the button with a small arrow pointing down
       * - Minimal width and padding for compact display
       */}
      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1 px-0.5 py-1 bg-gray-800 text-white text-xs rounded pointer-events-none opacity-0 transition-opacity duration-100 whitespace-nowrap z-10 min-w-[80px] text-center">
        {tooltipText}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
      </div>
    </div>
  );
};

export default TooltipButton;
