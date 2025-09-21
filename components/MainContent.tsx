
import React, { useState } from 'react';
import type { ActData, Article, SelectableItem, RelatedLawCategory, LegalTerm } from '../types';
import InteractiveText from './InteractiveText';

const ArticleDisplay: React.FC<{
    article: Article;
    onMainItemSelect: (article: Article) => void;
    onLinkSelect: (item: SelectableItem) => void;
    articleMap: Map<string, Article>;
    legalTermMap: Map<string, LegalTerm>;
}> = ({ article, onMainItemSelect, onLinkSelect, articleMap, legalTermMap }) => (
    <div key={article.id} id={article.title} className="mb-6 scroll-mt-8">
        <h5 className="font-semibold text-lg">
            <a 
                href={`#${encodeURIComponent(article.title)}`} 
                onClick={(e) => {e.preventDefault(); onMainItemSelect(article)}}
                className="text-sky-700 hover:text-sky-900 hover:underline"
            >
                {article.title}
            </a>
        </h5>
        {article.content.map((p, index) => (
            <p key={index} className="text-slate-700 leading-relaxed indent-8">
                <InteractiveText 
                    text={p} 
                    articleMap={articleMap} 
                    legalTermMap={legalTermMap} 
                    onLinkSelect={onLinkSelect}
                />
            </p>
        ))}
    </div>
);

const AccordionItem: React.FC<{
    category: RelatedLawCategory,
    isOpen: boolean,
    onToggle: () => void,
}> = ({ category, isOpen, onToggle }) => (
    <div className="border border-slate-200 rounded-lg mb-2">
        <h2>
            <button
                type="button"
                className="flex items-center justify-between w-full p-4 font-semibold text-left text-slate-800 bg-slate-50 hover:bg-slate-100 rounded-lg"
                onClick={onToggle}
                aria-expanded={isOpen}
            >
                <span>{category.title}</span>
                <svg className={`w-6 h-6 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </button>
        </h2>
        {isOpen && (
            <div className="p-4 bg-white">
                <ul className="space-y-2">
                    {category.laws.map(law => (
                        <li key={law.id}>
                           <a href={law.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sky-700 hover:text-sky-900 hover:underline flex items-center"
                            >
                               {law.title}
                               {law.status === 'NEW' && <span className="ml-2 text-xs font-bold text-white bg-green-500 px-2 py-0.5 rounded-full">NEW</span>}
                               {law.status === 'REPEALED' && <span className="ml-2 text-xs font-bold text-white bg-slate-400 px-2 py-0.5 rounded-full">ยกเลิก</span>}
                           </a>
                        </li>
                    ))}
                </ul>
            </div>
        )}
    </div>
);


const RelatedLaws: React.FC<{ 
    categories: RelatedLawCategory[],
}> = ({ categories }) => {
    const [openCategoryId, setOpenCategoryId] = useState<string | null>(null);

    const handleToggle = (categoryId: string) => {
        setOpenCategoryId(openCategoryId === categoryId ? null : categoryId);
    };

    return (
        <div className="mt-12 pt-8 border-t border-slate-200">
            <h4 className="font-bold text-2xl text-slate-800 pb-2 mb-4">กฎหมายที่เกี่ยวข้อง</h4>
            <div>
                {categories.map(category => (
                    <AccordionItem 
                        key={category.id}
                        category={category}
                        isOpen={openCategoryId === category.id}
                        onToggle={() => handleToggle(category.id)}
                    />
                ))}
            </div>
        </div>
    );
};

const TableOfContents: React.FC<{ act: ActData }> = ({ act }) => (
    <div className="mb-8 p-6 bg-slate-50 rounded-lg border border-slate-200">
        <h4 className="font-bold text-xl mb-4">สารบัญ</h4>
        <ul className="list-disc list-inside space-y-2 text-slate-700">
            {act.chapters.map(chapter => (
                <li key={`outline-${chapter.id}`}>
                    <a href={`#${chapter.id}`} className="text-sky-700 hover:underline">
                        {chapter.title}
                    </a>
                </li>
            ))}
            <li key={`outline-${act.transitionalProvisions.id}`}>
                 <a href={`#${act.transitionalProvisions.id}`} className="text-sky-700 hover:underline">
                    {act.transitionalProvisions.title}
                </a>
            </li>
        </ul>
    </div>
);


interface MainContentProps {
    act: ActData;
    relatedLaws: RelatedLawCategory[];
    articleMap: Map<string, Article>;
    legalTermMap: Map<string, LegalTerm>;
    onMainItemSelect: (item: SelectableItem) => void;
    onLinkSelect: (item: SelectableItem) => void;
}

const MainContent: React.FC<MainContentProps> = ({ act, relatedLaws, articleMap, legalTermMap, onMainItemSelect, onLinkSelect }) => {
    return (
        <div className="bg-white p-6 md:p-8 rounded-lg shadow-lg">
            <div className="text-center mb-8 border-b border-slate-200 pb-8">
                <h1 className="text-3xl font-bold text-slate-900">{act.title}</h1>
                <h2 className="text-2xl font-semibold text-slate-700 mt-1">{act.subtitle}</h2>
                <p className="mt-4 text-slate-500">{act.enactedDate}</p>
            </div>

            <TableOfContents act={act} />

            <div className="prose prose-slate max-w-none prose-h4:font-bold prose-h4:text-2xl prose-h4:text-slate-800 prose-h4:border-b-2 prose-h4:border-slate-200 prose-h4:pb-2 prose-h4:mb-4 prose-h5:font-semibold prose-h5:text-lg">
                <div className="mb-8">
                    {act.preamble.map((p, index) => <p key={index} className="indent-8">{p}</p>)}
                </div>

                {act.chapters.map(chapter => (
                    <section key={chapter.id} id={chapter.id} className="mb-8 scroll-mt-8">
                        <h4 style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>{chapter.title}</h4>
                        {chapter.articles.map(article => (
                           <ArticleDisplay 
                                key={article.id} 
                                article={article} 
                                onMainItemSelect={onMainItemSelect}
                                onLinkSelect={onLinkSelect}
                                articleMap={articleMap} 
                                legalTermMap={legalTermMap}
                            />
                        ))}
                    </section>
                ))}

                <section key={act.transitionalProvisions.id} id={act.transitionalProvisions.id} className="mb-8 scroll-mt-8">
                    <h4 style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>{act.transitionalProvisions.title}</h4>
                    {act.transitionalProvisions.articles.map(article => (
                         <ArticleDisplay 
                            key={article.id} 
                            article={article} 
                            onMainItemSelect={onMainItemSelect} 
                            onLinkSelect={onLinkSelect}
                            articleMap={articleMap}
                            legalTermMap={legalTermMap} 
                        />
                    ))}
                </section>
                
                <div className="mt-8 text-center">
                    {act.closing.map((p, index) => <p key={index} className="font-medium">{p}</p>)}
                </div>
            </div>
            <RelatedLaws categories={relatedLaws} />
        </div>
    );
};

export default MainContent;