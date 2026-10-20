import { TbLoader2 } from 'react-icons/tb';
import { GiOverInfinity } from 'react-icons/gi';

const Loader = ({ label = 'Loading…' }) => {
    return (
        <div className='min-h-screen w-full flex flex-col items-center justify-center bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200'>
            <div className='relative w-14 h-14 mb-4'>
                <div className='absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-lg'>
                    <GiOverInfinity className='text-white size-7' />
                </div>
            </div>
            <div className='flex items-center gap-2'>
                <TbLoader2 className='animate-spin size-4 text-purple-500' />
                <span className='text-sm text-gray-500 dark:text-gray-400'>{label}</span>
            </div>
        </div>
    );
};

export default Loader;
