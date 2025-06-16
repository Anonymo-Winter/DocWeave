import React from 'react';

const Navbar = () => {
    return (
        <div className='h-12 bg-blue-500'>
            NavBar
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
                className='bg-red-500 p-2'
            >
                show me
            </button>
        </div>
    );
};

export default Navbar;
