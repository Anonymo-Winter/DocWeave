import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Camera, EditIcon } from 'lucide-react';
import { InputField } from './InputField';
import { SuccessAlert, ErrorAlert } from './Alert';
import { useUpdateProfileMutation } from '../api/userApi';

const ProfileEditModal = ({ user }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [fullName, setFullName] = useState(user.name);
    const [profileImage, setProfileImage] = useState(user.image || null);
    const [error, setError] = useState('');
    const [imageError, setImageError] = useState('');
    const [success, setSuccess] = useState('');
    const [generalError, setGeneralError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [updateProfile] = useUpdateProfileMutation();

    // Maximum file size: 2MB (industry standard for profile pictures)
    const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB in bytes

    const getInitials = () => {
        const words = fullName.trim() ? fullName.trim().split(' ') : '?';
        return words.length > 1 ? words[0][0].toUpperCase() + words[1][0].toUpperCase() : words[0][0].toUpperCase();
    };

    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        setError('');
        setImageError('');

        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setImageError('Please select a valid image file');

            return;
        }

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
            setImageError('Image size must be less than 2MB');
            return;
        }

        // Create image preview
        const reader = new FileReader();
        reader.onload = (e) => {
            setProfileImage(e.target.result);
        };
        reader.readAsDataURL(file);
    };

    const validateFullName = (value) => {
        if (!value) {
            setError('Name is required');
        } else if (value.length < 3) {
            setError('Name must be at least 3 characters');
        } else if (value.length > 20) {
            setError('Name must be at most 20 characters');
        } else if (!/^[a-zA-Z\s]+$/.test(value)) {
            setError('Name must contain only letters and spaces');
        } else {
            setError('');
        }
        return error.length === 0;
    };

    const handleSaveChanges = async () => {
        if (!validateFullName(fullName)) return;

        setGeneralError('');
        setIsLoading(true);
        try {
            const res = await updateProfile({ name: fullName.trim(), image: profileImage }).unwrap();
            if (!res?.success) throw new Error(res?.message || 'Failed to update profile.');
            setSuccess('Profile updated successfully!');
            setTimeout(() => {
                setSuccess('');
                setIsOpen(false);
            }, 1500);
        } catch (error) {
            setGeneralError(error?.data?.message || error.message || 'Failed to update profile. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        setFullName(user.name);
        setError('');
        setImageError('');
        setSuccess('');
        setGeneralError('');
        setIsOpen(false);
    };

    return (
        <Dialog
            open={isOpen}
            onOpenChange={(open) => {
                if (!open) {
                    if (!success) {
                        handleCancel();
                        setFullName(user.name);
                        setError('');
                        setImageError('');
                        setGeneralError('');
                    }
                }
                setIsOpen(open);
            }}
            aria-label='Edit Profile'
        >
            <DialogTrigger asChild>
                <button
                    className='flex items-start gap-2 w-full  px-2 py-2 rounded-md cursor-pointer hover:bg-accent hover:text-accent-foreground'
                    onClick={(e) => e.stopPropagation()}
                >
                    <EditIcon className='size-5' />
                    <span className='text-sm font-medium'>Edit Profile</span>
                </button>
            </DialogTrigger>

            <DialogContent className='sm:max-w-md bg-slate-50 dark:bg-gray-700'>
                <DialogHeader>
                    <DialogTitle className='text-center text-xl font-semibold'>Edit Profile</DialogTitle>
                </DialogHeader>

                <div className='space-y-6 py-4'>
                    {/* Profile Picture Section */}
                    <div className='flex flex-col items-center space-y-4'>
                        <div className='relative group'>
                            <Avatar
                                className={`w-24 h-24 cursor-pointer transition-opacity group-hover:opacity-80 ring-2 ring-violet-500  ${
                                    imageError ? 'ring-2 ring-red-500' : ''
                                }`}
                            >
                                <AvatarImage src={profileImage} alt='Profile picture' className='object-cover' />
                                <AvatarFallback className='text-lg font-semibold bg-gradient-to-br from-blue-500 to-purple-600 text-white'>
                                    {getInitials(fullName)}
                                </AvatarFallback>
                            </Avatar>

                            <div className='absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full bg-gray-600 dark:bg-gray-400 bg-opacity-50'>
                                <Camera className='w-6 h-6 text-white dark:text-gray-900' />
                            </div>

                            <input
                                type='file'
                                accept='image/*'
                                onChange={handleImageUpload}
                                className={`absolute inset-0 w-full h-full opacity-0 cursor-pointer ${
                                    imageError ? 'ring-2 ring-red-500' : ''
                                }`}
                                aria-label='Upload profile picture'
                            />
                        </div>
                        {imageError && <p className='text-sm text-red-500'>{imageError}</p>}

                        <p className='text-sm text-gray-600 dark:text-gray-300 text-center'>
                            Click to upload profile picture
                            <br />
                            <span className='text-xs'>Max size: 2MB</span>
                        </p>
                    </div>

                    <ErrorAlert message={generalError} onClose={() => setGeneralError('')} />
                    <SuccessAlert message={success} onClose={() => setSuccess('')} />

                    {/* Full Name Input */}
                    <div className='space-y-2'>
                        <Label htmlFor='fullName' className='text-sm font-medium'>
                            Full Name
                        </Label>
                        <InputField
                            type='text'
                            placeholder='Enter your email'
                            value={fullName}
                            onChange={(e) => {
                                setFullName(e.target.value);
                            }}
                            error={error}
                            autoComplete='off'
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className='flex gap-3 pt-4'>
                        <Button variant='outline' onClick={handleCancel} className='flex-1'>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSaveChanges}
                            className='flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
                        >
                            {isLoading ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ProfileEditModal;
