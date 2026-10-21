import fs from 'node:fs';

const path = 'src/modules/KosWebAi/sections/dynamicListing/DynamicListingSection.tsx';
let sec = fs.readFileSync(path, 'utf8');

// 1. Destructure sectionHeightMode and customSectionHeight
sec = sec.replace(
  '    singlePageId,\n    customImageOverride,\n  } = config;',
  '    singlePageId,\n    customImageOverride,\n    sectionHeightMode,\n    customSectionHeight,\n  } = config;'
);

// 2. In section style, apply sectionHeightMode & customSectionHeight
const oldSectionTag = `    <section
      id={anchorId}
      className="relative w-full py-16 md:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden transition-colors"
      style={{ backgroundColor: backgroundColor !== 'transparent' ? backgroundColor : undefined }}
      dir="rtl"
    >`;

const newSectionTag = `    const effectiveMinHeight =
      sectionHeightMode === 'compact'
        ? '400px'
        : sectionHeightMode === 'medium'
        ? '600px'
        : sectionHeightMode === 'tall'
        ? '850px'
        : sectionHeightMode === 'custom' && customSectionHeight
        ? \`\${customSectionHeight}px\`
        : undefined;

    return (
      <section
        id={anchorId}
        className={clsx(
          'relative w-full px-4 sm:px-6 lg:px-8 overflow-hidden transition-all flex flex-col justify-center',
          sectionHeightMode === 'compact' ? 'py-8 md:py-12' : sectionHeightMode === 'tall' ? 'py-24 md:py-32' : 'py-16 md:py-24'
        )}
        style={{
          backgroundColor: backgroundColor !== 'transparent' ? backgroundColor : undefined,
          minHeight: effectiveMinHeight,
        }}
        dir="rtl"
      >`;

sec = sec.replace(
  '  return (\n    <section\n      id={anchorId}\n      className="relative w-full py-16 md:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden transition-colors"\n      style={{ backgroundColor: backgroundColor !== \'transparent\' ? backgroundColor : undefined }}\n      dir="rtl"\n    >',
  newSectionTag
);

fs.writeFileSync(path, sec, 'utf8');
console.log('DynamicListingSection.tsx updated with height styling!');
