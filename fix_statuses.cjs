
const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "src/modules/whatsapp-green-api-hub/components/WhatsAppStatusesTab.tsx");
let content = fs.readFileSync(filePath, "utf8");

// 1. Add imports
const importsToAdd = "\nimport { eventBus } from \"../../../core/bridge/EventBus\";\nimport { setupWhatsappStatusViewersSync } from \"../services/whatsappCrmSyncService\";\nimport { WhatsAppStatusAutomationsTab } from \"./WhatsAppStatusAutomationsTab\";\n";
content = content.replace("import { WhatsAppImageStudio } from \"./WhatsAppImageStudio\";", "import { WhatsAppImageStudio } from \"./WhatsAppImageStudio\";" + importsToAdd);

// 2. Change activeSubTab state type and add automations option
content = content.replace("useState<\"create\" | \"archive\">(\"create\")", "useState<\"create\" | \"archive\" | \"automations\">(\"create\")");

// 3. Add Automations sub-tab button
const archiveButtonHTML = "\n          <button\n            type=\"button\"\n            onClick={() => setActiveSubTab(\"automations\")}\n            className={`px-3 sm:px-4 py-2 rounded-xl sm:rounded-2xl font-black text-xs flex items-center gap-1.5 sm:gap-2 transition cursor-pointer ${activeSubTab === \"automations\" ? \"bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/20\" : isDark ? \"text-slate-400 hover:text-white bg-slate-900\" : \"text-slate-600 hover:text-slate-900 bg-slate-100\"}`}\n            title=\"אוטומציות סטטוסים\"\n          >\n            <Zap className=\"w-3.5 h-3.5 sm:w-4 sm:h-4\" />\n            <span className=\"hidden sm:inline\">אוטומציות</span>\n          </button>\n";
content = content.replace(
  "title=\"ארכיון סטטוסים\"\n          >\n            <Database className=\"w-3.5 h-3.5 sm:w-4 sm:h-4\" />\n            <span className=\"hidden sm:inline\">ארכיון צופים</span>\n          </button>\n        </div>\n      </div>",
  "title=\"ארכיון סטטוסים\"\n          >\n            <Database className=\"w-3.5 h-3.5 sm:w-4 sm:h-4\" />\n            <span className=\"hidden sm:inline\">ארכיון צופים</span>\n          </button>\n" + archiveButtonHTML + "        </div>\n      </div>"
);

// 4. Render WhatsAppStatusAutomationsTab
const automationsTabRender = "\n      {activeSubTab === \"automations\" && (\n        <WhatsAppStatusAutomationsTab db={db} isDark={isDark} />\n      )}\n";
content = content.replace(
  "{/* MEDIA GALLERY PICKER MODAL",
  automationsTabRender + "\n      {/* MEDIA GALLERY PICKER MODAL"
);

// 5. Setup sync in useEffect
const useEffectStr = "  useEffect(() => {\n    setIsLoadingArchive(true);";
const useEffectReplacement = "  useEffect(() => {\n    if (db) {\n      setupWhatsappStatusViewersSync(db, \"system_automated\");\n    }\n    setIsLoadingArchive(true);";
content = content.replace(useEffectStr, useEffectReplacement);

// 6. Publish event in handleRefreshAllStatistics
const refreshMatch = "const viewersCount = stats.filter((s) => s.status === \"read\").length;";
const refreshReplacement = "const viewersCount = stats.filter((s) => s.status === \"read\").length;\n              stats.forEach(s => {\n                if (s.status === \"read\" && s.participant) {\n                  const normPhone = normalizePhone(s.participant);\n                  eventBus.publish(\"whatsapp:status:viewed\", { phone: normPhone, statusId: st.id });\n                }\n              });";
content = content.replace(refreshMatch, refreshReplacement);

// 7. Update Viewers Modal UI
const modalMatch = "<span className=\"font-mono font-bold block text-[11px]\" dir=\"ltr\">{st.participant}</span>";
const modalReplacement = "{(() => {\n                          const crmContact = crmContacts.find(c => normalizePhone(c.phone) === normalizePhone(st.participant) || normalizePhone(c.conta_phone) === normalizePhone(st.participant));\n                          const displayName = crmContact?.conta_name ? `${crmContact.conta_name} (${st.participant})` : st.participant;\n                          return <span className=\"font-mono font-bold block text-[11px]\" dir=\"ltr\">{displayName}</span>\n                        })()}";
content = content.replace(modalMatch, modalReplacement);

fs.writeFileSync(filePath, content, "utf8");
console.log("Patched WhatsAppStatusesTab.tsx");

