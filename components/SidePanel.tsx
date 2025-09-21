import React, { useState, useEffect } from 'react';
import type { SelectableItem, LegalTerm, LegalTermDocument, Article } from '../types';
import InteractiveText from './InteractiveText';

const FormattedContentRenderer: React.FC<{
    content: string[];
    articleMap: Map<string, Article>;
    legalTermMap: Map<string, LegalTerm>;
    onCrossReferenceSelect: (item: SelectableItem) => void;
    onTermSelect: (item: SelectableItem) => void;
}> = ({ content, ...props }) => {
    const fullContent = content.join('\n');
    const regex = /(<table[\s\S]*?<\/table>|<b>[\s\S]*?<\/b>|<div[\s\S]*?<\/div>|<s>[\s\S]*?<\/s>)/g;
    const parts = fullContent.split(regex);

    return (
        <>
            {parts.map((part, index) => {
                if (!part || !part.trim()) return null;
                const key = `part-${index}`;

                if (part.startsWith('<table')) {
                    return <div key={key} className="not-prose" dangerouslySetInnerHTML={{ __html: part }} />;
                }
                if (part.startsWith('<b>')) {
                    const innerContent = part.substring(3, part.length - 4);
                    return <h6 key={key} className="font-bold text-base mt-4 mb-2"><InteractiveText text={innerContent} {...props} /></h6>;
                }
                if (part.startsWith('<div')) {
                    const contentMatch = part.match(/^<div.*?>(.*)<\/div>$/s);
                    const innerContent = contentMatch ? contentMatch[1].replace(/<br\s*\/?>/g, '\n') : '';
                    return (
                        <div key={key} className='not-prose text-sm p-4 bg-slate-50 border rounded-md my-4 font-mono whitespace-pre-line'>
                            <InteractiveText text={innerContent} {...props} />
                        </div>
                    );
                }
                if (part.startsWith('<s>')) {
                    const innerContent = part.substring(3, part.length - 4);
                    return <s key={key} className="text-slate-400"><InteractiveText text={innerContent} {...props} /></s>;
                }
                
                return part.split('\n').map((p, pIndex) => {
                    if (!p.trim()) return null;
                    return <p key={`${key}-${pIndex}`} className="text-slate-700 leading-relaxed indent-8"><InteractiveText text={p} {...props} /></p>;
                });
            })}
        </>
    );
};

const LegalTermDisplay: React.FC<{
    term: LegalTerm;
    articleMap: Map<string, Article>;
    legalTermMap: Map<string, LegalTerm>;
    onCrossReferenceSelect: (item: SelectableItem) => void;
    onTermSelect: (item: SelectableItem) => void;
}> = ({ term, articleMap, legalTermMap, onCrossReferenceSelect, onTermSelect }) => {
    const [activeDocument, setActiveDocument] = useState<LegalTermDocument | null>(term.documents[0] || null);

    useEffect(() => {
        setActiveDocument(term.documents[0] || null);
    }, [term]);

    const rendererProps = { articleMap, legalTermMap, onCrossReferenceSelect, onTermSelect };

    return (
        <div>
            <div className="border-b border-slate-200 pb-3 mb-3">
                 <h4 className="font-semibold mb-2">เอกสารที่เกี่ยวข้อง:</h4>
                <div className="flex flex-wrap gap-2">
                    {term.documents.map(doc => (
                        <button
                            key={doc.id}
                            onClick={() => setActiveDocument(doc)}
                            className={`px-3 py-1 text-sm rounded-full border transition-colors ${activeDocument?.id === doc.id ? 'bg-sky-600 text-white border-sky-600' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'}`}
                        >
                            {doc.title.split('พ.ศ.')[1] || doc.title}
                             {doc.status === 'NEW' && <span className="ml-2 text-xs font-bold opacity-80">(NEW)</span>}
                             {doc.status === 'REPEALED' && <span className="ml-2 text-xs opacity-80">(ยกเลิก)</span>}
                        </button>
                    ))}
                </div>
            </div>
            
            {activeDocument && (
                <div className="prose prose-slate max-w-none prose-sm">
                    <h5 className="font-bold">{activeDocument.title}</h5>
                    <p className="text-xs text-slate-500 italic mb-4">{activeDocument.source}</p>
                    <FormattedContentRenderer content={activeDocument.content} {...rendererProps} />
                </div>
            )}
        </div>
    );
}

interface SidePanelProps {
    selectedItem: SelectableItem | null;
    onClose: () => void;
    articleMap: Map<string, Article>;
    legalTermMap: Map<string, LegalTerm>;
    onCrossReferenceSelect: (item: SelectableItem) => void;
    onTermSelect: (item: SelectableItem) => void;
}

const SidePanel: React.FC<SidePanelProps> = ({ selectedItem, onClose, articleMap, legalTermMap, onCrossReferenceSelect, onTermSelect }) => {
    const renderContent = () => {
        if (!selectedItem) return null;

        if ('content' in selectedItem && Array.isArray(selectedItem.content)) { // Is Article
            return selectedItem.content.map((p, index) => (
                <p key={index} className="text-slate-700 leading-relaxed indent-8">
                    <InteractiveText 
                        text={p}
                        articleMap={articleMap}
                        legalTermMap={legalTermMap}
                        onCrossReferenceSelect={onCrossReferenceSelect}
                        onTermSelect={onTermSelect}
                    />
                </p>
            ));
        }

        if ('documents' in selectedItem) { // Is LegalTerm
            return <LegalTermDisplay 
                        term={selectedItem}
                        articleMap={articleMap}
                        legalTermMap={legalTermMap}
                        onCrossReferenceSelect={onCrossReferenceSelect}
                        onTermSelect={onTermSelect}
                    />;
        }

        return (
             <p className="text-slate-600">
                รายละเอียดสำหรับกฎหมายนี้ไม่ได้อยู่ในเอกสารฉบับนี้ กรุณาคลิกที่ลิงก์เพื่อเปิดเอกสารจากแหล่งข้อมูลที่เป็นทางการ
            </p>
        );
    };

    return (
        <aside className="sticky top-8">
            <div className="bg-white p-6 rounded-lg shadow-lg transition-all duration-300 min-h-[200px] max-h-[calc(100vh-7rem)] overflow-y-auto">
                {selectedItem ? (
                    <div>
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-xl font-bold text-slate-800 break-words">
                                {'term' in selectedItem ? (selectedItem.displayName || selectedItem.term) : selectedItem.title}
                            </h3>
                            <button 
                                onClick={onClose}
                                className="text-slate-400 hover:text-slate-600 ml-2 flex-shrink-0"
                                aria-label="Close"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="prose prose-slate max-w-none">
                           {renderContent()}
                        </div>
                    </div>
                ) : (
                    <div className="text-center text-slate-500 flex items-center justify-center h-full min-h-[200px]">
                        <p>คลิกที่มาตรา กฎหมายที่เกี่ยวข้อง หรือคำสำคัญเพื่อดูรายละเอียดที่นี่</p>
                    </div>
                )}
            </div>
        </aside>
    );
};

export default SidePanel;