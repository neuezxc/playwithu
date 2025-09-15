'use client'
import React, { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';

const CharacterImagePopup = ({ character, onClose }) => {
  const popupRef = useRef(null);
  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [size, setSize] = useState({ width: 400, height: 400 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState('');
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });

  // Handle drag start
  const handleDragStart = (e) => {
    if (e.target.classList.contains('resize-handle')) return;
    
    setIsDragging(true);
    const rect = popupRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  // Handle drag
  const handleDrag = (e) => {
    if (!isDragging) return;
    
    const newX = e.clientX - dragOffset.x;
    const newY = e.clientY - dragOffset.y;
    
    // Boundary checks
    const boundedX = Math.max(0, Math.min(newX, window.innerWidth - size.width));
    const boundedY = Math.max(0, Math.min(newY, window.innerHeight - size.height));
    
    setPosition({ x: boundedX, y: boundedY });
  };

  // Handle drag end
  const handleDragEnd = () => {
    setIsDragging(false);
  };

  // Handle resize start
  const handleResizeStart = (e, direction) => {
    e.stopPropagation();
    setIsResizing(true);
    setResizeDirection(direction);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: size.width,
      height: size.height
    });
  };

  // Handle resize
  const handleResize = (e) => {
    if (!isResizing) return;
    
    const deltaX = e.clientX - resizeStart.x;
    const deltaY = e.clientY - resizeStart.y;
    
    let newWidth = size.width;
    let newHeight = size.height;
    let newX = position.x;
    let newY = position.y;
    
    switch (resizeDirection) {
      case 'se': // Southeast
        newWidth = Math.max(200, resizeStart.width + deltaX);
        newHeight = Math.max(200, resizeStart.height + deltaY);
        break;
      case 'sw': // Southwest
        newWidth = Math.max(200, resizeStart.width - deltaX);
        newHeight = Math.max(200, resizeStart.height + deltaY);
        newX = position.x + (size.width - newWidth);
        break;
      case 'ne': // Northeast
        newWidth = Math.max(200, resizeStart.width + deltaX);
        newHeight = Math.max(200, resizeStart.height - deltaY);
        newY = position.y + (size.height - newHeight);
        break;
      case 'nw': // Northwest
        newWidth = Math.max(200, resizeStart.width - deltaX);
        newHeight = Math.max(200, resizeStart.height - deltaY);
        newX = position.x + (size.width - newWidth);
        newY = position.y + (size.height - newHeight);
        break;
      case 'e': // East
        newWidth = Math.max(200, resizeStart.width + deltaX);
        break;
      case 'w': // West
        newWidth = Math.max(200, resizeStart.width - deltaX);
        newX = position.x + (size.width - newWidth);
        break;
      case 's': // South
        newHeight = Math.max(200, resizeStart.height + deltaY);
        break;
      case 'n': // North
        newHeight = Math.max(200, resizeStart.height - deltaY);
        newY = position.y + (size.height - newHeight);
        break;
    }
    
    // Boundary checks
    if (newX < 0) {
      newWidth += newX;
      newX = 0;
    }
    if (newY < 0) {
      newHeight += newY;
      newY = 0;
    }
    if (newX + newWidth > window.innerWidth) {
      newWidth = window.innerWidth - newX;
    }
    if (newY + newHeight > window.innerHeight) {
      newHeight = window.innerHeight - newY;
    }
    
    setSize({ width: newWidth, height: newHeight });
    setPosition({ x: newX, y: newY });
  };

  // Handle resize end
  const handleResizeEnd = () => {
    setIsResizing(false);
  };

  // Add event listeners
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging) {
        handleDrag(e);
      } else if (isResizing) {
        handleResize(e);
      }
    };
    
    const handleMouseUp = () => {
      handleDragEnd();
      handleResizeEnd();
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, dragOffset, resizeStart, resizeDirection, size, position]);

  // Handle window resize
  useEffect(() => {
    const handleWindowResize = () => {
      // Adjust position if popup goes off-screen
      setPosition(prev => ({
        x: Math.max(0, Math.min(prev.x, window.innerWidth - size.width)),
        y: Math.max(0, Math.min(prev.y, window.innerHeight - size.height))
      }));
    };
    
    window.addEventListener('resize', handleWindowResize);
    return () => window.removeEventListener('resize', handleWindowResize);
  }, [size]);

  return (
    <div className="fixed inset-0 z-[100] bg-black/30 backdrop-blur-sm">
      <div
        ref={popupRef}
        className="absolute bg-[#1a1a1a] border border-[#333] rounded-lg shadow-2xl overflow-hidden flex flex-col"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: `${size.width}px`,
          height: `${size.height}px`,
          cursor: isDragging ? 'grabbing' : 'default'
        }}
      >
        {/* Header with drag handle and close button */}
        <div
          className="flex items-center justify-between p-3 bg-[#242524] border-b border-[#333] cursor-move"
          onMouseDown={handleDragStart}
        >
          <h3 className="text-lg font-medium text-[#E4E4E4] truncate">
            {character.name}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-[#333] transition-colors"
            aria-label="Close popup"
          >
            <X size={20} className="text-[#A2A2A2]" />
          </button>
        </div>
        
        {/* Content area */}
        <div className="flex-1 flex items-center justify-center p-4 overflow-auto">
          {character.avatarURL ? (
            <img
              src={character.avatarURL}
              alt={`${character.name} full view`}
              className="object-contain max-w-full max-h-full rounded-lg"
              draggable={false}
            />
          ) : (
            <div className="text-[#A2A2A2]">No image available</div>
          )}
        </div>
        
        {/* Resize handles */}
        <div
          className="absolute w-3 h-3 bg-[#3A9E49] opacity-0 hover:opacity-100 transition-opacity rounded-full cursor-nw-resize resize-handle"
          style={{ top: -6, left: -6 }}
          onMouseDown={(e) => handleResizeStart(e, 'nw')}
        />
        <div
          className="absolute w-3 h-3 bg-[#3A9E49] opacity-0 hover:opacity-100 transition-opacity rounded-full cursor-n-resize resize-handle"
          style={{ top: -6, left: '50%', transform: 'translateX(-50%)' }}
          onMouseDown={(e) => handleResizeStart(e, 'n')}
        />
        <div
          className="absolute w-3 h-3 bg-[#3A9E49] opacity-0 hover:opacity-100 transition-opacity rounded-full cursor-ne-resize resize-handle"
          style={{ top: -6, right: -6 }}
          onMouseDown={(e) => handleResizeStart(e, 'ne')}
        />
        <div
          className="absolute w-3 h-3 bg-[#3A9E49] opacity-0 hover:opacity-100 transition-opacity rounded-full cursor-e-resize resize-handle"
          style={{ top: '50%', right: -6, transform: 'translateY(-50%)' }}
          onMouseDown={(e) => handleResizeStart(e, 'e')}
        />
        <div
          className="absolute w-3 h-3 bg-[#3A9E49] opacity-0 hover:opacity-100 transition-opacity rounded-full cursor-se-resize resize-handle"
          style={{ bottom: -6, right: -6 }}
          onMouseDown={(e) => handleResizeStart(e, 'se')}
        />
        <div
          className="absolute w-3 h-3 bg-[#3A9E49] opacity-0 hover:opacity-100 transition-opacity rounded-full cursor-s-resize resize-handle"
          style={{ bottom: -6, left: '50%', transform: 'translateX(-50%)' }}
          onMouseDown={(e) => handleResizeStart(e, 's')}
        />
        <div
          className="absolute w-3 h-3 bg-[#3A9E49] opacity-0 hover:opacity-100 transition-opacity rounded-full cursor-sw-resize resize-handle"
          style={{ bottom: -6, left: -6 }}
          onMouseDown={(e) => handleResizeStart(e, 'sw')}
        />
        <div
          className="absolute w-3 h-3 bg-[#3A9E49] opacity-0 hover:opacity-100 transition-opacity rounded-full cursor-w-resize resize-handle"
          style={{ top: '50%', left: -6, transform: 'translateY(-50%)' }}
          onMouseDown={(e) => handleResizeStart(e, 'w')}
        />
      </div>
    </div>
  );
};

export default CharacterImagePopup;