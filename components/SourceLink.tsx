
import React from 'react';
import { GroundingChunkWeb } from '../types';

interface SourceLinkProps {
  source: GroundingChunkWeb;
  index: number;
}

const SourceLink: React.FC<SourceLinkProps> = ({ source, index }) => {
  if (!source || !source.uri) {
    return null;
  }
  return (
    <a
      href={source.uri}
      target="_blank"
      rel="noopener noreferrer"
      className="block text-sm text-cyan-400 hover:text-cyan-300 hover:underline truncate transition-colors duration-200 ease-in-out"
      title={source.title || source.uri}
    >
      {index + 1}. {source.title || source.uri}
    </a>
  );
};

export default SourceLink;
    