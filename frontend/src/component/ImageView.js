import React, { useEffect } from "react";

const ImageViewer = ({ image, onClose }) => {

    useEffect(() => {

        const handleEsc = (e) => {
            if (e.key === "Escape") {
                onClose();
            }
        };

        window.addEventListener("keydown", handleEsc);

        return () =>
            window.removeEventListener(
                "keydown",
                handleEsc
            );

    }, [onClose]);

    return (
        <div
            className="image-viewer-overlay"
            onClick={onClose}
        >

            <div
                className="image-viewer-content"
                onClick={(e) => e.stopPropagation()}
            >

                <button
                    className="image-close-btn"
                    onClick={onClose}
                >
                    ✕
                </button>

                <a
                    href={image}
                    download
                    target="_blank"
                    rel="noreferrer"
                    className="download-btn"
                >
                    ⬇ Download
                </a>

                <img
                    src={image}
                    alt="Preview"
                />

            </div>

        </div>
    );
};

export default ImageViewer;