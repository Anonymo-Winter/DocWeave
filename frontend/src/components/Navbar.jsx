import React from 'react';
import { MessageSquareMore } from 'lucide-react';

const Navbar = () => {
    return (
        <div className='h-12 bg-blue-500 flex items-center justify-between px-10'>
            <span className='font-bold text-xl'>NavBar</span>
            <button
                onClick={() => {
                    const el = document.querySelector('.active-chats');
                    const isHidden = el.style.display === 'none' || getComputedStyle(el).display === 'none';
                    console.log(el);
                    if (isHidden) {
                        el.style.display = 'block';
                        el.style.visibility = 'visible';
                    } else {
                        el.style.display = 'none';
                        el.style.visibility = 'hidden';
                    }
                }}
                className='border bg-white text-blue-500 rounded-full p-2 me-10'
            >
                <MessageSquareMore size='16' />
            </button>
        </div>
    );
};

export default Navbar;
