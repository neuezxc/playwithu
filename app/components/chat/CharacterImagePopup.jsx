import React, { useState, useEffect, useRef } from 'react';
import { X, Maximize2 } from 'lucide-react';

const CharacterImagePopup = ({ isOpen, onClose, imageSrc, characterName }) => {
    const [position, setPosition] = useState({ x: 100, y: 100 });
    const [imgSize, setImgSize] = useState({ width: 300, height: 400 }); // Size of the image part
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const dragStartPos = useRef({ x: 0, y: 0 });
    const resizeStartPos = useRef({ x: 0, y: 0 });
    const initialImgSize = useRef({ width: 0, height: 0 });
    const aspectRatio = useRef(null);

    useEffect(() => {
        if (isOpen) {
            const windowWidth = window.innerWidth;
            const windowHeight = window.innerHeight;

            // Calculate max available dimensions (90% of screen)
            const maxWidth = windowWidth * 0.9;
            const maxHeight = windowHeight * 0.8; // Leave room for header/other UI

            let { width, height } = imgSize;

            // If image hasn't loaded yet, we might have default 300x400. 
            // If it has loaded, we have aspect ratio.
            // We should ensure initial open fits the screen.

            if (aspectRatio.current) {
                // If we have aspect ratio, resize to fit within max dimensions while maintaining ratio
                if (width > maxWidth || height > maxHeight) {
                    const scale = Math.min(maxWidth / width, maxHeight / height);
                    width *= scale;
                    height *= scale;
                    setImgSize({ width, height });
                }
            } else {
                // Default fallback if no ratio yet, just clamp
                if (width > maxWidth) width = maxWidth;
                if (height > maxHeight) height = maxHeight;
                // We'll let handleImageLoad fix the ratio later
            }

            setPosition({
                x: (windowWidth - width) / 2,
                y: (windowHeight - (height + 32)) / 2
            });
        }
    }, [isOpen]);

    const handleImageLoad = (e) => {
        const { naturalWidth, naturalHeight } = e.target;
        aspectRatio.current = naturalWidth / naturalHeight;

        // Recalculate size to fit screen on load
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        const maxWidth = windowWidth * 0.9;
        const maxHeight = windowHeight * 0.8;

        let defaultHeight = 400;
        let width = defaultHeight * aspectRatio.current;
        let height = defaultHeight;

        // Scale down if too big for mobile
        if (width > maxWidth || height > maxHeight) {
            const scale = Math.min(maxWidth / width, maxHeight / height);
            width *= scale;
            height *= scale;
        }

        setImgSize({ width, height });

        // Re-center after load resize
        setPosition({
            x: (windowWidth - width) / 2,
            y: (windowHeight - (height + 32)) / 2
        });
    };

    useEffect(() => {
        const handleMove = (clientX, clientY) => {
            if (isDragging) {
                const dx = clientX - dragStartPos.current.x;
                const dy = clientY - dragStartPos.current.y;
                setPosition(prev => ({
                    x: prev.x + dx,
                    y: prev.y + dy
                }));
                dragStartPos.current = { x: clientX, y: clientY };
            } else if (isResizing) {
                const dy = clientY - resizeStartPos.current.y;
                // Scale based on height change, maintain aspect ratio
                const newHeight = Math.max(100, initialImgSize.current.height + dy);
                const newWidth = aspectRatio.current ? newHeight * aspectRatio.current : newHeight; // Fallback if no ratio

                setImgSize({
                    width: newWidth,
                    height: newHeight
                });
            }
        };

        const handleMouseMove = (e) => handleMove(e.clientX, e.clientY);
        const handleTouchMove = (e) => {
            // Prevent scrolling while dragging/resizing
            if (isDragging || isResizing) e.preventDefault();
            const touch = e.touches[0];
            handleMove(touch.clientX, touch.clientY);
        };

        const handleEnd = () => {
            setIsDragging(false);
            setIsResizing(false);
        };

        if (isDragging || isResizing) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleEnd);
            window.addEventListener('touchmove', handleTouchMove, { passive: false });
            window.addEventListener('touchend', handleEnd);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleEnd);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleEnd);
        };
    }, [isDragging, isResizing]);

    const handleStart = (clientX, clientY, type) => {
        if (type === 'drag') {
            setIsDragging(true);
            dragStartPos.current = { x: clientX, y: clientY };
        } else if (type === 'resize') {
            setIsResizing(true);
            resizeStartPos.current = { x: clientX, y: clientY };
            initialImgSize.current = { ...imgSize };
        }
    };

    const handleMouseDown = (e) => {
        if (e.target.closest('.resize-handle') || e.target.closest('.close-button')) return;
        handleStart(e.clientX, e.clientY, 'drag');
    };

    const handleTouchStart = (e) => {
        if (e.target.closest('.resize-handle') || e.target.closest('.close-button')) return;
        const touch = e.touches[0];
        handleStart(touch.clientX, touch.clientY, 'drag');
    };

    const handleResizeMouseDown = (e) => {
        e.stopPropagation();
        handleStart(e.clientX, e.clientY, 'resize');
    };

    const handleResizeTouchStart = (e) => {
        e.stopPropagation();
        const touch = e.touches[0];
        handleStart(touch.clientX, touch.clientY, 'resize');
    };

    const handleWheel = (e) => {
        e.stopPropagation();
        const scale = e.deltaY < 0 ? 1.05 : 0.95;

        const currentWidth = imgSize.width;
        const currentHeight = imgSize.height;
        const currentX = position.x;
        const currentY = position.y;

        const newWidth = Math.max(100, currentWidth * scale);
        const newHeight = Math.max(100, currentHeight * scale);

        const diffW = currentWidth - newWidth;
        const diffH = currentHeight - newHeight;

        setImgSize({ width: newWidth, height: newHeight });
        setPosition({
            x: currentX + diffW / 2,
            y: currentY + diffH / 2
        });
    };

    if (!isOpen || !imageSrc) return null;

    return (
        <div
            className="fixed z-50 rounded-lg shadow-2xl flex flex-col"
            style={{
                left: position.x,
                top: position.y,
                width: imgSize.width,
                // Total height is image height + header height (32px)
                height: imgSize.height + 32,
                cursor: isDragging ? 'grabbing' : 'auto',
                backgroundColor: 'transparent' // Transparent bg to avoid black bars
            }}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            onWheel={handleWheel}
        >
            {/* Header / Drag Handle */}
            <div className="h-8 bg-[#2a2a2a] flex items-center justify-between px-2 cursor-grab active:cursor-grabbing rounded-t-lg border border-[#333] border-b-0">
                <span className="text-xs text-gray-400 font-medium truncate select-none">{characterName}</span>
                <button
                    onClick={onClose}
                    className="close-button text-gray-400 hover:text-white p-1 rounded hover:bg-[#333] transition-colors"
                >
                    <X size={14} />
                </button>
            </div>

            {/* Image Content */}
            <div
                className="relative overflow-hidden bg-black/5 border border-[#333] border-t-0 rounded-b-lg"
                style={{ width: imgSize.width, height: imgSize.height }}
            >
                <img
                    src={imageSrc}
                    alt={characterName}
                    className="w-full h-full object-contain pointer-events-none select-none"
                    onLoad={handleImageLoad}
                />

                {/* Resize Handle - Inside image area to avoid sticking out */}
                <div
                    className="resize-handle absolute bottom-0 right-0 w-8 h-8 cursor-se-resize flex items-center justify-center text-white/50 hover:text-white touch-none"
                    onMouseDown={handleResizeMouseDown}
                    onTouchStart={handleResizeTouchStart}
                >
                    <Maximize2 size={16} className="transform rotate-90 drop-shadow-md" />
                </div>
            </div>
        </div>
    );
};

export default CharacterImagePopup;
