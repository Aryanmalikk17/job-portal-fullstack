import React, { useMemo } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const RichTextEditor = ({ value, onChange, placeholder, className }) => {
    // Quill configuration
    const modules = useMemo(() => ({
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            [{ 'indent': '-1' }, { 'indent': '+1' }],
            ['link'],
            ['clean']
        ],
        clipboard: {
            // toggle to add extra line breaks when pasting HTML:
            matchVisual: false,
        }
    }), []);

    const formats = [
        'header', 'bold', 'italic', 'underline',
        'list', 'bullet', 'indent',
        'link'
    ];

    const handleChange = (content, delta, source, editor) => {
        if (onChange) {
            onChange(content);
        }
    };

    return (
        <div className={`rich-text-editor ${className || ''}`}>
            <ReactQuill
                theme="snow"
                value={value || ''}
                onChange={handleChange}
                modules={modules}
                formats={formats}
                placeholder={placeholder || 'Enter description...'}
                style={{
                    backgroundColor: 'white',
                }}
            />
        </div>
    );
};

export default RichTextEditor;