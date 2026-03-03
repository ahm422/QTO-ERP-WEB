'use client';
import BlogHero from './_components/BlogHero';
import BlogPosts from './_components/BlogPosts';

export default function Blog() {
  const posts = [
    {
      title: 'How to Streamline Your HR Processes in 2026',
      category: 'HR',
      date: 'Coming Soon',
    },
    {
      title: '5 Project Management Mistakes That Kill Deadlines',
      category: 'Project Management',
      date: 'Coming Soon',
    },
    {
      title: 'The Future of Attendance Tracking',
      category: 'Attendance',
      date: 'Coming Soon',
    },
    {
      title: 'Why Growing Teams Need an ERP',
      category: 'Business',
      date: 'Coming Soon',
    },
  ];

  return (
    <>
      <BlogHero />
      <BlogPosts posts={posts} />
    </>
  );
}
