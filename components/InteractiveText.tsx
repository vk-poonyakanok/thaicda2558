
import React, { useMemo, useRef, useEffect } from 'react';
import type { SelectableItem, LegalTerm, Article } from '../types';
import { normalizeText } from '../utils/textNormalization';

declare const tippy: any;

const sanitizeHTML = (str: string): string => {
    if (!str) return '';
    return str.replace(/[&<>"']/g, (match) => {
        switch (match) {
            case '&': return '&amp;';
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '"': return '&quot;';
            case "'": return '&#39;';
            default: return match;
        }
    });
};

const TippyWrapper: React.FC<{ content: string; children: React.ReactElement }> = ({ content, children }) => {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (ref.current) {
      const instance = tippy(ref.current, {
        content: content,
        arrow: true,
        theme: 'light-border',
        placement: 'top',
        allowHTML: true,
        maxWidth: 350,
      });
      return () => instance.destroy();
    }
  }, [content]);

  return <span ref={ref}>{children}</span>;
};

const timeLimitPhrases = [
    'ภายในสามชั่วโมง', 'ภายในหนึ่งชั่วโมง', 'ภายในยี่สิบสี่ชั่วโมง', 'ภายในเจ็ดวัน',
    'ภายในสามสิบวัน', 'หนึ่งร้อยแปดสิบวัน', 'เก้าสิบวัน', 'สิบวัน', 'หนึ่งเดือน', 'หกเดือน',
    'หนึ่งปี', 'สองปี', 'สามปี', 'ภายในสิบสองชั่วโมง', 'ภายในสี่สิบแปดชั่วโมง', 'ภายในสิบห้าวัน'
];

interface InteractiveTextProps {
    text: string;
    articleMap: Map<string, Article>;
    legalTermMap: Map<string, LegalTerm>;
    onCrossReferenceSelect: (item: SelectableItem) => void;
    onTermSelect: (item: SelectableItem) => void;
}

const InteractiveText: React.FC<InteractiveTextProps> = ({ text, articleMap, legalTermMap, onCrossReferenceSelect, onTermSelect }) => {
    const regex = useMemo(() => {
        const terms = Array.from(legalTermMap.keys()).sort((a, b) => b.length - a.length).join('|');
        const articles = 'มาตรา\\s*[\\d๑๒๓๔๕๖๗๘๙๐]+';
        const timeLimits = timeLimitPhrases.join('|');
        return new RegExp(`(${terms}|${articles}|${timeLimits})`, 'g');
    }, [legalTermMap]);

    const parts = useMemo(() => {
        return text.split(regex).map((part, index) => {
            if (!part) return null;
            const trimmedPart = part.trim();

            if (timeLimitPhrases.includes(trimmedPart)) {
                return <strong key={index} className="font-bold text-red-700">{part}</strong>;
            }
            
            const term = legalTermMap.get(trimmedPart);
            if (term) {
                const termTitle = sanitizeHTML(term.displayName || term.term);
                const docList = term.documents.map(d => `<li>${sanitizeHTML(d.title)}</li>`).join('');
                const tooltipContent = `<b>${termTitle}</b><ul class="list-disc list-inside text-left text-xs">${docList}</ul>`;
                return (
                    <TippyWrapper key={index} content={tooltipContent}>
                        <a
                            href={`#${encodeURIComponent(term.term)}`}
                            onClick={(e) => { e.preventDefault(); onTermSelect(term); }}
                            className="font-semibold text-blue-700 hover:text-blue-900 hover:underline cursor-pointer"
                        >
                            {part}
                        </a>
                    </TippyWrapper>
                );
            }
            
            const normalizedPart = normalizeText(trimmedPart);
            const article = articleMap.get(normalizedPart);
            if (article) {
                const tooltipContent = sanitizeHTML(article.content[0] || 'ไม่มีข้อมูล');
                return (
                    <TippyWrapper key={index} content={tooltipContent}>
                        <a
                            href={`#${encodeURIComponent(article.title)}`}
                            onClick={(e) => { e.preventDefault(); onCrossReferenceSelect(article); }}
                            className="font-semibold text-sky-700 hover:text-sky-900 hover:underline cursor-pointer"
                        >
                            {part}
                        </a>
                    </TippyWrapper>
                );
            }
            
            return <React.Fragment key={index}>{part}</React.Fragment>;
        });
    }, [text, regex, articleMap, legalTermMap, onCrossReferenceSelect, onTermSelect]);

    return <>{parts}</>;
};

export default InteractiveText;
