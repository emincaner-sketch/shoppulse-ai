import { NextRequest, NextResponse } from 'next/server';
import { MOCK_COMMUNITY_POSTS } from '@/lib/data/mockStores';
import { CommunityPost } from '@/types';

let communityPosts: CommunityPost[] = [...MOCK_COMMUNITY_POSTS];

export async function GET() {
  return NextResponse.json({
    success: true,
    posts: communityPosts,
    totalCount: communityPosts.length,
  });
}

export async function POST(request: NextRequest) {
  try {
    const { title, content, category, authorName, authorBadge, tags } = await request.json();

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    const newPost: CommunityPost = {
      id: `post-${Date.now()}`,
      authorName: authorName || 'Doğrulanmış Satıcı',
      authorStoreCategory: category || 'E-Ticaret Markası',
      authorBadge: authorBadge || 'Doğrulanmış Satıcı',
      verifiedRevenue: '$50K+ / Ay',
      title,
      content,
      likes: 1,
      commentsCount: 0,
      timeAgo: 'Az önce',
      tags: Array.isArray(tags) && tags.length > 0 ? tags : ['Büyüme', 'Taktik'],
    };

    communityPosts = [newPost, ...communityPosts];

    return NextResponse.json({
      success: true,
      post: newPost,
      message: 'Topluluk gönderiniz başarıyla yayınlandı.',
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create post' }, { status: 500 });
  }
}
