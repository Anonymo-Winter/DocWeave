import React from 'react';
import { useUploadDocumentImageMutation } from '../api/docApi';
import { RiImageAddFill } from 'react-icons/ri';

const ImageUploadButton = ({ editor, documentId, text = 'Upload Image' }) => {
    const [uploadImage] = useUploadDocumentImageMutation();

    const handleClick = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';

        input.onchange = async () => {
            const file = input.files?.[0];
            if (!file) return;

            try {
                const data = await uploadImage({ documentId, file }).unwrap();
                editor.chain().focus().setImage({ src: data.url }).run();
            } catch (err) {
                console.error('Image upload failed:', err);
            }
        };

        input.click();
    };

    return (
        <button
            type='button'
            onClick={handleClick}
            // className='px-2 py-1 rounded bg-blue-500 text-white hover:bg-blue-600'
        >
            <RiImageAddFill size={30} />
        </button>
    );
};

export default ImageUploadButton;
