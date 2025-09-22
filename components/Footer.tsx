
import React from 'react';

const toThaiDigits = (n: number | string): string => {
    const arabic = '0123456789';
    const thai = '๐๑๒๓๔๕๖๗๘๙';
    return String(n).replace(/[0-9]/g, (d) => thai[arabic.indexOf(d)]);
};

const Footer: React.FC = () => {
    return (
        <footer className="bg-slate-800 text-white mt-auto">
            <div className="container mx-auto px-4 py-6 text-center">
                <p>&copy; {toThaiDigits(new Date().getFullYear())} - พระราชบัญญัติโรคติดต่อ พ.ศ. ๒๕๕๘ (ไม่เป็นทางการ)</p>
            </div>
        </footer>
    );
};

export default Footer;