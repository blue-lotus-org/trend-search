
import React, { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import showdown from 'showdown';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import htmlToPdfmake from 'html-to-pdfmake';
import { SearchResult } from '../types';
import SourceLink from './SourceLink';

// Configure pdfmake with fonts
if (pdfMake && (pdfFonts as any)?.pdfMake?.vfs) {
  pdfMake.vfs = (pdfFonts as any).pdfMake.vfs;
} else {
  if (typeof window !== 'undefined' && (window as any).pdfMake && (window as any).pdfMake.vfs) {
     pdfMake.vfs = (window as any).pdfMake.vfs;
  } else {
    console.warn("pdfMake VFS fonts not loaded correctly. PDF generation might use default fonts or fail.");
  }
}

pdfMake.fonts = {
  Roboto: {
    normal: 'Roboto-Regular.ttf',
    bold: 'Roboto-Medium.ttf',
    italics: 'Roboto-Italic.ttf',
    bolditalics: 'Roboto-MediumItalic.ttf'
  }
};


interface ResultsDisplayProps {
  results: SearchResult | null;
}

const mdConverter = new showdown.Converter();

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const sourcesRef = useRef<HTMLDivElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);

  const [copyButtonText, setCopyButtonText] = useState('Copy Markdown');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  useEffect(() => {
    if (results && containerRef.current) {
      gsap.fromTo(containerRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" });
      if (contentRef.current) {
         gsap.fromTo(contentRef.current, { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.5, delay: 0.2, ease: "power2.out" });
      }
      if (sourcesRef.current) {
         gsap.fromTo(sourcesRef.current, { opacity: 0, x: 20 }, { opacity: 1, x: 0, duration: 0.5, delay: 0.3, ease: "power2.out" });
      }
      if (buttonsRef.current) {
        gsap.fromTo(buttonsRef.current, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.4, delay: 0.4, ease: "power2.out" });
      }
    }
    setCopyButtonText('Copy Markdown');
    setIsGeneratingPdf(false);
  }, [results]);

  if (!results) {
    return <div className="text-center p-8 text-slate-400">Enter a query to see internet trends.</div>;
  }

  if (!results.text && (!results.sources || results.sources.length === 0)) {
    return <div className="text-center p-8 text-slate-400">No results found. Try a different query.</div>;
  }

  const handleCopyMarkdown = async () => {
    if (!results || !results.text) return;
    try {
      await navigator.clipboard.writeText(results.text);
      setCopyButtonText('Copied!');
      setTimeout(() => setCopyButtonText('Copy Markdown'), 2000);
    } catch (err) {
      console.error('Failed to copy markdown: ', err);
      setCopyButtonText('Copy Failed');
      setTimeout(() => setCopyButtonText('Copy Markdown'), 2000);
    }
  };

  const handleDownloadPdf = async () => {
    if (!results) return;
    setIsGeneratingPdf(true);

    try {
      const htmlContentForPdf = results.text ? mdConverter.makeHtml(results.text) : "<p>No textual summary provided.</p>";
      const wrappedHtml = `<div>${htmlContentForPdf}</div>`;
      
      // Standard PDF styles: dark text on light background
      const generatedPdfContentFromHtml = htmlToPdfmake(wrappedHtml, {
         defaultStyles: { 
            p: { margin: [0, 5, 0, 10], color: '#333333' }, // Dark gray for paragraphs
            a: { color: '#0000EE', decoration: 'underline' }, // Standard blue for links
            strong: { bold: true, color: '#000000' }, // Black for strong
            em: { italics: true },
            ul: { margin: [10, 5, 0, 10], color: '#333333' },
            ol: { margin: [10, 5, 0, 10], color: '#333333' },
            li: { margin: [0, 0, 0, 3] },
            h1: { fontSize: 20, bold: true, margin: [0, 5, 0, 10], color: '#000000' },
            h2: { fontSize: 18, bold: true, margin: [0, 5, 0, 10], color: '#000000' },
            h3: { fontSize: 16, bold: true, margin: [0, 5, 0, 10], color: '#000000' },
            h4: { fontSize: 14, bold: true, margin: [0, 5, 0, 10], color: '#000000' },
         }
      });
      
      const contentItemsForPdf = Array.isArray(generatedPdfContentFromHtml) ? generatedPdfContentFromHtml : [generatedPdfContentFromHtml];

      const documentDefinition: any = {
        content: [
          { text: 'AI Insights', style: 'mainHeaderStyle', margin: [0, 0, 0, 15] },
          ...contentItemsForPdf,
        ],
        styles: {
          mainHeaderStyle: { fontSize: 22, bold: true, color: '#000000' }, // Black
          sourcesHeaderStyle: { fontSize: 18, bold: true, color: '#222222', margin: [0, 15, 0, 10] }, // Darker Gray
          sourceItemStyle: { margin: [0, 0, 0, 5] },
          sourceTitleStyle: { bold: true, color: '#111111'}, // Very Dark Gray
          sourceLinkStyle: { color: '#0000EE', decoration: 'underline' }, // Standard blue link
        },
        defaultStyle: {
          font: 'Roboto',
          fontSize: 11,
          lineHeight: 1.4,
          color: '#333333', // Default text color: dark gray
        },
        pageMargins: [40, 50, 40, 50],
        footer: function(currentPage: number, pageCount: number) {
            return {
                text: currentPage.toString() + ' of ' + pageCount,
                alignment: 'center',
                fontSize: 9,
                color: '#666666', // Medium gray for footer
                margin: [0, 20, 0, 0] 
            };
        }
      };

      if (results.sources && results.sources.length > 0) {
        documentDefinition.content.push({ text: 'Sources', style: 'sourcesHeaderStyle' });
        const sourcesListContent = results.sources
          .filter(source => source.web && source.web.uri)
          .map(source => {
            return {
              text: [
                { text: `${source.web.title || 'Untitled Source'}: `, style: 'sourceTitleStyle' },
                { text: source.web.uri, link: source.web.uri, style: 'sourceLinkStyle' }
              ],
              style: 'sourceItemStyle'
            };
          });
        documentDefinition.content.push({ ul: sourcesListContent });
      }
      
      const pdfFileName = `trend-analysis-${results.text.substring(0,30).replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'report'}.pdf`;
      pdfMake.createPdf(documentDefinition).download(pdfFileName);

    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setIsGeneratingPdf(false);
    }
  };
  
  const htmlContent = results.text ? mdConverter.makeHtml(results.text) : "No textual summary provided.";

  return (
    <div ref={containerRef} className="mt-8 p-6 bg-slate-800/70 rounded-xl shadow-2xl backdrop-blur-md">
      <div ref={contentRef}>
        <h2 className="text-2xl font-semibold text-pink-400 mb-4">AI Insights</h2>
        <div 
          className="prose prose-invert prose-sm sm:prose-base max-w-none text-slate-200 whitespace-pre-wrap leading-relaxed"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      </div>

      {results.sources && results.sources.length > 0 && (
        <div ref={sourcesRef} className="mt-6 pt-4 border-t border-slate-700">
          <h3 className="text-lg font-semibold text-teal-400 mb-3">Sources:</h3>
          <div className="space-y-2">
            {results.sources.map((source, index) => (
              source.web ? <SourceLink key={index} source={source.web} index={index} /> : null
            ))}
          </div>
        </div>
      )}

      {(results.text || (results.sources && results.sources.length > 0)) && (
        <div ref={buttonsRef} className="mt-8 pt-4 border-t border-slate-700 flex flex-col sm:flex-row sm:space-x-3 space-y-3 sm:space-y-0">
          <button
            onClick={handleCopyMarkdown}
            className="w-full sm:w-auto px-4 py-2 text-sm font-medium rounded-md bg-cyan-600 hover:bg-cyan-500 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all duration-200 ease-in-out transform hover:scale-105 active:scale-95"
            disabled={!results.text}
            aria-label="Copy AI insights as Markdown"
          >
            {copyButtonText}
          </button>
          <button
            onClick={handleDownloadPdf}
            className="w-full sm:w-auto px-4 py-2 text-sm font-medium rounded-md bg-purple-600 hover:bg-purple-500 text-white focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all duration-200 ease-in-out transform hover:scale-105 active:scale-95"
            disabled={isGeneratingPdf || (!results.text && (!results.sources || results.sources.length === 0))}
            aria-label="Download results as PDF"
          >
            {isGeneratingPdf ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating PDF...
              </>
            ) : 'Download PDF'}
          </button>
        </div>
      )}
    </div>
  );
};

export default ResultsDisplay;
