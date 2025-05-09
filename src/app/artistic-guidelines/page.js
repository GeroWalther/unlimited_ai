import fs from 'fs';
import path from 'path';
import { MDXRemote } from 'next-mdx-remote/rsc';
import Link from 'next/link';

export const metadata = {
  title: 'Artistic Nude Content Guidelines',
  description:
    'Guidelines for creating artistic nude imagery on our AI platform',
};

export default async function ArtisticGuidelinesPage() {
  // Read the MDX file content
  const mdxFilePath = path.join(
    process.cwd(),
    'src/app/artistic-guidelines.mdx'
  );
  const mdxContent = fs.readFileSync(mdxFilePath, 'utf8');

  return (
    <div className='container mx-auto px-4 py-12 max-w-4xl'>
      <Link
        href='/'
        className='text-pink-400 hover:text-pink-300 mb-6 inline-flex items-center'>
        ← Back to Image Generation
      </Link>

      <div className='prose prose-invert prose-pink max-w-none'>
        <MDXRemote source={mdxContent} />
      </div>
    </div>
  );
}
