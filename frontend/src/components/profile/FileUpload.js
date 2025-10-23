import React, { useState, useRef } from 'react';
import { Button, ProgressBar } from 'react-bootstrap';

const FileUpload = ({ currentFile, onUpload, loading, acceptedTypes, maxSize, fileType }) => {
    const [dragOver, setDragOver] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const fileInputRef = useRef(null);

    const getFileIcon = (fileName) => {
        if (!fileName) return 'fas fa-file';
        
        const extension = fileName.split('.').pop().toLowerCase();
        switch (extension) {
            case 'pdf':
                return 'fas fa-file-pdf text-danger';
            case 'doc':
            case 'docx':
                return 'fas fa-file-word text-primary';
            case 'jpg':
            case 'jpeg':
            case 'png':
            case 'gif':
            case 'svg':
                return 'fas fa-file-image text-success';
            default:
                return 'fas fa-file';
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const validateFile = (file) => {
        // Check file type
        const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
        const acceptedTypesArray = acceptedTypes ? acceptedTypes.split(',') : [];
        
        if (acceptedTypesArray.length > 0 && !acceptedTypesArray.includes(fileExtension)) {
            alert(`Please select a valid file type: ${acceptedTypes}`);
            return false;
        }

        // Check file size
        const maxSizeBytes = maxSize * 1024 * 1024; // Convert MB to bytes
        if (file.size > maxSizeBytes) {
            alert(`File size must be less than ${maxSize}MB`);
            return false;
        }

        return true;
    };

    const handleFileSelect = (file) => {
        if (!file) return;

        if (!validateFile(file)) return;

        // Simulate upload progress
        setUploadProgress(0);
        const interval = setInterval(() => {
            setUploadProgress(prev => {
                if (prev >= 90) {
                    clearInterval(interval);
                    return 90;
                }
                return prev + 10;
            });
        }, 100);

        // Upload file
        onUpload(file).finally(() => {
            clearInterval(interval);
            setUploadProgress(100);
            setTimeout(() => setUploadProgress(0), 1000);
        });
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

    const handleDownload = () => {
        if (currentFile?.url) {
            window.open(currentFile.url, '_blank');
        }
    };

    const handleRemove = () => {
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        // You might want to call an onRemove callback here
    };

    return (
        <div className="file-upload">
            <div 
                className={`file-upload-area ${dragOver ? 'drag-over' : ''} ${loading ? 'loading' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={handleClick}
            >
                {currentFile ? (
                    <div className="file-preview">
                        <div className="file-info">
                            <i className={getFileIcon(currentFile.name)}></i>
                            <div className="file-details">
                                <h6 className="file-name">{currentFile.name}</h6>
                                <p className="file-size">{formatFileSize(currentFile.size)}</p>
                            </div>
                        </div>
                        <div className="file-overlay">
                            <i className="fas fa-upload"></i>
                            <span>Replace File</span>
                        </div>
                        {loading && (
                            <div className="upload-loading">
                                <div className="spinner-border spinner-border-sm"></div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="file-placeholder">
                        <i className={`fas ${fileType === 'resume' ? 'fa-file-upload' : fileType === 'logo' ? 'fa-image' : 'fa-upload'}`}></i>
                        <h6>Upload {fileType === 'resume' ? 'Resume' : fileType === 'logo' ? 'Logo' : 'File'}</h6>
                        <p>Drag & drop or click to select</p>
                        <small>
                            {acceptedTypes ? acceptedTypes.replace(/\./g, '').toUpperCase() : 'All files'} 
                            {maxSize && ` up to ${maxSize}MB`}
                        </small>
                        {loading && (
                            <div className="upload-loading">
                                <div className="spinner-border spinner-border-sm"></div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="upload-progress mt-2">
                    <ProgressBar 
                        now={uploadProgress} 
                        label={`${uploadProgress}%`}
                        variant="primary"
                        animated
                    />
                </div>
            )}

            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileInputChange}
                accept={acceptedTypes}
                style={{ display: 'none' }}
            />

            {currentFile && (
                <div className="file-actions mt-3">
                    <Button
                        variant="outline-success"
                        size="sm"
                        onClick={handleDownload}
                        disabled={loading}
                        className="me-2"
                    >
                        <i className="fas fa-download me-1"></i>
                        Download
                    </Button>
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
                        <i className="fas fa-upload me-1"></i>
                        Replace
                    </Button>
                </div>
            )}
        </div>
    );
};

export default FileUpload;