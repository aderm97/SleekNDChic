import { Link } from 'react-router-dom';
import { Calendar, ArrowRight } from 'lucide-react';
import { formatDate, truncateText } from '@/shared/lib/utils';
import { PageLoader } from '@/shared/components/ui';
import { useBlogPosts } from '@/features/content/hooks/useContent';

export function Blog() {
  const { data: posts, isLoading } = useBlogPosts();

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <div className="section-padding">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-serif text-3xl md:text-4xl font-semibold text-gray-900 mb-4">
            Our Blog
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover the latest trends, styling tips, and behind-the-scenes stories from SleekNDChic.
          </p>
        </div>

        {/* Blog Grid */}
        {posts?.data.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500">No blog posts yet. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts?.data.map((post) => (
              <article
                key={post.id}
                className="group flex flex-col bg-white rounded-lg overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow"
              >
                {/* Featured Image */}
                <Link to={`/blog/${post.slug}`} className="block aspect-[16/10] overflow-hidden">
                  {post.featuredImageUrl ? (
                    <img
                      src={post.featuredImageUrl}
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <span className="text-gray-400">No image</span>
                    </div>
                  )}
                </Link>

                {/* Content */}
                <div className="flex-1 p-6 flex flex-col">
                  <div className="flex items-center text-sm text-gray-500 mb-3">
                    <Calendar className="h-4 w-4 mr-2" />
                    {post.publishedAt ? formatDate(post.publishedAt) : 'Draft'}
                  </div>

                  <h2 className="font-serif text-xl font-semibold text-gray-900 mb-3 group-hover:text-primary transition-colors">
                    <Link to={`/blog/${post.slug}`}>
                      {post.title}
                    </Link>
                  </h2>

                  <p className="text-gray-600 mb-4 flex-1">
                    {post.excerpt || truncateText(post.contentHtml.replace(/<[^>]*>/g, ''), 150)}
                  </p>

                  <Link
                    to={`/blog/${post.slug}`}
                    className="inline-flex items-center text-primary font-medium hover:text-primary-dark transition-colors"
                  >
                    Read More
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
