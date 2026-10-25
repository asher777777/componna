import React, { useState } from 'react';
import { useKosTime } from '../context/KosTimeContext';
import { useSystemConnection } from '../../../core/connection/SystemConnectionContext';
import { Navbar } from '../components/Navbar';
import { BottomNav } from '../components/BottomNav';
import { SwipeHomeScreen } from '../components/SwipeHomeScreen';
import { TodayScreen } from '../components/TodayScreen';
import { InboxScreen } from '../components/InboxScreen';
import { DecomposeScreen } from '../components/DecomposeScreen';
import { BrainstormScreen } from '../components/BrainstormScreen';
import { EveningRitualModal } from '../components/EveningRitualModal';
import { QuickCaptureModal } from '../components/QuickCaptureModal';
import { RuleOf3WarningModal } from '../components/RuleOf3WarningModal';
import { InstallAppModal } from '../components/InstallAppModal';
import { ActiveScreen, InboxItem, Task } from '../types';
import { Loader2 } from 'lucide-react';

export const KosTimeMainView: React.FC = () => {
  const { auth } = useSystemConnection();
  const user = auth?.currentUser || null;

  const {
    todayTasks,
    inbox,
    microTasks,
    loading: tasksLoading,
    soundEnabled,
    setSoundEnabled,
    attemptedTask,
    clearAttemptedTask,
    addTodayTask,
    replaceTodayTask,
    toggleCompleteTodayTask,
    deleteTodayTask,
    addInboxItem,
    deleteInboxItem,
    saveDecomposition,
    promoteMicroTaskToToday,
    scheduleMicroTaskForTomorrow,
    moveTaskToInbox,
    applyTomorrowBig3,
  } = useKosTime();

  const [activeScreen, setActiveScreen] = useState<ActiveScreen>('home');
  const [isQuickCaptureOpen, setIsQuickCaptureOpen] = useState(false);
  const [isEveningRitualOpen, setIsEveningRitualOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [selectedInboxForDecompose, setSelectedInboxForDecompose] = useState<InboxItem | null>(null);

  const completedCount = todayTasks.filter((t) => t.completed).length;

  const handleSelectInboxForDecomposition = (item: InboxItem) => {
    setSelectedInboxForDecompose(item);
    setActiveScreen('decompose');
  };

  const handlePostponeTaskToTomorrow = async (task: Task) => {
    await scheduleMicroTaskForTomorrow(task.id);
    await deleteTodayTask(task.id);
  };

  const logOut = () => {
    auth?.signOut();
  };

  return (
    <div className="min-h-screen bg-[#070913] text-[#F0F4FF] font-sans selection:bg-[#00F0FF]/30 selection:text-[#00F0FF] relative" dir="rtl">
      {/* Top Sticky Header only shown on sub-screens */}
      {activeScreen !== 'home' && (
        <Navbar
          completedCount={completedCount}
          totalCount={todayTasks.length}
          soundEnabled={soundEnabled}
          onToggleSound={() => setSoundEnabled(!soundEnabled)}
          onStartRitual={() => setIsEveningRitualOpen(true)}
          user={user as any}
          onLogOut={logOut}
          onOpenInstallModal={() => setIsInstallModalOpen(true)}
          showBackHome={true}
          onNavigateHome={() => setActiveScreen('home')}
        />
      )}

      {/* Main Content Area */}
      <main className={activeScreen === 'home' ? 'w-full' : 'max-w-2xl mx-auto px-4 pt-4 pb-24'}>
        {tasksLoading ? (
          <div className="py-24 flex flex-col items-center justify-center text-[#F0F4FF]/60">
            <Loader2 className="w-8 h-8 animate-spin mb-3 text-[#00F0FF]" />
            <span className="text-sm font-semibold">מסנכרן נכסים ומשימות מאובטחות...</span>
          </div>
        ) : (
          <>
            {activeScreen === 'home' && (
              <SwipeHomeScreen
                todayTasks={todayTasks}
                inboxItems={inbox}
                onNavigateToToday={() => setActiveScreen('today')}
                onNavigateToInbox={() => setActiveScreen('inbox')}
                onNavigateToRitual={() => setIsEveningRitualOpen(true)}
                onOpenBrainstorm={() => setActiveScreen('brainstorm')}
                onOpenQuickCapture={() => setIsQuickCaptureOpen(true)}
                onOpenInstallModal={() => setIsInstallModalOpen(true)}
              />
            )}

            {activeScreen === 'today' && (
              <TodayScreen
                tasks={todayTasks}
                availableMicroTasks={microTasks}
                onToggleComplete={toggleCompleteTodayTask}
                onAddTask={(title, mins) => addTodayTask(title, mins)}
                onDeleteTask={deleteTodayTask}
                onPromoteMicroTask={promoteMicroTaskToToday}
                onOpenEveningRitual={() => setIsEveningRitualOpen(true)}
                onGoToInbox={() => setActiveScreen('inbox')}
                onGoToDecompose={() => setActiveScreen('decompose')}
              />
            )}

            {activeScreen === 'inbox' && (
              <InboxScreen
                items={inbox}
                onAddItem={(title, note) => addInboxItem(title, note)}
                onDeleteItem={deleteInboxItem}
                onSelectForDecomposition={handleSelectInboxForDecomposition}
                onPromoteToToday={(title) => addTodayTask(title)}
                onOpenBrainstorm={() => setActiveScreen('brainstorm')}
              />
            )}

            {activeScreen === 'brainstorm' && (
              <BrainstormScreen
                todayTasks={todayTasks}
                inboxItems={inbox}
                onAddToInbox={(title, note) => addInboxItem(title, note)}
                onAddToToday={(title) => addTodayTask(title)}
                onSendToDecompose={(title) => {
                  const item: InboxItem = {
                    id: 'temp_' + Date.now(),
                    title,
                    decomposed: false,
                    createdAt: new Date().toISOString(),
                  };
                  handleSelectInboxForDecomposition(item);
                }}
              />
            )}

            {activeScreen === 'decompose' && (
              <DecomposeScreen
                selectedItem={selectedInboxForDecompose}
                inboxItems={inbox}
                onSelectAnotherItem={(item) => setSelectedInboxForDecompose(item)}
                onSaveSubtasks={(inboxId, subtasks) => {
                  saveDecomposition(inboxId, subtasks);
                }}
                onGoToToday={() => setActiveScreen('today')}
              />
            )}

            {activeScreen === 'ritual' && (
              <div className="py-8 text-center space-y-4 bg-[#0D0E1F] p-6 rounded-3xl border border-[#1A2B4C] shadow-lg">
                <div className="w-12 h-12 rounded-2xl bg-[#00F0FF]/10 text-[#00F0FF] flex items-center justify-center mx-auto">
                  <span className="text-2xl">🌙</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#F0F4FF]">
                    טקס נעילת יום (Evening Ritual)
                  </h3>
                  <p className="text-xs text-[#F0F4FF]/60 max-w-sm mx-auto mt-1 leading-relaxed">
                    סגור את נכסי היום, נקה את תיק הנכסים ובחר בדיוק 3 משימות מפתח למחר לקראת שינה שלווה.
                  </p>
                </div>
                <button
                  onClick={() => setIsEveningRitualOpen(true)}
                  className="px-5 py-2.5 bg-[#00F0FF] hover:bg-[#00F0FF]/90 text-[#070913] rounded-xl text-xs font-bold transition-all shadow-[0_0_15px_rgba(0,240,255,0.4)] cursor-pointer"
                >
                  התחל עכשיו את טקס הערב
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Quick Capture Modal */}
      <QuickCaptureModal
        isOpen={isQuickCaptureOpen}
        onClose={() => setIsQuickCaptureOpen(false)}
        onSaveToInbox={(title, note) => addInboxItem(title, note)}
      />

      {/* Strict Rule of 3 Warning Modal */}
      <RuleOf3WarningModal
        attemptedTask={attemptedTask}
        currentTasks={todayTasks}
        onClose={clearAttemptedTask}
        onReplaceTask={(oldId, newTitle, mins) => replaceTodayTask(oldId, newTitle, mins)}
        onPostponeToTomorrow={(title, mins) => {
          addInboxItem(title, `נדחה למחר (${mins || 25} דקות)`);
          clearAttemptedTask();
        }}
        onSaveToInbox={(title) => {
          addInboxItem(title, 'נשמר בעקבות חוק ה-3');
          clearAttemptedTask();
        }}
      />

      {/* Guided Evening Ritual Modal */}
      <EveningRitualModal
        isOpen={isEveningRitualOpen}
        onClose={() => {
          setIsEveningRitualOpen(false);
          if (activeScreen === 'ritual') {
            setActiveScreen('home');
          }
        }}
        todayTasks={todayTasks}
        inboxItems={inbox}
        availableMicroTasks={microTasks}
        onToggleCompleteTodayTask={toggleCompleteTodayTask}
        onPostponeTaskToTomorrow={handlePostponeTaskToTomorrow}
        onSendTaskToInbox={moveTaskToInbox}
        onDeleteTask={deleteTodayTask}
        onApplyTomorrowBig3={applyTomorrowBig3}
        onOpenDecomposeForInboxItem={handleSelectInboxForDecomposition}
      />

      {/* App / APK Install Modal */}
      <InstallAppModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
      />

      {/* Bottom Navigation */}
      {activeScreen !== 'home' && (
        <BottomNav
          activeScreen={activeScreen}
          onSelectScreen={(screen) => setActiveScreen(screen)}
          onOpenQuickCapture={() => setIsQuickCaptureOpen(true)}
          inboxCount={inbox.filter((i) => !i.decomposed).length}
        />
      )}
    </div>
  );
};
