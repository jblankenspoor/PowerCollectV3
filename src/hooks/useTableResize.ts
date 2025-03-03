import { useState, useEffect, RefObject } from 'react';

/**
 * Custom hook for handling table resizing and horizontal scrolling
 * 
 * @param tableRef - Reference to the table container element
 * @param dependencyArray - Array of dependencies that should trigger resize recalculation
 * @returns Object containing table width and scroll notification state
 */
const useTableResize = (
  tableRef: RefObject<HTMLDivElement>,
  dependencyArray: any[] = []
): { 
  tableWidth: number; 
  showScrollNotification: boolean;
  setShowScrollNotification: React.Dispatch<React.SetStateAction<boolean>>;
} => {
  // State to track the table width for proper alignment of bottom button
  const [tableWidth, setTableWidth] = useState(0);
  
  // State to track if horizontal scrolling is needed
  const [showScrollNotification, setShowScrollNotification] = useState(false);

  // Effect to adjust table layout on window resize and ensure horizontal scrolling works
  useEffect(() => {
    const handleResize = () => {
      // Force table to recalculate its layout on resize
      if (tableRef.current && tableRef.current.parentElement) {
        // Get the actual width of content
        const tableContainer = tableRef.current.firstChild as HTMLElement;
        if (!tableContainer) return;
        
        // Set the width of the outer container to match its content
        // This ensures no extra whitespace is displayed
        const contentWidth = tableContainer.getBoundingClientRect().width;
        tableRef.current.style.width = `${contentWidth}px`;
        
        // Update tableWidth state for the Add Task button alignment
        setTableWidth(contentWidth);
        
        // Ensure scrollbar appears when needed
        const containerWidth = tableRef.current.parentElement.clientWidth || 0;
        
        if (contentWidth > containerWidth) {
          tableRef.current.parentElement.classList.add('overflow-x-auto');
          setShowScrollNotification(true);
        } else {
          setShowScrollNotification(false);
        }
      }
    };
    
    // Initial setup
    setTimeout(handleResize, 100); // Slight delay to ensure DOM is ready
    
    // Add resize listener
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [...dependencyArray]); // Re-run when dependencies change
  
  // Effect to handle scroll events and hide notification after user scrolls
  useEffect(() => {
    const handleScroll = () => {
      if (showScrollNotification && tableRef.current?.parentElement) {
        // Hide notification after user has scrolled horizontally
        const scrollLeft = tableRef.current.parentElement.scrollLeft;
        if (scrollLeft > 50) {
          setShowScrollNotification(false);
        }
      }
    };
    
    // Add scroll listener to the table's parent element
    const parentElement = tableRef.current?.parentElement;
    if (parentElement) {
      parentElement.addEventListener('scroll', handleScroll);
      return () => parentElement.removeEventListener('scroll', handleScroll);
    }
  }, [showScrollNotification]);

  return { tableWidth, showScrollNotification, setShowScrollNotification };
};

export default useTableResize;
