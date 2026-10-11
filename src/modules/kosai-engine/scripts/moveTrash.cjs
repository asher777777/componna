const fs = require('fs');

let content = fs.readFileSync('src/modules/kosai-engine/components/KosaiSettingsBackoffice.tsx', 'utf8');

// Move Trash2 from summary to the body
const summaryTrashOld = `                  <div className="flex items-center gap-4" onClick={e => e.stopPropagation()}>
                    <button 
                      onClick={() => handleDeleteRule(rule.id)}
                      className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-400 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors shrink-0"
                      title="מחק סוכן"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>`;

content = content.replace(summaryTrashOld, '');

const bodyHeaderOld = `                          <button 
                            onClick={() => handleUpdateRule({ ...rule, isActive: !rule.isActive })}
                            className={clsx("relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none", rule.isActive ? "bg-purple-600" : "bg-slate-300")}
                          >
                            <span className={clsx("inline-block h-4 w-4 transform rounded-full bg-white transition-transform", rule.isActive ? "-translate-x-6" : "-translate-x-1")} />
                          </button>
                        </div>`;

const bodyHeaderNew = `                          <button 
                            onClick={() => handleUpdateRule({ ...rule, isActive: !rule.isActive })}
                            className={clsx("relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none", rule.isActive ? "bg-purple-600" : "bg-slate-300")}
                          >
                            <span className={clsx("inline-block h-4 w-4 transform rounded-full bg-white transition-transform", rule.isActive ? "-translate-x-6" : "-translate-x-1")} />
                          </button>
                          <button 
                            onClick={() => handleDeleteRule(rule.id)}
                            className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-50 border border-slate-200 text-slate-400 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors shrink-0 mr-4"
                            title="מחק סוכן"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>`;

content = content.replace(bodyHeaderOld, bodyHeaderNew);

fs.writeFileSync('src/modules/kosai-engine/components/KosaiSettingsBackoffice.tsx', content, 'utf8');
console.log('Moved trash button');
