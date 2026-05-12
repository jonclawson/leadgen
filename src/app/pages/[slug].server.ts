import { PageServerLoad } from '@analogjs/router';

export const load = async ({ params, fetch }: PageServerLoad) => {
  console.log('Loading article with slug:', params?.slug);
  const slug = params?.slug;
  
  try {
    const response = await fetch(`/api/articles/slug/${slug}`) as any;
    console.log('API response received:', response?.article);
    if (!response?.article) {
      throw new Error('Article not found');
    }
    console.log('Article data loaded successfully');
    const data = response;
    return data;
  } catch (error) {
    console.error('Error loading article:', error);
    return { article: null, error: true };
  }
};
