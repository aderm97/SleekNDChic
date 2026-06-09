import { useParams, Link, Navigate } from 'react-router-dom';
import { ArrowLeft, Calendar } from 'lucide-react';
import { formatDate } from '@/shared/lib/utils';
import { PageLoader } from '@/shared/components/ui';
import { useBlogPost } from '@/features/content/hooks/useContent';

export function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const { data: post, isLoading } = useBlogPost(slug || '');

  if (isLoading) {
    return <PageLoader />;
  }

  if (!post?.data) {
    return <Navigate to="/blog" replace />;
  }

  const { data } = post;

  return (
    <div className="section-padding">
      <div className="container-custom max-w-4xl">
        {/* Back Link */}
        <Link
          to="/blog"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-8"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Blog
        </Link>

        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center text-sm text-gray-500 mb-4">
            <Calendar className="h-4 w-4 mr-2" />
            {data.publishedAt ? formatDate(data.publishedAt) : 'Draft'}
          </div>
          <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-semibold text-gray-900 mb-6">
            {data.title}
          </h1>
        </header>

        {/* Featured Image */}
        {data.featuredImageUrl && (
          <div className="aspect-[21/9] rounded-lg overflow-hidden mb-8">
            <img
              src={data.featuredImageUrl}
              alt={data.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Content */}
        <article
          className="prose prose-lg max-w-none prose-headings:font-serif prose-a:text-primary hover:prose-a:text-primary-dark"
          dangerouslySetInnerHTML={{ __html: data.contentHtml }}
        />

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <Link
            to="/blog"
            className="inline-flex items-center text-primary font-medium hover:text-primary-dark"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to all posts
          </Link>
        </div>
      </div>
    </div>
  );
}
