
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
    const [selectedItem, setSelectedItem] = useState<SelectableItem | null>(null);
    const location = useLocation();
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

    // Effect to handle selection based on hash
    useEffect(() => {
        const hash = decodeURIComponent(location.hash.replace('#', ''));
        if (!hash) {
            setSelectedItem(null);
            return;
        }

        const normalizedHash = normalizeText(hash);
        const foundArticle = articleMap.get(normalizedHash);
        if (foundArticle) {
            setSelectedItem(foundArticle);
            return;
        }

        const foundTerm = legalTermMap.get(hash);
        if (foundTerm) {
            setSelectedItem(foundTerm);
            return;
        }

        // If it's a chapter hash or something else, there should be no selected item
        setSelectedItem(null);
    }, [location, articleMap, legalTermMap]);

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
        scrollOnNextHashChange.current = true;
        setSelectedItem(item);
        window.location.hash = encodeURIComponent('title' in item ? item.title : item.term);
    };
    
    const handleLinkSelect = (item: SelectableItem) => {
        scrollOnNextHashChange.current = false; // Don't scroll main view
        setSelectedItem(item);
        window.location.hash = encodeURIComponent('title' in item ? item.title : item.term);
    }
    
    const handleArticleLinkInSidePanel = (article: Article) => {
        scrollOnNextHashChange.current = true; // Scroll main view
        // DO NOT setSelectedItem, so the side panel stays open
        window.location.hash = encodeURIComponent(article.title);
    };

    const clearSelection = () => {
        setSelectedItem(null);
        if (window.location.hash) {
            history.pushState("", document.title, window.location.pathname + window.location.search);
        }
    }

    return (
        <div className="flex flex-col min-h-screen">
            <DisclaimerBanner />
            <main className="flex-grow container mx-auto px-4 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    <div className="w-full lg:w-[65%] xl:w-2/3">
                        <MainContent 
                            act={actData} 
                            relatedLaws={relatedLawData} 
                            articleMap={articleMap}
                            legalTermMap={legalTermMap}
                            onMainItemSelect={handleMainItemSelect}
                            onLinkSelect={handleLinkSelect}
                        />
                    </div>
                    <div className="w-full lg:w-[35%] xl:w-1/3">
                        <SidePanel 
                            selectedItem={selectedItem} 
                            onClose={clearSelection}
                            articleMap={articleMap}
                            legalTermMap={legalTermMap}
                            onLinkSelect={handleLinkSelect}
                            onArticleLinkSelectInPanel={handleArticleLinkInSidePanel}
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