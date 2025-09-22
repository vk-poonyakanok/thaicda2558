
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { HashRouter, useLocation } from 'react-router-dom';
import type { Article, SelectableItem, LegalTerm } from './types';
import { actData } from './data/actData';
import { relatedLawData } from './data/relatedLaws';
import { legalTermsData } from './data/legalTermsData';
import MainContent from './components/MainContent';
import SidePanel from './components/SidePanel';
import Footer from './components/Footer';
import { normalizeText } from './utils/textNormalization';

const DisclaimerBanner: React.FC = () => (
    <div className="bg-amber-100 border-b-2 border-amber-200 text-amber-800 text-center p-3 text-sm">
        website นี้จัดทำขึ้นเพื่ออำนวยความสะดวกในการศึกษาและใช้งาน พ.ร.บ. โรคติดต่อ อย่างไม่เป็นทางการ
        <a href="https://ddc.moph.go.th/law.php?law=1" target="_blank" rel="noopener noreferrer" className="font-semibold underline hover:text-amber-900 ml-2">
            กรุณาอ้างอิงจากแหล่งข้อมูลที่เป็นทางการที่นี่
        </a>
    </div>
);


const AppContent: React.FC = () => {
    const location = useLocation();
    const [selectedItem, setSelectedItem] = useState<SelectableItem | null>(null);
    const scrollOnNextHashChange = useRef(true);

    const articleMap = useMemo(() => {
        const map = new Map<string, Article>();
        actData.chapters.forEach(chapter => chapter.articles.forEach(article => map.set(normalizeText(article.title), article)));
        actData.transitionalProvisions.articles.forEach(article => map.set(normalizeText(article.title), article));
        return map;
    }, []);

    const legalTermMap = useMemo(() => {
        const map = new Map<string, LegalTerm>();
        legalTermsData.forEach(term => map.set(term.term, term));
        return map;
    }, []);

    // Effect to handle scrolling based on hash and a flag
    useEffect(() => {
        const hash = decodeURIComponent(location.hash.replace('#', ''));
        if (hash && scrollOnNextHashChange.current) {
            const element = document.getElementById(hash);
            if (element) {
                // Add a small delay to ensure the element is rendered before scrolling
                setTimeout(() => element.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
            }
        }
        // Always reset the flag to true for the next navigation, unless a cross-reference click sets it to false
        scrollOnNextHashChange.current = true;
    }, [location]);


    const handleMainItemSelect = (item: SelectableItem) => {
        setSelectedItem(item);
        scrollOnNextHashChange.current = true;
        const hash = 'title' in item ? item.title : item.term;
        // Use history.pushState to prevent double-triggering useEffect
        history.pushState(null, '', `#${encodeURIComponent(hash)}`);
        // Manually trigger scroll
        const element = document.getElementById(hash);
        if (element) {
            setTimeout(() => element.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
        }
    };
    
    const handleLinkSelect = (item: SelectableItem) => {
        setSelectedItem(item);
        scrollOnNextHashChange.current = false; // Don't scroll main view
        const hash = 'title' in item ? item.title : item.term;
        history.pushState(null, '', `#${encodeURIComponent(hash)}`);
    }

    const handleArticleLinkSelectInPanel = (article: Article) => {
        setSelectedItem(article);
        // Do not change scroll flag or URL hash, just update the panel content
    }

    const handleCloseSidePanel = () => {
        setSelectedItem(null);
    };
    
    return (
        <div className="flex flex-col min-h-screen">
            <DisclaimerBanner />
            <main className="flex-grow container mx-auto px-4 py-8">
                 <div className="lg:grid lg:grid-cols-3 lg:gap-8">
                    <div className="lg:col-span-2">
                        <MainContent 
                            act={actData} 
                            relatedLaws={relatedLawData} 
                            articleMap={articleMap}
                            legalTermMap={legalTermMap}
                            onMainItemSelect={handleMainItemSelect}
                            onLinkSelect={handleLinkSelect}
                        />
                    </div>
                    <div>
                        <SidePanel 
                            selectedItem={selectedItem}
                            onClose={handleCloseSidePanel}
                            articleMap={articleMap}
                            legalTermMap={legalTermMap}
                            onLinkSelect={handleLinkSelect}
                            onArticleLinkSelectInPanel={handleArticleLinkSelectInPanel}
                        />
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

const App: React.FC = () => (
    <HashRouter>
        <AppContent />
    </HashRouter>
);

export default App;