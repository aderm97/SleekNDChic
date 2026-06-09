import { useParams } from 'react-router-dom';
import { PageLoader } from '@/shared/components/ui';
import { usePage } from '@/features/content/hooks/useContent';

export function Page() {
  const { slug } = useParams<{ slug: string }>();
  const { data: page, isLoading } = usePage(slug || '');

  if (isLoading) {
    return <PageLoader />;
  }

  if (!page?.data) {
    return (
      <div className="container-custom section-padding text-center">
        <h1 className="text-2xl font-medium text-gray-900 mb-4">Page Not Found</h1>
        <p className="text-gray-600">
          The page you're looking for doesn't exist.
        </p>
      </div>
    );
  }

  return (
    <div className="section-padding">
      <div className="container-custom max-w-4xl">
        <h1 className="font-serif text-3xl md:text-4xl font-semibold text-gray-900 mb-8 text-center">
          {page.data.title}
        </h1>
        
        <article
          className="prose prose-lg max-w-none prose-headings:font-serif prose-a:text-primary hover:prose-a:text-primary-dark"
          dangerouslySetInnerHTML={{ __html: page.data.contentHtml }}
        />
      </div>
    </div>
  );
}
