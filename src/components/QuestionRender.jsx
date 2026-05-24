import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

export default function QuestionRenderer({ text }) {
  if (!text) return null;

  return (
    <div className="prose dark:prose-invert text-xs md:text-sm max-w-full custom-math-renderer">
      <ReactMarkdown 
        remarkPlugins={[remarkMath]} 
        rehypePlugins={[rehypeKatex]}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}