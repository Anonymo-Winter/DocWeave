import { TbLoader2 } from 'react-icons/tb';

const Loader = () => {
    return (
        <div className='min-h-screen flex items-center justify-center'>
            <TbLoader2 className='animate-spin size-10 text-blue-500' />
        </div>
    );
};

export default Loader;
