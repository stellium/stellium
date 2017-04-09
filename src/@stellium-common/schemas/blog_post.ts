import {HasUser, SEOFields, SoftDelete} from './_common'


export interface BlogPostContent {
    order: number;
    type: 'text' | 'embed' | 'image' | 'break';
    content: any;
}


export interface BlogPostSchema extends HasUser, SEOFields, SoftDelete {
    _id?: string;
    id?: string;
    cover?: {
        source: string;
        url: string;
        alt: string;
    };
    tags?: string[];
    // Mixed type
    content?: BlogPostContent[];
    status?: boolean;
    language?: string;
    metrics?: {
        likes: {
            facebook: string;
            medium: string;
            google: string;
        }
        views: number;
    }
}
