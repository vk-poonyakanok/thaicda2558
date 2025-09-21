export interface Article {
  id: string;
  title: string;
  content: string[];
}

export interface Chapter {
  id: string;
  title: string;
  articles: Article[];
}

export interface ActData {
  title: string;
  subtitle: string;
  enactedDate: string;
  preamble: string[];
  chapters: Chapter[];
  transitionalProvisions: Chapter;
  closing: string[];
}

export interface RelatedLaw {
  id: string;
  title: string;
  status?: 'NEW' | 'REPEALED';
  url: string;
}

export interface RelatedLawCategory {
  id: string;
  title: string;
  laws: RelatedLaw[];
}

export interface LegalTermDocument {
  id: string;
  title: string;
  status?: 'NEW' | 'REPEALED';
  source: string;
  content: string[];
}

export interface LegalTerm {
  id: string;
  term: string;
  displayName?: string;
  documents: LegalTermDocument[];
}


export type SelectableItem = Article | LegalTerm;