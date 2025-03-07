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
      // Only proceed if we have valid references
      if (!tableRef.current || !tableRef.current.parentElement) return;
      
      // Get the container for the table content
      const tableContainer = tableRef.current.firstChild as HTMLElement;
      if (!tableContainer) return;
      
      // Measure the width of the table content and its container
      // Use scrollWidth instead of getBoundingClientRect to get full content width
      const contentWidth = tableContainer.scrollWidth;
      const containerWidth = tableRef.current.parentElement.clientWidth;
      
      // Update the tableWidth for tracking purposes, but don't set an explicit width
      // on the table element to avoid width fluctuation
      setTableWidth(contentWidth);
      
      // Determine if scroll notification should be shown
      // Only show if there's at least 30px of scrollable content
      const hasSignificantOverflow = contentWidth - containerWidth > 30;
      
      // Get current scroll position to check if we're at the end
      const scrollElement = tableRef.current.parentElement;
      // Calculate the maximum possible scroll position (content width minus container width)
      const maxScrollPosition = contentWidth - containerWidth;
      // Check if we're within 2px of the maximum scroll position
      const isAtEnd = maxScrollPosition > 0 && 
                     (scrollElement.scrollLeft >= maxScrollPosition - 2);
      
      // Update notification visibility
      setShowScrollNotification(hasSignificantOverflow && !isAtEnd);
    };
    
    // Initial setup with a delay to ensure DOM is ready
    const initialCheck = setTimeout(handleResize, 100);
    
    // Do another check after a longer delay to ensure proper measurement
    const delayedCheck = setTimeout(handleResize, 300);
    
    // Add resize listener
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(initialCheck);
      clearTimeout(delayedCheck);
    };
  }, [...dependencyArray]); // Re-run when dependencies change
  
  // Effect to handle scroll events and hide notification after user scrolls
  useEffect(() => {
    const handleScroll = () => {
      if (!showScrollNotification || !tableRef.current?.parentElement) return;
      
      const scrollElement = tableRef.current.parentElement;
      const tableContainer = tableRef.current.firstChild as HTMLElement;
      if (!tableContainer) return;
      
      // Determine if user has scrolled significantly or reached the end
      const scrollLeft = scrollElement.scrollLeft;
      const containerWidth = scrollElement.clientWidth;
      const contentWidth = tableContainer.getBoundingClientRect().width;
      
      // Calculate the maximum possible scroll position
      const maxScrollPosition = contentWidth - containerWidth;
      
      // Hide notification if scrolled more than 30px OR at/near the end
      const isScrolledEnough = scrollLeft > 30;
      // Check if we're within 2px of the maximum scroll position
      const isAtEnd = maxScrollPosition > 0 && scrollLeft >= maxScrollPosition - 2;
      
      if (isScrolledEnough || isAtEnd) {
        setShowScrollNotification(false);
      }
    };
    
    // Add scroll listener to the table's parent element
    const parentElement = tableRef.current?.parentElement;
    if (parentElement) {
      // Add the event listener
      parentElement.addEventListener('scroll', handleScroll);
      
      // Check scroll position immediately
      // This ensures we properly handle the case where the page is already scrolled
      handleScroll();
      
      // Return cleanup function
      return () => parentElement.removeEventListener('scroll', handleScroll);
    }
  }, [showScrollNotification]);

  return { tableWidth, showScrollNotification, setShowScrollNotification };
};

export default useTableResize;
