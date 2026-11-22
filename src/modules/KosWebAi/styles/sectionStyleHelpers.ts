export function getTitleScaleClass(
  titleFontSize?: string,
  objectScale: string = 'auto',
  defaultClass: string = 'text-4xl sm:text-5xl md:text-6xl'
): string {
  if (titleFontSize === 'text-2xl') return 'text-xl sm:text-2xl';
  if (titleFontSize === 'text-3xl') return 'text-2xl sm:text-3xl';
  if (titleFontSize === 'text-4xl') return 'text-3xl sm:text-4xl';
  if (titleFontSize === 'text-5xl') return 'text-4xl sm:text-5xl';
  if (titleFontSize === 'text-6xl') return 'text-4xl sm:text-6xl';
  if (titleFontSize === 'text-7xl') return 'text-5xl sm:text-7xl';
  if (objectScale === 'compact') return 'text-3xl sm:text-4xl md:text-5xl';
  if (objectScale === 'normal') return 'text-4xl sm:text-5xl md:text-6xl';
  if (objectScale === 'large') return 'text-4xl sm:text-6xl md:text-7xl';
  if (objectScale === 'massive') return 'text-5xl sm:text-6xl md:text-7xl lg:text-[5.25rem]';
  return defaultClass;
}

export function getTitleWeightClass(
  titleFontWeight?: string,
  defaultWeight: string = 'font-bold'
): string {
  if (
    titleFontWeight === 'font-normal' ||
    titleFontWeight === 'font-medium' ||
    titleFontWeight === 'font-semibold' ||
    titleFontWeight === 'font-bold' ||
    titleFontWeight === 'font-extrabold' ||
    titleFontWeight === 'font-black'
  ) {
    return titleFontWeight;
  }
  return defaultWeight;
}

export function getSubtitleScaleClass(
  subtitleFontSize?: string,
  defaultClass: string = 'text-sm sm:text-base'
): string {
  if (
    subtitleFontSize === 'text-xs' ||
    subtitleFontSize === 'text-sm' ||
    subtitleFontSize === 'text-base' ||
    subtitleFontSize === 'text-lg' ||
    subtitleFontSize === 'text-xl'
  ) {
    return subtitleFontSize;
  }
  return defaultClass;
}

export function getDescScaleClass(
  descriptionFontSize?: string,
  objectScale: string = 'auto',
  defaultClass: string = 'text-base sm:text-lg max-w-2xl'
): string {
  if (descriptionFontSize === 'text-xs') return 'text-xs max-w-xl';
  if (descriptionFontSize === 'text-sm') return 'text-sm max-w-xl';
  if (descriptionFontSize === 'text-base') return 'text-base max-w-2xl';
  if (descriptionFontSize === 'text-lg') return 'text-lg sm:text-xl max-w-2xl';
  if (descriptionFontSize === 'text-xl') return 'text-xl sm:text-2xl max-w-3xl';
  if (objectScale === 'compact') return 'text-sm sm:text-base max-w-xl';
  if (objectScale === 'normal') return 'text-base sm:text-lg max-w-2xl';
  if (objectScale === 'large') return 'text-lg sm:text-xl md:text-2xl max-w-3xl';
  if (objectScale === 'massive') return 'text-xl sm:text-2xl max-w-3xl';
  return defaultClass;
}

export function getButtonShapeClass(
  buttonShape: string = 'auto',
  defaultRadius: string = 'rounded-2xl'
): string {
  if (buttonShape === 'pill' || buttonShape === 'round') return 'rounded-full';
  if (buttonShape === 'rounded') return 'rounded-2xl';
  if (buttonShape === 'sharp') return 'rounded-none';
  if (buttonShape === 'chiseled' || buttonShape === 'square') return 'rounded-lg';
  return defaultRadius;
}

export function getButtonSizeClass(
  buttonSize: string = 'auto',
  defaultSize: string = 'px-8 py-4 text-sm sm:text-base'
): string {
  if (buttonSize === 'sm' || buttonSize === 'compact') return 'px-5 py-2.5 text-xs sm:text-sm';
  if (buttonSize === 'md' || buttonSize === 'normal') return 'px-7 py-3.5 text-sm sm:text-base';
  if (buttonSize === 'lg' || buttonSize === 'large') return 'px-9 py-4 text-base sm:text-lg';
  if (buttonSize === 'xl') return 'px-11 py-5 text-lg sm:text-xl';
  return defaultSize;
}
