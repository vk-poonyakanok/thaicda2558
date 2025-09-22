
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

export const generateArticleTooltip = (article: Article): string => {
    const title = `<b>${sanitizeHTML(article.title)}</b>`;
    const previewContent = article.content[0] 
        ? `<p class="text-xs text-slate-300 mt-1">${sanitizeHTML(article.content[0].substring(0, 150))}${article.content[0].length > 150 ? '...' : ''}</p>` 
        : '';
    const footer = `<div class="text-xs text-slate-400 italic mt-2">คลิกเพื่อดูรายละเอียดทั้งหมด</div>`;
    return `<div class="prose prose-sm max-w-none p-1">${title}${previewContent}${footer}</div>`;
}

export const generateLegalTermTooltip = (term: LegalTerm): string => {
    const title = `<b>${sanitizeHTML(term.displayName || term.term)}</b>`;
    const documentsList = term.documents.length > 0
        ? `<div class="text-xs text-slate-300 mt-1">เอกสารที่เกี่ยวข้อง:</div><ul class="list-disc list-inside text-xs pl-1 mt-1 text-slate-300">${term.documents.map(doc => `<li>${sanitizeHTML(doc.title)}</li>`).join('')}</ul>`
        : '';
    const footer = `<div class="text-xs text-slate-400 italic mt-2">คลิกเพื่อดูรายละเอียดทั้งหมด</div>`;

    return `<div class="prose prose-slate max-w-none prose-sm p-1">${title}${documentsList}${footer}</div>`;
}


export const TippyWrapper: React.FC<{ content: string; children: React.ReactElement }> = ({ content, children }) => {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (ref.current) {
      const instance = tippy(ref.current, {
        content: content,
        arrow: true,
        theme: 'light-border',
        placement: 'top',
        allowHTML: true,
        interactive: false,
        maxWidth: 350,
        appendTo: () => document.body,
      });
      return () => instance.destroy();
    }
  }, [content]);

  // Fix: The original `React.cloneElement` call has a TypeScript error because it cannot
  // guarantee that the child element accepts a `ref`. Wrapping the child in a `<span>`
  // and attaching the ref to it is a safer and more robust pattern for tooltips.
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
    onLinkSelect: (item: SelectableItem) => void;
    onArticleLinkSelectOverride?: (article: Article) => void;
}

const InteractiveText: React.FC<InteractiveTextProps> = ({ text, articleMap, legalTermMap, onLinkSelect, onArticleLinkSelectOverride }) => {
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
                const tooltipContent = generateLegalTermTooltip(term);
                return (
                    <TippyWrapper key={index} content={tooltipContent}>
                        <a
                            href={`#${encodeURIComponent(term.term)}`}
                            onClick={(e) => { e.preventDefault(); onLinkSelect(term); }}
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
                const clickHandler = onArticleLinkSelectOverride ? () => onArticleLinkSelectOverride(article) : () => onLinkSelect(article);
                const tooltipContent = generateArticleTooltip(article);
                return (
                    <TippyWrapper key={index} content={tooltipContent}>
                        <a
                            href={`#${encodeURIComponent(article.title)}`}
                            onClick={(e) => { e.preventDefault(); clickHandler(); }}
                            className="font-semibold text-blue-700 hover:text-blue-900 hover:underline cursor-pointer"
                        >
                            {part}
                        </a>
                    </TippyWrapper>
                );
            }
            
            return <React.Fragment key={index}>{part}</React.Fragment>;
        });
    }, [text, regex, articleMap, legalTermMap, onLinkSelect, onArticleLinkSelectOverride]);

    return <>{parts}</>;
};

export default InteractiveText;