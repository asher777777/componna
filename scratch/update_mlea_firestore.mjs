import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyC011dhtJddDjLmTQ2HCvgVA0DPN8rKFwQ',
  projectId: 'glowmanage',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function updateMleaPagesAndBrand() {
  console.log('--- UPDATING MLEA PAGES AND BRAND DNA ---');

  // 1. Update page_chasidut_classes_midrash_leah
  const chasidutRef = doc(db, 'tenants', 'mlea', 'kos_web_ai_documents', 'page_chasidut_classes_midrash_leah');
  const chasidutSnap = await getDoc(chasidutRef);
  if (chasidutSnap.exists()) {
    const data = chasidutSnap.data();
    const sections = { ...(data.sections || {}) };

    if (sections['sec-advantages']) {
      sections['sec-advantages'] = {
        ...sections['sec-advantages'],
        subtitle: 'הבשורה שלנו עבורך',
        heading: 'המעלות והעוצמה הנשית במדרש לאה',
      };
    }
    if (sections['sec-pain-points']) {
      sections['sec-pain-points'] = {
        ...sections['sec-pain-points'],
        subtitle: 'עוגן בתוך שגרת החול',
        heading: 'האתגרים שאנו פוגשות ופותרות יחד איתך',
      };
    }
    if (sections['sec-target-audiences']) {
      sections['sec-target-audiences'] = {
        ...sections['sec-target-audiences'],
        subtitle: 'המרחב שמחכה לך',
        heading: 'למי נתפר מסע החסידות הייחודי הזה?',
      };
    }
    if (sections['sec-about']) {
      sections['sec-about'] = {
        ...sections['sec-about'],
        subtitle: 'פעימות הלב הנשי במפגש עם פנימיות התורה',
        heading: 'לטעום ממעיינות החכמה והנפש',
      };
    }
    if (sections['sec-faq']) {
      sections['sec-faq'] = {
        ...sections['sec-faq'],
        subtitle: 'כל מה שחשוב לך לדעת לקראת המסע המשותף',
        title: 'שאלות ותשובות בגובה העיניים',
      };
    }

    await updateDoc(chasidutRef, { sections });
    console.log('✅ Updated page_chasidut_classes_midrash_leah in Firestore');
  }

  // 2. Update page_kosass_srv_3 (dating coaching)
  const srv3Ref = doc(db, 'tenants', 'mlea', 'kos_web_ai_documents', 'page_kosass_srv_3');
  const srv3Snap = await getDoc(srv3Ref);
  if (srv3Snap.exists()) {
    const data = srv3Snap.data();
    const sections = { ...(data.sections || {}) };

    if (sections['sec-advantages']) {
      sections['sec-advantages'] = {
        ...sections['sec-advantages'],
        subtitle: 'הבשורה שלנו עבורך',
        heading: 'העוגנים הייחודיים במסע אל הבית שלך',
      };
    }
    if (sections['sec-pain-points']) {
      sections['sec-pain-points'] = {
        ...sections['sec-pain-points'],
        subtitle: 'מנוחת הנפש במסע הזוגי',
        heading: 'האתגרים והחסמים שאנו מפרקות יחד בדרך לחופה',
      };
    }
    if (sections['sec-target-audiences']) {
      sections['sec-target-audiences'] = {
        ...sections['sec-target-audiences'],
        subtitle: 'המרחב שלך',
        heading: 'למי נתפר תהליך הליווי האישי?',
      };
    }
    if (sections['sec-about']) {
      sections['sec-about'] = {
        ...sections['sec-about'],
        subtitle: 'לפגוש את האחד מתוך חיבור עמוק לשורש הנשמה',
        heading: 'אימון אישי לבניית בית נאמן בישראל',
      };
    }

    await updateDoc(srv3Ref, { sections });
    console.log('✅ Updated page_kosass_srv_3 in Firestore');
  }

  // 3. Update page_kosass_shifting_courses
  const coursesRef = doc(db, 'tenants', 'mlea', 'kos_web_ai_documents', 'page_kosass_shifting_courses');
  const coursesSnap = await getDoc(coursesRef);
  if (coursesSnap.exists()) {
    const data = coursesSnap.data();
    const sections = { ...(data.sections || {}) };

    if (sections['sec-advantages']) {
      sections['sec-advantages'] = {
        ...sections['sec-advantages'],
        subtitle: 'הבשורה שלנו עבורך',
        heading: 'המעלות והייחודיות של הקורסים במדרש לאה',
      };
    }
    if (sections['sec-pain-points']) {
      sections['sec-pain-points'] = {
        ...sections['sec-pain-points'],
        subtitle: 'עוגן לשגרת יומך',
        heading: 'מענה עמוק לרחשי הלב והעומס היומיומי',
      };
    }
    if (sections['sec-target-audiences']) {
      sections['sec-target-audiences'] = {
        ...sections['sec-target-audiences'],
        subtitle: 'המרחב שמחכה לך',
        heading: 'למי מיועדות סדרות המפגשים שלנו?',
      };
    }

    await updateDoc(coursesRef, { sections });
    console.log('✅ Updated page_kosass_shifting_courses in Firestore');
  }

  // 4. Update Brand DNA for mlea with sectionTitles on services
  const mleaBrandRef = doc(db, 'tenants', 'mlea', 'settings', 'kos_branding_dna');
  const brandSnap = await getDoc(mleaBrandRef);
  if (brandSnap.exists()) {
    const brandData = brandSnap.data();
    const services = Array.isArray(brandData.ecosystem?.services) ? [...brandData.ecosystem.services] : [];

    // Ensure services have sectionTitles
    const updatedServices = services.map((srv, idx) => {
      if (typeof srv === 'string') return srv;

      const baseTitles = {
        aboutSubtitle: 'פעימות הלב הנשי במפגש עם פנימיות התורה',
        aboutHeading: `לצלול אל מעיינות החכמה והנפש ב-${srv.nameAndSlogan?.split('|')[0]?.trim() || 'שירות'}`,
        painPointsSubtitle: 'עוגן בתוך שגרת החול',
        painPointsHeading: 'האתגרים שאנו פוגשות ופותרות יחד איתך',
        targetAudiencesSubtitle: 'המרחב שמחכה לך',
        targetAudiencesHeading: 'למי נתפר המסע הייחודי הזה?',
        advantagesSubtitle: 'הבשורה שלנו עבורך',
        advantagesHeading: 'המעלות והעוצמה הנשית במדרש לאה',
        faqSubtitle: 'בגובה העיניים וברוגע',
        faqHeading: 'כל מה שחשוב לך לדעת לקראת היציאה לדרך',
        contactSubtitle: 'אנחנו כאן באהבה לכל שאלה והתייעצות',
        contactHeading: `מוזמנת להצטרף אלינו ב-${srv.nameAndSlogan?.split('|')[0]?.trim() || 'מרחב'}`,
      };

      return {
        ...srv,
        sectionTitles: {
          ...baseTitles,
          ...(srv.sectionTitles || {}),
        },
      };
    });

    await updateDoc(mleaBrandRef, {
      'ecosystem.services': updatedServices,
    });
    console.log('✅ Updated mlea kos_branding_dna ecosystem.services with sectionTitles in Firestore');
  }

  console.log('--- ALL FIRESTORE UPDATES FOR MLEA COMPLETED SUCCESSFULLY ---');
}

updateMleaPagesAndBrand().catch(console.error);
