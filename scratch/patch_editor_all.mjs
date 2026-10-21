import fs from 'node:fs';

const path = 'src/modules/KosWebAi/sections/dynamicListing/DynamicListingEditor.tsx';
let ed = fs.readFileSync(path, 'utf8');

// 1. In accordion 1 (Layout / Visual Style), add Section Height control
const layoutSectionBottom = `              {/* Visual Effect Selector */}
              <div className="space-y-1.5 pt-2 border-t border-white/10">
                <label className="text-xs font-bold text-zinc-300">אפקט ויזואלי וריחוף</label>
                <select
                  value={formData.effectStyle || 'border-beam'}
                  onChange={(e) => updateField('effectStyle', e.target.value as any)}
                  className={\`w-full rounded-xl px-3 py-2 text-xs outline-none border \${
                    isDarkMode
                      ? 'bg-black border-white/10 text-white'
                      : 'bg-white border-slate-300 text-slate-900'
                  }\`}
                >
                  <option value="border-beam">Border Beam (הילת מסגרת נעה על כרטיס מוביל)</option>
                  <option value="glow-hover">Glow Hover (זוהר עדין בריחוף)</option>
                  <option value="tilt-3d">Tilt 3D (הטיה תלת-ממדית עם תנועת העכבר)</option>
                  <option value="subtle">עדין ונקי (Subtle Minimal)</option>
                </select>
              </div>`;

const layoutSectionBottomWithHeight = `              {/* Visual Effect Selector */}
              <div className="space-y-1.5 pt-2 border-t border-white/10">
                <label className="text-xs font-bold text-zinc-300">אפקט ויזואלי וריחוף</label>
                <select
                  value={formData.effectStyle || 'border-beam'}
                  onChange={(e) => updateField('effectStyle', e.target.value as any)}
                  className={\`w-full rounded-xl px-3 py-2 text-xs outline-none border \${
                    isDarkMode
                      ? 'bg-black border-white/10 text-white'
                      : 'bg-white border-slate-300 text-slate-900'
                  }\`}
                >
                  <option value="border-beam">Border Beam (הילת מסגרת נעה על כרטיס מוביל)</option>
                  <option value="glow-hover">Glow Hover (זוהר עדין בריחוף)</option>
                  <option value="tilt-3d">Tilt 3D (הטיה תלת-ממדית עם תנועת העכבר)</option>
                  <option value="subtle">עדין ונקי (Subtle Minimal)</option>
                </select>
              </div>

              {/* עיצוב גובה הליסטינג (Section Height Control) */}
              <div className="space-y-2 pt-2 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                    <ArrowUpDown className="w-3.5 h-3.5 text-indigo-400" />
                    <span>עיצוב גובה הליסטינג</span>
                  </label>
                  <span className="text-[10px] text-zinc-500 font-mono">
                    {formData.sectionHeightMode === 'custom' ? \`\${formData.customSectionHeight || 600}px\` : formData.sectionHeightMode || 'auto'}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                  {[
                    { id: 'auto', label: 'אוטומטי (ברירת מחדל)' },
                    { id: 'compact', label: 'קומפקטי' },
                    { id: 'medium', label: 'בינוני' },
                    { id: 'tall', label: 'גבוה' },
                    { id: 'custom', label: 'מותאם אישית' },
                  ].map((h) => (
                    <button
                      key={h.id}
                      type="button"
                      onClick={() => updateField('sectionHeightMode', h.id as any)}
                      className={\`p-1.5 rounded-lg border text-center transition cursor-pointer text-[11px] \${
                        (formData.sectionHeightMode || 'auto') === h.id
                          ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300 font-bold'
                          : isDarkMode
                          ? 'bg-white/5 border-white/5 text-zinc-400 hover:text-white'
                          : 'bg-slate-50 border-slate-200 text-slate-700'
                      }\`}
                    >
                      {h.label}
                    </button>
                  ))}
                </div>
                {formData.sectionHeightMode === 'custom' && (
                  <div className="space-y-1 pt-1.5">
                    <div className="flex items-center justify-between text-[11px] text-zinc-400">
                      <span>גובה בפיקסלים:</span>
                      <span className="font-mono text-indigo-400 font-bold">{formData.customSectionHeight || 600}px</span>
                    </div>
                    <input
                      type="range"
                      min={300}
                      max={1200}
                      step={20}
                      value={formData.customSectionHeight || 600}
                      onChange={(e) => updateField('customSectionHeight', Number(e.target.value))}
                      className="w-full accent-indigo-500 cursor-pointer"
                    />
                  </div>
                )}
              </div>`;

ed = ed.replace(layoutSectionBottom, layoutSectionBottomWithHeight);

// 2. Also enhance handleSelectSinglePage to sync into items[0] for manual management!
const handleSelectSinglePageOld = `      const patch: Partial<DynamicListingSectionConfig> = {
        singlePageId: pageId,
        title: foundPage.pageTitle || hero?.title || formData.title,
        subtitle: hero?.subtitle || catCfg?.description || formData.subtitle,
        badge: catCfg?.shortLabel || formData.badge || 'עמוד נבחר',
        customImageOverride: hero?.imageSrc || hero?.imageUrl || formData.customImageOverride,
      };`;

const handleSelectSinglePageNew = `      const chosenImageUrl = hero?.imageSrc || hero?.imageUrl || formData.customImageOverride || 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=800&q=80';
      const chosenSlug = foundPage.slug ? (foundPage.slug.startsWith('/') ? foundPage.slug : \`/\${foundPage.slug}\`) : \`/p/\${foundPage.pageId}\`;
      const singleItem: DynamicListingItem = {
        id: foundPage.pageId,
        title: foundPage.pageTitle,
        subtitle: hero?.subtitle || catCfg?.description || '',
        excerpt: hero?.description || '',
        imageUrl: chosenImageUrl,
        badge: catCfg?.shortLabel || 'עמוד נבחר',
        category: catCfg?.label || 'עמוד תוכן',
        date: new Date().toLocaleDateString('he-IL'),
        linkUrl: chosenSlug,
        actionType: 'modal',
      };

      const patch: Partial<DynamicListingSectionConfig> = {
        singlePageId: pageId,
        title: foundPage.pageTitle || hero?.title || formData.title,
        subtitle: hero?.subtitle || catCfg?.description || formData.subtitle,
        badge: catCfg?.shortLabel || formData.badge || 'עמוד נבחר',
        customImageOverride: chosenImageUrl,
        // Make sure manual items array has this item populated so it appears in the manual tab!
        items: [singleItem, ...(formData.items || []).filter(it => it.id !== foundPage.pageId)],
      };`;

ed = ed.replace(handleSelectSinglePageOld, handleSelectSinglePageNew);

// 3. Reorder Source Accordion: Put Category/Path selector FIRST, and Pages selector SECOND
const oldSourceAccordionInner = `              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-300">סוג מקור התוכן</label>
                <select
                  value={formData.source || 'pages'}
                  onChange={(e) => updateField('source', e.target.value as any)}
                  className={\`w-full rounded-xl px-3 py-2 text-xs outline-none border \${
                    isDarkMode
                      ? 'bg-black border-white/10 text-white'
                      : 'bg-white border-slate-300 text-slate-900'
                  }\`}
                >
                  <option value="pages">עמודי תוכן, מאמרים ומדריכים (PAGES - ברירת מחדל)</option>
                  <option value="media_gallery">ספריית המדיה והקבצים של הטננט (Media Hub Gallery)</option>
                  <option value="archives">נתיבי הארכיונים והקטגוריות (Archives Hub)</option>
                  <option value="custom">הזנה ידנית מותאמת אישית (Custom Items)</option>
                  <option value="kos_tube">סרטוני וידאו (KOS_TUBE)</option>
                  <option value="campaigns">פרויקטים וקמפיינים (CAMPAIGNS)</option>
                </select>
              </div>

              {formData.source === 'archives' && (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                      <FolderArchive className="w-3.5 h-3.5 text-indigo-400" />
                      <span>סינון נתיב ארכיון ספציפי</span>
                    </label>
                    <select
                      value={formData.archivePathFilter || 'all'}
                      onChange={(e) => updateField('archivePathFilter', e.target.value)}
                      className={\`w-full rounded-xl px-3 py-2 text-xs outline-none border \${
                        isDarkMode
                          ? 'bg-black border-white/10 text-white'
                          : 'bg-white border-slate-300 text-slate-900'
                      }\`}
                    >
                      <option value="all">כל נתיבי הארכיונים של הטננט (כולם)</option>
                      {Object.entries(ARCHIVE_7_SECTIONS_SPECS).map(([catKey, spec]) => (
                        <option key={catKey} value={catKey}>
                          /{spec.slugPrefix} • {spec.name} ({spec.defaultTitle})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* אפשרות לקבוע תמונה מותאמת לארכיון */}
                  <div className="pt-2 border-t border-white/10">
                    <PageBuilderImageUpload
                      label="תמונה מותאמת לאזור הארכיון"
                      value={formData.customImageOverride || ''}
                      onChange={(imgUrl) => updateField('customImageOverride', imgUrl)}
                    />
                  </div>
                </div>
              )}

              {formData.source === 'pages' && (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                      <Filter className="w-3.5 h-3.5 text-indigo-400" />
                      <span>סינון לפי נתיב קטגוריה בטננט</span>
                    </label>
                    <select
                      value={formData.filterCategory || 'all'}
                      onChange={(e) => {
                        const newCat = e.target.value;
                        updateField('filterCategory', newCat);
                        // Reset singlePageId if category changes
                        if (formData.singlePageId) {
                          updateField('singlePageId', '');
                        }
                      }}
                      className={\`w-full rounded-xl px-3 py-2 text-xs outline-none border \${
                        isDarkMode
                          ? 'bg-black border-white/10 text-white'
                          : 'bg-white border-slate-300 text-slate-900'
                      }\`}
                    >
                      <option value="all">כל סוגי העמודים והנתיבים (All)</option>
                      {Object.values(PAGE_CATEGORIES).map((cat) => (
                        <option key={cat.key} value={cat.key}>
                          /{cat.slugPrefixLower} • {cat.label} ({cat.shortLabel})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* בחירת עמוד בודד מתוך הקטגוריה שנבחרה ומילוי אוטומטי של נתוני האזור */}
                  <div className="space-y-1 p-2.5 rounded-xl border border-indigo-500/30 bg-indigo-500/5">
                    <label className="text-xs font-bold text-indigo-300 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span>משיכת נתוני עמוד בודד (בחירת עמוד מהקטגוריה)</span>
                      </span>
                      {formData.singlePageId && (
                        <button
                          type="button"
                          onClick={() => handleSelectSinglePage('')}
                          className="text-[10px] text-amber-400 hover:underline cursor-pointer"
                        >
                          נקה בחירת עמוד
                        </button>
                      )}
                    </label>

                    {loadingTenantPages ? (
                      <p className="text-[11px] text-zinc-400">טוען עמודים זמינים...</p>
                    ) : (
                      <select
                        value={formData.singlePageId || 'all'}
                        onChange={(e) => handleSelectSinglePage(e.target.value)}
                        className={\`w-full rounded-xl px-3 py-2 text-xs outline-none border \${
                          isDarkMode
                            ? 'bg-black border-white/10 text-white'
                            : 'bg-white border-slate-300 text-slate-900'
                        }\`}
                      >
                        <option value="all">הצג את כל עמודי הקטגוריה (ללא התמקדות בעמוד בודד)</option>
                        {tenantPages
                          .filter((p) => {
                            if (!formData.filterCategory || formData.filterCategory === 'all') return true;
                            return p.pageCategory === formData.filterCategory;
                          })
                          .map((p) => (
                            <option key={p.pageId} value={p.pageId}>
                              {p.pageTitle} (/{p.slug})
                            </option>
                          ))}
                      </select>
                    )}
                    <p className="text-[10px] text-zinc-400 leading-tight">
                      בחירת עמוד ממלאת אוטומטית את כותרת האזור, תת-הכותרת, התגית והתמונה המותאמת.
                    </p>
                  </div>

                  {/* אפשרות לקבוע תמונה מותאמת ישירות לאזור */}
                  <div className="pt-2 border-t border-white/10">
                    <PageBuilderImageUpload
                      label="תמונה מותאמת לאזור (דריסת תמונת הרקע / כרטיס ראשי)"
                      value={formData.customImageOverride || ''}
                      onChange={(imgUrl) => updateField('customImageOverride', imgUrl)}
                    />
                  </div>
                </div>
              )}`;

const newSourceAccordionInner = `              {/* 1. תפריט בחירת נתיב קטגוריה בטננט - עכשיו עליון וראשון! */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5 text-indigo-400" />
                  <span>נתיב קטגוריה בטננט (סינון נתיב)</span>
                </label>
                <select
                  value={formData.filterCategory || 'all'}
                  onChange={(e) => {
                    const newCat = e.target.value;
                    updateField('filterCategory', newCat);
                    if (formData.singlePageId) {
                      updateField('singlePageId', '');
                    }
                  }}
                  className={\`w-full rounded-xl px-3 py-2 text-xs outline-none border \${
                    isDarkMode
                      ? 'bg-black border-white/10 text-white'
                      : 'bg-white border-slate-300 text-slate-900'
                  }\`}
                >
                  <option value="all">כל סוגי העמודים והנתיבים (All)</option>
                  {Object.values(PAGE_CATEGORIES).map((cat) => (
                    <option key={cat.key} value={cat.key}>
                      /{cat.slugPrefixLower} • {cat.label} ({cat.shortLabel})
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. תפריט בחירת עמוד מתוך כל העמודים שבטננט (תחת הקטגוריה שנבחרה) */}
              <div className="space-y-1 p-2.5 rounded-xl border border-indigo-500/30 bg-indigo-500/5">
                <label className="text-xs font-bold text-indigo-300 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>עמוד ספציפי מהטננט (משיכת נתונים אוטומטית לאזור)</span>
                  </span>
                  {formData.singlePageId && (
                    <button
                      type="button"
                      onClick={() => handleSelectSinglePage('')}
                      className="text-[10px] text-amber-400 hover:underline cursor-pointer"
                    >
                      נקה בחירת עמוד
                    </button>
                  )}
                </label>

                {loadingTenantPages ? (
                  <p className="text-[11px] text-zinc-400">טוען עמודים זמינים...</p>
                ) : (
                  <select
                    value={formData.singlePageId || 'all'}
                    onChange={(e) => handleSelectSinglePage(e.target.value)}
                    className={\`w-full rounded-xl px-3 py-2 text-xs outline-none border \${
                      isDarkMode
                        ? 'bg-black border-white/10 text-white'
                        : 'bg-white border-slate-300 text-slate-900'
                    }\`}
                  >
                    <option value="all">כל עמודי הקטגוריה בטננט (ללא התמקדות בעמוד בודד)</option>
                    {tenantPages
                      .filter((p) => {
                        if (!formData.filterCategory || formData.filterCategory === 'all') return true;
                        return p.pageCategory === formData.filterCategory;
                      })
                      .map((p) => (
                        <option key={p.pageId} value={p.pageId}>
                          {p.pageTitle} (/{p.slug})
                        </option>
                      ))}
                  </select>
                )}
                <p className="text-[10px] text-zinc-400 leading-tight">
                  בחירת עמוד ממלאת ומעדכנת אוטומטית את כותרת האזור, תת-הכותרת, התגית, התמונה והפריט הידני.
                </p>
              </div>

              {/* 3. סוג מקור התוכן הכללי (עבר מתחת לתפריטי הנתיבים והעמודים) */}
              <div className="space-y-1 pt-2 border-t border-white/10">
                <label className="text-xs font-bold text-zinc-300">סוג מקור התוכן</label>
                <select
                  value={formData.source || 'pages'}
                  onChange={(e) => updateField('source', e.target.value as any)}
                  className={\`w-full rounded-xl px-3 py-2 text-xs outline-none border \${
                    isDarkMode
                      ? 'bg-black border-white/10 text-white'
                      : 'bg-white border-slate-300 text-slate-900'
                  }\`}
                >
                  <option value="pages">עמודי תוכן, מאמרים ומדריכים (PAGES - ברירת מחדל)</option>
                  <option value="archives">נתיבי הארכיונים והקטגוריות (Archives Hub)</option>
                  <option value="custom">הזנה ידנית מותאמת אישית (Custom Items)</option>
                  <option value="media_gallery">ספריית המדיה והקבצים של הטננט (Media Hub Gallery)</option>
                  <option value="kos_tube">סרטוני וידאו (KOS_TUBE)</option>
                  <option value="campaigns">פרויקטים וקמפיינים (CAMPAIGNS)</option>
                </select>
              </div>

              {formData.source === 'archives' && (
                <div className="space-y-3 pt-1">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                      <FolderArchive className="w-3.5 h-3.5 text-indigo-400" />
                      <span>סינון נתיב ארכיון ספציפי</span>
                    </label>
                    <select
                      value={formData.archivePathFilter || 'all'}
                      onChange={(e) => updateField('archivePathFilter', e.target.value)}
                      className={\`w-full rounded-xl px-3 py-2 text-xs outline-none border \${
                        isDarkMode
                          ? 'bg-black border-white/10 text-white'
                          : 'bg-white border-slate-300 text-slate-900'
                      }\`}
                    >
                      <option value="all">כל נתיבי הארכיונים של הטננט (כולם)</option>
                      {Object.entries(ARCHIVE_7_SECTIONS_SPECS).map(([catKey, spec]) => (
                        <option key={catKey} value={catKey}>
                          /{spec.slugPrefix} • {spec.name} ({spec.defaultTitle})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* אפשרות לקבוע תמונה מותאמת ישירות לאזור */}
              <div className="pt-2 border-t border-white/10">
                <PageBuilderImageUpload
                  label="תמונה מותאמת לאזור (דריסת תמונת הרקע / כרטיס ראשי)"
                  value={formData.customImageOverride || ''}
                  onChange={(imgUrl) => updateField('customImageOverride', imgUrl)}
                />
              </div>`;

ed = ed.replace(oldSourceAccordionInner, newSourceAccordionInner);

// 4. Update Accordion 5 (Manual items): Add Page Selector with "אחר" that reveals custom URL input, and Modal vs Link selector!
const oldItemFields = `                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <PageBuilderInput
                                label="קישור (URL)"
                                value={item.linkUrl || ''}
                                onChange={(val) => updateItem(index, { linkUrl: val })}
                                placeholder="https://... או #sec-contact"
                              />

                              <div className="space-y-1">
                                <label className="text-[11px] font-bold text-zinc-400">פעולת לחיצה</label>
                                <select
                                  value={item.actionType || 'modal'}
                                  onChange={(e) =>
                                    updateItem(index, { actionType: e.target.value as any })
                                  }
                                  className={\`w-full rounded-xl px-3 py-2 text-xs outline-none border \${
                                    isDarkMode
                                      ? 'bg-black border-white/10 text-white'
                                      : 'bg-white border-slate-300 text-slate-900'
                                  }\`}
                                >
                                  <option value="modal">פתיחה בחלונית צפה (Modal)</option>
                                  <option value="link">מעבר לקישור בעמוד חדש (Link)</option>
                                </select>
                              </div>
                            </div>`;

const newItemFields = `                            {/* תפריט בחירת עמוד מהטננט עם אפשרות "אחר" */}
                            <div className="space-y-2 p-2.5 rounded-xl border border-white/10 bg-white/5">
                              <div className="space-y-1">
                                <label className="text-[11px] font-bold text-zinc-300 flex items-center justify-between">
                                  <span>שיוך לעמוד בטננט או כתובת אחרת</span>
                                  <span className="text-[10px] text-zinc-500">בחירת עמוד תעדכן אוטומטית כותרת ותמונה</span>
                                </label>
                                <select
                                  value={
                                    tenantPages.some((tp) => {
                                      const pageUrl = tp.slug ? (tp.slug.startsWith('/') ? tp.slug : \`/\${tp.slug}\`) : \`/p/\${tp.pageId}\`;
                                      return item.linkUrl === pageUrl || item.id === tp.pageId;
                                    })
                                      ? (tenantPages.find((tp) => {
                                          const pageUrl = tp.slug ? (tp.slug.startsWith('/') ? tp.slug : \`/\${tp.slug}\`) : \`/p/\${tp.pageId}\`;
                                          return item.linkUrl === pageUrl || item.id === tp.pageId;
                                        })?.pageId || 'custom_other')
                                      : 'custom_other'
                                  }
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    if (val === 'custom_other') {
                                      // Set to other, keep or clear linkUrl
                                      updateItem(index, { linkUrl: item.linkUrl || 'https://' });
                                    } else {
                                      const p = tenantPages.find((tp) => tp.pageId === val);
                                      if (p) {
                                        const pageUrl = p.slug ? (p.slug.startsWith('/') ? p.slug : \`/\${p.slug}\`) : \`/p/\${p.pageId}\`;
                                        const hero = p.heroData;
                                        const catCfg = p.pageCategory && p.pageCategory in PAGE_CATEGORIES ? PAGE_CATEGORIES[p.pageCategory as keyof typeof PAGE_CATEGORIES] : null;
                                        updateItem(index, {
                                          title: p.pageTitle || item.title,
                                          subtitle: hero?.subtitle || catCfg?.description || item.subtitle,
                                          excerpt: hero?.description || item.excerpt,
                                          imageUrl: hero?.imageSrc || hero?.imageUrl || item.imageUrl,
                                          linkUrl: pageUrl,
                                          category: catCfg?.label || item.category,
                                          badge: catCfg?.shortLabel || item.badge,
                                        });
                                      }
                                    }
                                  }}
                                  className={\`w-full rounded-xl px-3 py-2 text-xs outline-none border \${
                                    isDarkMode
                                      ? 'bg-black border-white/10 text-white'
                                      : 'bg-white border-slate-300 text-slate-900'
                                  }\`}
                                >
                                  <option value="">-- בחר עמוד מהטננט --</option>
                                  {tenantPages.map((p) => (
                                    <option key={p.pageId} value={p.pageId}>
                                      {p.pageTitle} (/{p.slug})
                                    </option>
                                  ))}
                                  <option value="custom_other">⚡ אחר / כתובת URL חיצונית מותאמת אישית</option>
                                </select>
                              </div>

                              {/* שדה URL מתגלה כאשר נבחר "אחר" או כאשר יש כתובת חיצונית */}
                              {(!tenantPages.some((tp) => {
                                const pageUrl = tp.slug ? (tp.slug.startsWith('/') ? tp.slug : \`/\${tp.slug}\`) : \`/p/\${tp.pageId}\`;
                                return item.linkUrl === pageUrl || item.id === tp.pageId;
                              }) || item.linkUrl?.startsWith('http') || item.linkUrl === 'https://') && (
                                <div className="animate-fadeIn pt-1">
                                  <PageBuilderInput
                                    label="כתובת קישור מותאמת (URL)"
                                    value={item.linkUrl || ''}
                                    onChange={(val) => updateItem(index, { linkUrl: val })}
                                    placeholder="https://... או #sec-contact"
                                  />
                                </div>
                              )}

                              {/* בחירה האם לעבור לאתר או להציג על גבי מודל צף */}
                              <div className="space-y-1.5 pt-1 border-t border-white/10">
                                <label className="text-[11px] font-bold text-zinc-300">פעולת לחיצה על הפריט</label>
                                <div className="grid grid-cols-2 gap-2">
                                  <button
                                    type="button"
                                    onClick={() => updateItem(index, { actionType: 'modal' })}
                                    className={\`p-2 rounded-xl border text-center transition cursor-pointer text-xs flex items-center justify-center gap-1.5 \${
                                      (item.actionType || 'modal') === 'modal'
                                        ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300 font-bold'
                                        : isDarkMode
                                        ? 'bg-white/5 border-white/5 text-zinc-400 hover:text-white'
                                        : 'bg-slate-50 border-slate-200 text-slate-700'
                                    }\`}
                                  >
                                    <Layers className="w-3.5 h-3.5" />
                                    <span>הצג על גבי מודל צף</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => updateItem(index, { actionType: 'link' })}
                                    className={\`p-2 rounded-xl border text-center transition cursor-pointer text-xs flex items-center justify-center gap-1.5 \${
                                      item.actionType === 'link'
                                        ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300 font-bold'
                                        : isDarkMode
                                        ? 'bg-white/5 border-white/5 text-zinc-400 hover:text-white'
                                        : 'bg-slate-50 border-slate-200 text-slate-700'
                                    }\`}
                                  >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                    <span>מעבר ישיר לאתר / עמוד</span>
                                  </button>
                                </div>
                              </div>
                            </div>`;

ed = ed.replace(oldItemFields, newItemFields);

fs.writeFileSync(path, ed, 'utf8');
console.log('DynamicListingEditor.tsx updated with all user requirements!');
