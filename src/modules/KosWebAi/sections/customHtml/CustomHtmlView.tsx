import React, { Component, ReactNode } from 'react';
import { BaseSectionConfig } from '../../types/pageBuilder.types';
import { TriangleAlert } from 'lucide-react';
import { clsx } from 'clsx';

interface CustomHtmlViewProps {
  config: BaseSectionConfig & { rawHtmlTemplate?: string };
}

class SectionErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; errorMsg: string }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, errorMsg: '' };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, errorMsg: error.message };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 flex flex-col items-center justify-center text-center bg-red-950/20 border border-red-900/30 rounded-2xl m-4">
          <TriangleAlert className="w-10 h-10 text-red-500 mb-3" />
          <h3 className="text-red-400 font-bold mb-1">שגיאת רינדור בקוד מותאם אישית</h3>
          <p className="text-red-300/70 text-sm max-w-md">
            הקוד שה-AI או אתה יצרתם מכיל שגיאת מבנה חמורה שמונעת מהאזור להיות מוצג. אנא פתח את חלון עריכת הקוד ותקן את הבעיה.
          </p>
          <code className="mt-4 text-xs text-red-400 bg-red-950/50 p-2 rounded-lg" dir="ltr">
            {this.state.errorMsg}
          </code>
        </div>
      );
    }
    return this.props.children;
  }
}

export const CustomHtmlView: React.FC<CustomHtmlViewProps> = ({ config }) => {
  if (!config.rawHtmlTemplate || config.rawHtmlTemplate.trim() === '') {
    return (
      <div className="p-12 flex flex-col items-center justify-center text-center bg-slate-900/50 border border-dashed border-slate-700 m-4 rounded-2xl">
        <p className="text-slate-500 font-medium text-sm">לא הוזן קוד HTML לאזור זה. בקש מה-AI לייצר עבורך או כתוב בעצמך בעורך.</p>
      </div>
    );
  }

  return (
    <SectionErrorBoundary>
      <div 
        dangerouslySetInnerHTML={{ __html: config.rawHtmlTemplate }} 
        className={clsx("w-full group/custom-html", config.customClasses)}
        style={{ backgroundColor: config.backgroundColor }}
      />
    </SectionErrorBoundary>
  );
};
