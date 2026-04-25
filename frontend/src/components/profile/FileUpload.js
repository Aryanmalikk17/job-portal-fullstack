import React, { useState, useRef } from 'react';
import { Button, ProgressBar } from 'react-bootstrap';
import { 
    FileText, 
    FileImage, 
    FileUp, 
    Image, 
    Upload, 
    Download, 
    Trash2
} from 'lucide-react';
import { getFullFileUrl } from '../../services/profileService';
import './FileUpload.css';

const FileUpload = ({ currentFile, onUpload, loading, acceptedTypes, maxSize, fileType }) => {
    const [dragOver, setDragOver] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const fileInputRef = useRef(null);

    const getFileIcon = (fileName) => {
        if (!fileName) return FileText;
        
        const extension = fileName.split('.').pop().toLowerCase();
        switch (extension) {
            case 'pdf':
            case 'doc':
            case 'docx':
                return FileText;
            case 'jpg':
            case 'jpeg':
            case 'png':
            case 'gif':
            case 'svg':
                return FileImage;
            default:
                return FileText;
        }
    };

    const getIconColorClass = (fileName) => {
        if (!fileName) return 'text-muted';
        const extension = fileName.split('.').pop().toLowerCase();
        switch (extension) {
            case 'pdf': return 'text-danger';
            case 'doc':
            case 'docx': return 'text-primary';
            case 'jpg':
            case 'jpeg':
            case 'png':
            case 'gif':
            case 'svg': return 'text-success';
            default: return 'text-muted';
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
        if (currentFile) {
            const url = getFullFileUrl(currentFile, fileType === 'logo' ? 'companyLogo' : 'resume');
            window.open(url, '_blank');
        }
    };

    const handleRemove = () => {
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        // You might want to call an onRemove callback here
    };

    const FileIcon = currentFile ? getFileIcon(currentFile instanceof File ? currentFile.name : currentFile) : null;
    const PlaceholderIcon = fileType === 'resume' ? FileUp : fileType === 'logo' ? Image : Upload;

    return (
        <div className="file-upload">
            <div 
                className={`file-upload-area ${dragOver ? 'drag-over' : ''} ${loading ? 'loading' : ''} border-2 border-dashed rounded-3 p-4 text-center cursor-pointer`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={handleClick}
            >
                {currentFile ? (
                    <div className="file-preview position-relative">
                        <div className="file-info d-flex align-items-center justify-content-center flex-column">
                            <FileIcon size={48} className={getIconColorClass(currentFile instanceof File ? currentFile.name : currentFile)} />
                            <div className="file-details mt-2">
                                <h6 className="file-name mb-1 fw-bold">
                                    {currentFile instanceof File ? currentFile.name : currentFile}
                                </h6>
                                <p className="file-size text-muted small mb-0">
                                    {currentFile instanceof File ? formatFileSize(currentFile.size) : 'Previously uploaded'}
                                </p>
                            </div>
                        </div>
                        <div className="file-overlay position-absolute top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center bg-white bg-opacity-75 opacity-0 transition-all hover-opacity-100">
                            <Upload size={24} className="mb-2" />
                            <span className="fw-bold">Replace File</span>
                        </div>
                        {loading && (
                            <div className="upload-loading position-absolute top-50 start-50 translate-middle">
                                <div className="spinner-border spinner-border-sm text-primary"></div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="file-placeholder">
                        <PlaceholderIcon size={48} className="text-muted mb-3 opacity-50" />
                        <h6 className="fw-bold">Upload {fileType === 'resume' ? 'Resume' : fileType === 'logo' ? 'Logo' : 'File'}</h6>
                        <p className="text-muted mb-2">Drag & drop or click to select</p>
                        <small className="text-muted d-block">
                            {acceptedTypes ? acceptedTypes.replace(/\./g, '').toUpperCase() : 'All files'} 
                            {maxSize && ` up to ${maxSize}MB`}
                        </small>
                        {loading && (
                            <div className="upload-loading mt-3">
                                <div className="spinner-border spinner-border-sm text-primary"></div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="upload-progress mt-3">
                    <ProgressBar 
                        now={uploadProgress} 
                        label={`${uploadProgress}%`}
                        variant="primary"
                        animated
                        className="rounded-pill"
                        style={{ height: '10px' }}
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
                <div className="file-actions mt-3 d-flex flex-wrap gap-2">
                    <Button
                        variant="outline-success"
                        size="sm"
                        onClick={handleDownload}
                        disabled={loading}
                        className="d-inline-flex align-items-center px-3"
                    >
                        <Download size={14} className="me-2" />
                        Download
                    </Button>
                    <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={handleRemove}
                        disabled={loading}
                        className="d-inline-flex align-items-center px-3"
                    >
                        <Trash2 size={14} className="me-2" />
                        Remove
                    </Button>
                    <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={handleClick}
                        disabled={loading}
                        className="d-inline-flex align-items-center px-3"
                    >
                        <Upload size={14} className="me-2" />
                        Replace
                    </Button>
                </div>
            )}
        </div>
    );
};

export default FileUpload;