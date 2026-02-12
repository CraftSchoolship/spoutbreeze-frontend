"use client";

import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";

interface VideoModalProps {
    isOpen: boolean;
    onClose: () => void;
    videoSrc: string;
}

const VideoModal: React.FC<VideoModalProps> = ({ isOpen, onClose, videoSrc }) => {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };

        if (isOpen) {
            document.addEventListener("keydown", handleEsc);
            document.body.style.overflow = "hidden";
        }

        return () => {
            document.removeEventListener("keydown", handleEsc);
            document.body.style.overflow = "unset";
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return createPortal(
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
            aria-modal="true"
            role="dialog"
        >
            {/* Backdrop with blur */}
            <div
                className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-5xl bg-black rounded-2xl shadow-2xl overflow-hidden ring-1 ring-white/10 animate-in fade-in zoom-in-95 duration-200">
                <div className="absolute top-4 right-4 z-10">
                    <IconButton
                        onClick={onClose}
                        sx={{
                            color: 'white',
                            backgroundColor: 'rgba(0,0,0,0.5)',
                            '&:hover': { backgroundColor: 'rgba(0,0,0,0.7)' }
                        }}
                        aria-label="Close video"
                    >
                        <CloseIcon />
                    </IconButton>
                </div>

                <div className="relative pt-[56.25%] bg-black">
                    <video
                        ref={videoRef}
                        className="absolute inset-0 w-full h-full"
                        controls
                        autoPlay
                        playsInline
                        src={videoSrc}
                    >
                        Your browser does not support the video tag.
                    </video>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default VideoModal;
