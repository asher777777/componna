import React, { useState } from 'react';
import {
  Globe,
  Share2,
  Users,
  Target,
  Phone,
  MessageSquare,
  Sparkles,
  Calendar,
  Send,
  Video,
  Mic,
  FileText,
  UserPlus,
  CheckCircle2,
  ExternalLink,
  Award,
  ChevronLeft,
} from 'lucide-react';
import { SmartGroup, ContactRecord, CommunityPost } from '../types';
import { useHostCapabilities } from '../../../core/bridge/HostCapabilitiesContext';
import { LeadCaptureContract, NotificationContract } from '../../../core/contracts';
import { eventBus } from '../../../core/bridge/EventBus';

import { CommunityChatRoomView } from './CommunityChatRoomView';

interface CommunityMicroPortalViewProps {
  community: SmartGroup;
  contacts: ContactRecord[];
  onBackToManage: () => void;
  onPostCreated?: (post: CommunityPost) => void;
}

export const CommunityMicroPortalView: React.FC<CommunityMicroPortalViewProps> = ({
  community,
  contacts,
  onBackToManage,
  onPostCreated,
}) => {
  const { getCapability } = useHostCapabilities();
  const leadService = getCapability<LeadCaptureContract>('lead-capture');
  const notifyService = getCapability<NotificationContract>('notification');

  const [activeTab, setActiveTab] = useState<'overview' | 'feed' | 'chat' | 'join'>('overview');

  // Posts Feed State
  const [posts, setPosts] = useState<CommunityPost[]>(community.feedPosts || [
    {
      id: 'welcome_1',
      authorName: community.leaderName || 'הנהלת הקהילה',
      content: `ברוכים הבאים לעמוד הרשמי של ${community.name}! כאן נעדכן על התקדמות ביעדי הגיוס, מפגשים ואירועים קרובים.`,
      type: 'announcement',
      createdAt: new Date().toISOString(),
      likesCount: 12,
    },
  ]);
  const [newPostContent, setNewPostContent] = useState('');
  const [postType, setPostType] = useState<'post' | 'audio' | 'video' | 'announcement'>('post');
  const [postMediaUrl, setPostMediaUrl] = useState('');

  // Join Community Form State
  const [joinName, setJoinName] = useState('');
  const [joinPhone, setJoinPhone] = useState('');
  const [joinEmail, setJoinEmail] = useState('');
  const [joinSubmitted, setJoinSubmitted] = useState(false);
  const [joining, setJoining] = useState(false);

  // Community Metrics
  const targetGoal = community.targetGoal || 50000;
  const currentRaised = community.currentRaised || 32000;
  const percent = targetGoal > 0 ? Math.min(100, Math.round((currentRaised / targetGoal) * 100)) : 0;
  const publicSlug = community.pageSlug || community.id;
  const publicUrl = `/c/${publicSlug}`;

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;

    const newPost: CommunityPost = {
      id: `post_${Date.now()}`,
      authorName: community.leaderName || 'מנהל קהילה',
      content: newPostContent.trim(),
      type: postType,
      mediaUrl: postMediaUrl.trim() || undefined,
      createdAt: new Date().toISOString(),
      likesCount: 0,
    };

    setPosts([newPost, ...posts]);
    if (onPostCreated) onPostCreated(newPost);
    setNewPostContent('');
    setPostMediaUrl('');
    if (notifyService) {
      notifyService.notify('העדכון פורסם בהצלחה בפיד הקהילה!', 'success');
    }
  };

  const handleJoinCommunity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinName.trim() || !joinPhone.trim()) {
      alert('נא למלא שם ומספר טלפון');
      return;
    }

    setJoining(true);
    try {
      const payload = {
        conta_name: joinName.trim(),
        conta_phone: joinPhone.trim(),
        email: joinEmail.trim() || undefined,
        source: `Community Portal: ${community.name}`,
        community: community.name,
        tags: [community.name, 'מצטרף חדש'],
      };

      if (leadService) {
        await leadService.captureLead(payload);
      }

      // Publish event so CRM and CrmGroupsContext update immediately
      eventBus.publish('crm:lead:created', payload);

      setJoinSubmitted(true);
      if (notifyService) {
        notifyService.notify(`ברוך הבא לקהילת ${community.name}!`, 'success');
      }
    } catch (err: any) {
      alert('שגיאה בהצטרפות: ' + err.message);
    } finally {
      setJoining(false);
    }
  };

  const copyShareLink = () => {
    const fullUrl = `${window.location.origin}${publicUrl}`;
    navigator.clipboard.writeText(fullUrl);
    if (notifyService) {
      notifyService.notify('קישור עמוד הקהילה הועתק ללוח!', 'info');
    } else {
      alert('קישור העמוד הועתק ללוח: ' + fullUrl);
    }
  };

  return (
    <div className="space-y-6 text-right font-sans" dir="rtl">
      {/* Top Bar with Return & Share */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBackToManage}
            className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
            title="חזור לניהול קהילות"
          >
            <ChevronLeft className="w-4 h-4 rotate-180" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                מיקרו-פורטל קהילתי חי
              </span>
              <span className="text-xs text-slate-400 font-mono" dir="ltr">
                {publicUrl}
              </span>
            </div>
            <h2 className="text-lg font-black text-slate-900 mt-0.5">{community.name}</h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={copyShareLink}
            className="h-9 px-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5 text-indigo-600" />
            <span>העתק קישור להזמנה</span>
          </button>

          <a
            href={publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="h-9 px-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-indigo-200 transition-all cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>תצוגה מקדימה</span>
          </a>
        </div>
      </div>

      {/* Hero Banner with Community Cover */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white p-8 md:p-12 shadow-xl border border-indigo-700/30">
        {community.gallery && community.gallery.length > 0 && (
          <div className="absolute inset-0 opacity-20 bg-cover bg-center pointer-events-none" style={{ backgroundImage: `url(${community.gallery[0]})` }} />
        )}
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-bold border border-white/20">
            <Globe className="w-3.5 h-3.5 text-indigo-300" />
            <span>עמוד קהילה ציבורי פעיל</span>
          </div>

          <h1 className="text-2xl md:text-4xl font-black text-white tracking-tight">
            {community.name}
          </h1>

          <p className="text-sm md:text-base text-indigo-100/90 leading-relaxed max-w-2xl">
            {community.vision || community.description || 'קהילה מובילה לעשייה משותפת, ערבות הדדית וחיבור קהילתי איתן.'}
          </p>

          {/* Leader Card */}
          {community.leaderName && (
            <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20 mt-2">
              <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 font-bold flex items-center justify-center text-sm shadow-sm">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-indigo-200 block">שגריר / מוביל הקהילה</span>
                <span className="text-xs font-black text-white">{community.leaderName}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Micro-Portal Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-2xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'overview'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Target className="w-3.5 h-3.5" />
          <span>יעדי גיוס וחזון</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('feed')}
          className={`px-4 py-2 rounded-2xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'feed'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>פיד עדכונים בלעדי ({posts.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('chat')}
          className={`px-4 py-2 rounded-2xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'chat'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          <span>צ'אט ווידאו קהילתי</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('join')}
          className={`px-4 py-2 rounded-2xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'join'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>טופס הצטרפות דינמי</span>
        </button>
      </div>

      {/* TAB 1: Overview & Goals */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Progress Card */}
          <div className="lg:col-span-7 bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Target className="w-4 h-4 text-amber-500" />
                <span>מדד גיוס משאבים חי</span>
              </h3>
              <span className="text-xs font-mono font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-lg border border-amber-200">
                {percent}% מהיעד
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-black">
                <span className="text-slate-800">
                  גויסו: <strong className="font-mono text-emerald-600 text-base">₪{currentRaised.toLocaleString()}</strong>
                </span>
                <span className="text-slate-500">
                  יעד: <strong className="font-mono text-slate-800">₪{targetGoal.toLocaleString()}</strong>
                </span>
              </div>

              {/* Animated Progress Bar */}
              <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden p-0.5">
                <div
                  className="h-full bg-gradient-to-l from-emerald-500 via-teal-500 to-indigo-600 rounded-full transition-all duration-700"
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>

            {community.purpose && (
              <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4 space-y-1.5">
                <h4 className="text-xs font-black text-slate-700">מטרות הפעילות והתקציב:</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{community.purpose}</p>
              </div>
            )}

            {/* Gallery Previews */}
            {community.gallery && community.gallery.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-black text-slate-700">תמונות מהשטח והפעילות:</h4>
                <div className="grid grid-cols-3 gap-2">
                  {community.gallery.map((img, i) => (
                    <div key={i} className="aspect-video rounded-2xl overflow-hidden border border-slate-200">
                      <img src={img} alt="קהילה" className="w-full h-full object-cover hover:scale-105 transition-transform" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Ambassador & Members Sidebar */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-600" />
                <span>חברי הקהילה הרשומים</span>
              </h3>
              <div className="flex items-center justify-between bg-indigo-50/70 border border-indigo-100 p-3.5 rounded-2xl">
                <span className="text-xs font-bold text-indigo-950">סה"כ חברים מחוברים:</span>
                <span className="text-sm font-black font-mono text-indigo-700 bg-white px-2.5 py-0.5 rounded-xl shadow-2xs">
                  {contacts.length}
                </span>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {contacts.slice(0, 6).map((c) => (
                  <div key={c.id} className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-[11px]">
                        {(c.conta_name || 'א')[0]}
                      </div>
                      <span className="font-bold text-slate-800">{c.conta_name || 'איש קשר'}</span>
                    </div>
                    {c.conta_phone && (
                      <span className="text-[10px] text-slate-400 font-mono" dir="ltr">
                        {c.conta_phone}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Community Feed */}
      {activeTab === 'feed' && (
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Create Post Box */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>פרסם עדכון בלעדי לחברי הקהילה</span>
            </h3>

            <form onSubmit={handleCreatePost} className="space-y-3">
              <textarea
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                rows={3}
                placeholder="שתף עדכון, הישג מהשטח או הודעה חשובה..."
                className="w-full p-3.5 rounded-2xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:outline-none resize-none"
              />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setPostType('post')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                      postType === 'post' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>פוסט רגיל</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPostType('announcement')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                      postType === 'announcement' ? 'bg-amber-50 text-amber-800 border border-amber-200' : 'text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>הודעה נעוצה</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPostType('video')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                      postType === 'video' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    <Video className="w-3.5 h-3.5 text-rose-500" />
                    <span>וידאו</span>
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={!newPostContent.trim()}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>פרסם עדכון</span>
                </button>
              </div>
            </form>
          </div>

          {/* Posts Feed Stream */}
          <div className="space-y-4">
            {posts.map((post) => (
              <div key={post.id} className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
                      {post.authorName[0]}
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-800">{post.authorName}</h4>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(post.createdAt).toLocaleDateString('he-IL', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  {post.type === 'announcement' && (
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                      נעוץ
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">{post.content}</p>

                {post.mediaUrl && (
                  <div className="rounded-2xl overflow-hidden border border-slate-200">
                    <img src={post.mediaUrl} alt="מדיה" className="w-full max-h-72 object-cover" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Join Community Dynamic Form */}
      {activeTab === 'join' && (
        <div className="max-w-xl mx-auto bg-white border border-slate-200/90 rounded-3xl p-8 shadow-xs space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <UserPlus className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-slate-900">הצטרפות ישירה לקהילת {community.name}</h3>
            <p className="text-xs text-slate-500">
              מלא את הפרטים כדי להירשם כאיש קשר פעיל בקהילה ולקבל עדכונים שוטפים.
            </p>
          </div>

          {joinSubmitted ? (
            <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-3xl text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <h4 className="text-sm font-black text-emerald-900">ברוך הבא! נרשמת בהצלחה לקהילה</h4>
              <p className="text-xs text-emerald-800">
                פרטיך נרשמו ב-CRM תחת הקהילה ונשלח אליך עדכון בקרוב.
              </p>
              <button
                type="button"
                onClick={() => setJoinSubmitted(false)}
                className="mt-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                רשום חבר נוסף
              </button>
            </div>
          ) : (
            <form onSubmit={handleJoinCommunity} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  שם מלא <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={joinName}
                  onChange={(e) => setJoinName(e.target.value)}
                  placeholder="ישראל ישראלי"
                  className="w-full h-10 px-3.5 rounded-2xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  מספר טלפון (וואטסאפ) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={joinPhone}
                  onChange={(e) => setJoinPhone(e.target.value)}
                  placeholder="050-1234567"
                  className="w-full h-10 px-3.5 rounded-2xl border border-slate-200 text-xs font-mono focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">אימייל (אופציונלי)</label>
                <input
                  type="email"
                  value={joinEmail}
                  onChange={(e) => setJoinEmail(e.target.value)}
                  placeholder="israel@example.com"
                  className="w-full h-10 px-3.5 rounded-2xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:outline-none"
                  dir="ltr"
                />
              </div>

              <button
                type="submit"
                disabled={joining}
                className="w-full h-11 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-200 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>{joining ? 'רושם חבר...' : 'אישור והצטרפות לקהילה'}</span>
              </button>
            </form>
          )}
        </div>
      )}

      {/* TAB 4: Internal Community Chat & Video Calls */}
      {activeTab === 'chat' && (
        <CommunityChatRoomView
          community={community}
          contacts={contacts}
        />
      )}
    </div>
  );
};
