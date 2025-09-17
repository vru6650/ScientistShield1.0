export interface Post {
    _id: string;
    title: string;
    content: string;
    category: string;
    slug: string;
    createdAt: string;
    image?: string;
    mediaUrl?: string;
    mediaType?: 'image' | 'video';
    claps?: number;
    clappedBy?: string[];
    bookmarkedBy?: string[];
    author?: {
        name?: string;
        profilePicture?: string;
    };
}

export interface TutorialChapter {
    _id: string;
    chapterTitle: string;
    chapterSlug: string;
    content: string;
    order: number;
    createdAt: string;
    updatedAt: string;
}

export interface Tutorial {
    _id: string;
    title: string;
    slug: string;
    description: string;
    thumbnail?: string;
    category: string;
    authorId: string;
    chapters: TutorialChapter[]; // Array of embedded chapters
    createdAt: string;
    updatedAt: string;
}