import React from 'react';

/**
 * Props for the AddRowButton component
 * @interface AddRowButtonProps
 * @property {Function} onAddRow - Function to handle adding a new row
 * @property {number} tableWidth - Width of the parent table for proper alignment
 */
interface AddRowButtonProps {
  onAddRow: () => void;
  tableWidth: number;
}

/**
 * AddRowButton component
 * - Button for adding a new row to the table
 * - Spans the full width of the table
 * - Styled consistently with the table design
 * 
 * @param {AddRowButtonProps} props - Component props
 * @returns {JSX.Element} Rendered component
 */
const AddRowButton: React.FC<AddRowButtonProps> = ({ onAddRow, tableWidth }) => {
  return (
    <div 
      className="mt-2 flex justify-center w-full"
      style={{ width: tableWidth > 0 ? `${tableWidth}px` : '100%' }}
    >
      <button
        onClick={onAddRow}
        className="w-full py-2 bg-white border border-gray-200 text-blue-500 hover:bg-gray-50 transition-colors duration-200 rounded-md shadow-sm flex items-center justify-center"
      >
        <span className="mr-1">+</span> Add row
      </button>
    </div>
  );
};

export default AddRowButton;
