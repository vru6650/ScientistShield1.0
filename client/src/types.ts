export interface Post {
    _id: string;
    title: string;
    content: string;
    category: string;
    slug: string;
    createdAt: string;
    image?: string; // Optional property
    mediaUrl?: string; // Optional property
    mediaType?: 'image' | 'video'; // Optional and specific property
}