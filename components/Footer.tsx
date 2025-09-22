
import React from 'react';

const toThaiDigits = (n: number | string): string => {
    const arabic = '0123456789';
    const thai = '๐๑๒๓๔๕๖๗๘๙';
    return String(n).replace(/[0-9]/g, (d) => thai[arabic.indexOf(d)]);
};

const Footer: React.FC = () => {
    return (
        <footer className="bg-slate-800 text-white mt-auto">
            <div className="container mx-auto px-4 py-8 text-sm text-slate-300">
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="md:col-span-1 text-center md:text-left">
                        <h4 className="font-semibold text-base text-white mb-2">เกี่ยวกับเว็บไซต์</h4>
                        <p>
                            เว็บไซต์นี้จัดทำขึ้นเพื่ออำนวยความสะดวกในการศึกษาและใช้งาน พ.ร.บ. โรคติดต่อ อย่างไม่เป็นทางการ 
                            กรุณาอ้างอิงจาก
                            <a href="https://ddc.moph.go.th/law.php?law=1" target="_blank" rel="noopener noreferrer" className="underline hover:text-white ml-1">
                                แหล่งข้อมูลที่เป็นทางการ
                            </a>
                        </p>
                    </div>
                    <div className="md:col-span-1 text-center">
                        <h4 className="font-semibold text-base text-white mb-2">ผู้จัดทำ</h4>
                        <p>นพ.วิชชากร ปุณยกนก</p>
                        <a href="https://github.com/vk-poonyakanok/thaicda2558" target="_blank" rel="noopener noreferrer" className="underline hover:text-white block mt-1">
                            GitHub Repository
                        </a>
                    </div>
                    <div className="md:col-span-1 text-center md:text-right">
                        <h4 className="font-semibold text-base text-white mb-2">ร่วมพัฒนา</h4>
                        <p>พบคำผิด เนื้อหาไม่ถูกต้อง หรือมีข้อเสนอแนะ? <br/>กรุณาเปิด Issue หรือส่ง Pull Request</p>
                    </div>
                </div>
                <div className="border-t border-slate-700 mt-8 pt-6 text-xs text-slate-400 text-center">
                    <p>&copy; {toThaiDigits(new Date().getFullYear())} - พระราชบัญญัติโรคติดต่อ พ.ศ. ๒๕๕๘ (ไม่เป็นทางการ)</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
