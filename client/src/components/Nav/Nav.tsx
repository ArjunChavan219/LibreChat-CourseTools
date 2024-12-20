import { useCallback, useEffect, useState, useMemo, memo } from 'react';
import { useRecoilValue } from 'recoil';
import { useParams, useNavigate } from 'react-router-dom';
import { PermissionTypes, Permissions } from 'librechat-data-provider';
import type { ConversationListResponse } from 'librechat-data-provider';
import {
  useLocalize,
  useHasAccess,
  useMediaQuery,
  useAuthContext,
  useConversation,
  useLocalStorage,
  useNavScrolling,
  useConversations,
} from '~/hooks';
import { useConversationsInfiniteQuery, useStudentConversationsInfiniteQuery } from '~/data-provider';
import { TooltipProvider, Tooltip } from '~/components/ui';
import { Conversations } from '~/components/Conversations';
import BookmarkNav from './Bookmarks/BookmarkNav';
import AccountSettings from './AccountSettings';
import { useSearchContext } from '~/Providers';
import { Spinner } from '~/components/svg';
import SearchBar from './SearchBar';
import NavToggle from './NavToggle';
import NewChat from './NewChat';
import { cn } from '~/utils';
import store from '~/store';

import StudentCourseCards from '../CourseTools/Students/StudentCourseCards';
import CourseCards from '../CourseTools/Professor/CourseCards';

const Nav = ({
  navVisible,
  setNavVisible,
}: {
  navVisible: boolean;
  setNavVisible: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const { user, courseId, isAuthenticated, studentId, setCourseId, isTACourse, setIsTACourse, studentName } = useAuthContext();
  const course = courseId || "1";
  const isStudent = user?.profileRole === "Student" || (user?.profileRole === "TA" && !isTACourse);
  
  const localize = useLocalize();
  const { conversationId } = useParams();
  const navigate = useNavigate();

  const [navWidth, setNavWidth] = useState('260px');
  const [isHovering, setIsHovering] = useState(false);
  const isSmallScreen = useMediaQuery('(max-width: 768px)');
  const [newUser, setNewUser] = useLocalStorage('newUser', true);
  const [isToggleHovering, setIsToggleHovering] = useState(false);

  const hasAccessToBookmarks = useHasAccess({
    permissionType: PermissionTypes.BOOKMARKS,
    permission: Permissions.USE,
  });

  const handleMouseEnter = useCallback(() => {
    setIsHovering(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovering(false);
  }, []);

  useEffect(() => {
    if (isSmallScreen) {
      const savedNavVisible = localStorage.getItem('navVisible');
      if (savedNavVisible === null) {
        toggleNavVisible();
      }
      setNavWidth('320px');
    } else {
      setNavWidth('260px');
    }
  }, [isSmallScreen]);

  const { newConversation } = useConversation();
  const [showLoading, setShowLoading] = useState(false);
  const isSearchEnabled = useRecoilValue(store.isSearchEnabled);

  const { refreshConversations } = useConversations();
  const { pageNumber, searchQuery, setPageNumber, searchQueryRes } = useSearchContext();
  const [tags, setTags] = useState<string[]>([]);
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } = studentId ?
    useStudentConversationsInfiniteQuery(
      {
        studentId,
        pageNumber: pageNumber.toString(),
        courseId: course,
        isArchived: false,
        tags: tags.length === 0 ? undefined : tags,
      },
      { enabled: isAuthenticated },
    ) :
    useConversationsInfiniteQuery(
      {
        pageNumber: pageNumber.toString(),
        courseId: course,
        isArchived: false,
        tags: tags.length === 0 ? undefined : tags,
      },
      { enabled: isAuthenticated },
    );
  useEffect(() => {
    // When a tag is selected, refetch the list of conversations related to that tag
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tags, courseId, studentId]);
  const { containerRef, moveToTop } = useNavScrolling<ConversationListResponse>({
    setShowLoading,
    hasNextPage: searchQuery ? searchQueryRes?.hasNextPage : hasNextPage,
    fetchNextPage: searchQuery ? searchQueryRes?.fetchNextPage : fetchNextPage,
    isFetchingNextPage: searchQuery
      ? searchQueryRes?.isFetchingNextPage ?? false
      : isFetchingNextPage,
  });

  const conversations = useMemo(
    () => (searchQuery ? searchQueryRes?.data : data)?.pages.flatMap((page) => page.conversations) ||
      [],
    [data, searchQuery, searchQueryRes?.data],
  );

  const clearSearch = () => {
    setPageNumber(1);
    refreshConversations();
    if (conversationId == 'search') {
      newConversation();
    }
  };

  const toggleNavVisible = () => {
    setNavVisible((prev: boolean) => {
      localStorage.setItem('navVisible', JSON.stringify(!prev));
      return !prev;
    });
    if (newUser) {
      setNewUser(false);
    }
  };

  const itemToggleNav = () => {
    if (isSmallScreen) {
      toggleNavVisible();
    }
  };

  const handleDashboardClick = () => {
    setCourseId(undefined);
    setIsTACourse(false);
    navigate('/c/new', { replace: true });
    
  }

  return (
    <TooltipProvider delayDuration={250}>
      <Tooltip>
        <div
          data-testid="nav"
          className={
            'nav active max-w-[320px] flex-shrink-0 overflow-x-hidden bg-surface-primary-alt md:max-w-[260px]'
          }
          style={{
            width: navVisible ? navWidth : '0px',
            visibility: navVisible ? 'visible' : 'hidden',
            transition: 'width 0.2s, visibility 0.2s',
          }}
        >
          <div className="h-full w-[320px] md:w-[260px]">
            <div className="flex h-full min-h-0 flex-col">
              <div
                className={cn(
                  'flex h-full min-h-0 flex-col transition-opacity',
                  isToggleHovering && !isSmallScreen ? 'opacity-50' : 'opacity-100',
                )}
              >
                <div
                  className={cn(
                    'scrollbar-trigger relative h-full w-full flex-1 items-start border-white/20',
                  )}
                >
                  <nav
                    id="chat-history-nav"
                    aria-label={localize('com_ui_chat_history')}
                    className="flex h-full w-full flex-col px-3 pb-3.5"
                  >
                    <div
                      className={cn(
                        '-mr-2 flex-1 flex-col overflow-y-auto pr-2 transition-opacity duration-500',
                        isHovering ? '' : 'scrollbar-transparent',
                      )}
                      onMouseEnter={handleMouseEnter}
                      onMouseLeave={handleMouseLeave}
                      ref={containerRef}
                    >
                      {isSmallScreen == true ? (
                        <div className="pt-3.5">
                          {isSearchEnabled === true && (
                            <SearchBar clearSearch={clearSearch} isSmallScreen={isSmallScreen} />
                          )}
                          {hasAccessToBookmarks === true && (
                            <BookmarkNav tags={tags} setTags={setTags} />
                          )}
                        </div>) : (<div
                          style={{
                            backgroundColor: '#f8f8f8',
                            color: '#333',
                            textAlign: 'left',
                            width: '100%',
                            padding: '16px',
                            cursor: 'pointer',
                            borderBottom: '1px solid #ccc',
                            fontSize: '18px',
                            fontFamily: 'Arial, sans-serif'
                        }}
                          onClick={handleDashboardClick}
                      >
                          Dashboard
                      </div>)
                      }
                      {courseId ? <p style={{
                            color: '#333',
                            fontSize: '16px',
                            fontFamily: 'Arial, sans-serif',
                            padding: '16px',
                            borderBottom: '1px solid #ccc',
                            marginBottom: '16px'
                        }}>{`Course ID ${courseId} Chats`}</p> :
                        (isStudent ? <StudentCourseCards isNav={true}/> : <CourseCards isNav={true}/>)
                      }
                      
                      {!isStudent && courseId && <button onClick={() => navigate('/c/new', { replace: true })} style={{
                            backgroundColor: '#f8f8f8',
                            color: '#333',
                            border: '1px solid #ccc',
                            padding: '10px 20px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '16px',
                            fontFamily: 'Arial, sans-serif',
                            display: 'block',
                            width: 'calc(100% - 40px)',
                            textAlign: 'center',
                            marginBottom: '16px'
                        }}>Roster</button>}
                      
                      {!isStudent && courseId && !studentId && <><p style={{
                              color: '#666',
                              fontSize: '16px',
                              fontFamily: 'Arial, sans-serif',
                              padding: '16px',
                              marginBottom: '16px'
                          }}>{`No Student selected`}</p></>}
                      
                      {!isStudent && courseId && studentId && <><p style={{
                              color: '#666',
                              fontSize: '16px',
                              fontFamily: 'Arial, sans-serif',
                              padding: '16px',
                              marginBottom: '16px'
                          }}>{`Chats of ${studentName}`}</p></>}
                      {isStudent && !isTACourse && courseId && <NewChat
                          toggleNav={itemToggleNav}
                          subHeaders={
                            <>
                              {isSearchEnabled === true && (
                                <SearchBar
                                  clearSearch={clearSearch}
                                  isSmallScreen={isSmallScreen}
                                />
                              )}
                              {hasAccessToBookmarks === true && (
                                <BookmarkNav tags={tags} setTags={setTags} />
                              )}
                            </>
                          }/>}

                      {((isStudent && !isTACourse && courseId) || ((!isStudent || isTACourse) && courseId && studentId)) &&
                        <Conversations
                          conversations={conversations}
                          moveToTop={moveToTop}
                          toggleNav={itemToggleNav}
                        />
                      }
                      {(isFetchingNextPage || showLoading) && (
                        <Spinner className={cn('m-1 mx-auto mb-4 h-4 w-4 text-text-primary')} />
                      )}
                    </div>
                    <AccountSettings />
                  </nav>
                </div>
              </div>
            </div>
          </div>
        </div>
        <NavToggle
          isHovering={isToggleHovering}
          setIsHovering={setIsToggleHovering}
          onToggle={toggleNavVisible}
          navVisible={navVisible}
          className="fixed left-0 top-1/2 z-40 hidden md:flex"
        />
        <div
          role="button"
          tabIndex={0}
          className={`nav-mask ${navVisible ? 'active' : ''}`}
          onClick={toggleNavVisible}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              toggleNavVisible();
            }
          }}
          aria-label="Toggle navigation"
        />
      </Tooltip>
    </TooltipProvider>
  );
};

export default memo(Nav);
