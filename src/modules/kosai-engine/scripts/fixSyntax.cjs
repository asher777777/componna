const fs = require('fs');

let content = fs.readFileSync('src/modules/kosai-engine/components/KosaiSettingsBackoffice.tsx', 'utf8');

// I accidentally closed the div early.
const oldBlock = `                )}
              </div>
            ))}
          </div>
{rules.length === 0 && (`;

const newBlock = `                )}
              </div>
            ))}
{rules.length === 0 && (`;

content = content.replace(oldBlock, newBlock);

fs.writeFileSync('src/modules/kosai-engine/components/KosaiSettingsBackoffice.tsx', content, 'utf8');
console.log('Fixed early div close');
