import { matchCrmFunctionsForAdvisor } from '../src/modules/KosCrm/services/crmFunctionsCollection.ts';

const queries = [
  'לפתוח כרטיס לקוח',
  'כרטיס לקוח',
  'פתיחת לקוח',
  'כרטיס 360',
  'הוספת איש קשר',
];

queries.forEach(q => {
  console.log(`\n=== QUERY: "${q}" ===`);
  const res = matchCrmFunctionsForAdvisor(q);
  res.forEach((r, idx) => {
    console.log(`${idx + 1}. [${r.score} pts] ${r.item.title} (${r.item.actionKey}) - ${r.matchReasons.join(', ')}`);
  });
});
