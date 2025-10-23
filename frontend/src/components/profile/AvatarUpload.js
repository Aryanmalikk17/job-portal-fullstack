import React, { useState, useRef } from 'react';
import { Button } from 'react-bootstrap';

const AvatarUpload = ({ currentImage, onUpload, loading }) => {
    const [preview, setPreview] = useState(currentImage);
    const [dragOver, setDragOver] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileSelect = (file) => {
        if (!file) return;

        // Validate file type
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
        if (!validTypes.includes(file.type)) {
            alert('Please select a valid image file (JPEG, PNG, or GIF)');
            return;
        }

        // Validate file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            alert('File size must be less than 2MB');
            return;
        }

        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
            setPreview(e.target.result);
        };
        reader.readAsDataURL(file);

        // Upload file
        onUpload(file);
    };

    const handleFileInputChange = (e) => {
        const file = e.target.files[0];
        handleFileSelect(file);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setDragOver(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setDragOver(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        handleFileSelect(file);
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    const handleRemove = () => {
        setPreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        // You might want to call an onRemove callback here
    };

    return (
        <div className="avatar-upload">
            <div 
                className={`avatar-upload-area ${dragOver ? 'drag-over' : ''} ${loading ? 'loading' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={handleClick}
            >
                {preview ? (
                    <div className="avatar-preview">
                        <img src={preview} alt="Profile preview" className="avatar-image" />
                        <div className="avatar-overlay">
                            <i className="fas fa-camera"></i>
                            <span>Change Photo</span>
                        </div>
                        {loading && (
                            <div className="upload-loading">
                                <div className="spinner-border spinner-border-sm"></div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="avatar-placeholder">
                        <i className="fas fa-user-plus"></i>
                        <h6>Upload Photo</h6>
                        <p>Drag & drop or click to select</p>
                        <small>JPEG, PNG, GIF up to 2MB</small>
                        {loading && (
                            <div className="upload-loading">
                                <div className="spinner-border spinner-border-sm"></div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileInputChange}
                accept="image/jpeg,image/jpg,image/png,image/gif"
                style={{ display: 'none' }}
            />

            {preview && (
                <div className="avatar-actions mt-3">
                    <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={handleRemove}
                        disabled={loading}
                        className="me-2"
                    >
                        <i className="fas fa-trash me-1"></i>
                        Remove
                    </Button>
                    <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={handleClick}
                        disabled={loading}
                    >
                        <i className="fas fa-camera me-1"></i>
                        Change
                    </Button>
                </div>
            )}
        </div>
    );
};

export default AvatarUpload;