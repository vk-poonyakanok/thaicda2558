
import React from 'react';

const Footer: React.FC = () => {
    return (
        <footer className="bg-slate-800 text-white mt-auto">
            <div className="container mx-auto px-4 py-6 text-center">
                <p>&copy; {new Date().getFullYear()} - พระราชบัญญัติโรคติดต่อ พ.ศ. ๒๕๕๘ Explorer</p>
            </div>
        </footer>
    );
};

export default Footer;
