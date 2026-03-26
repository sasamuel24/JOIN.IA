'use client';

import { useState } from 'react';
import { Heart, MessageCircle, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { useCommunityFeed, usePostComments } from '@/hooks/useCommunity';
import { useCurrentUser } from '@/hooks/useCurrentUser';

interface PostWithComments {
  id: string;
  showComments: boolean;
  newComment: string;
}

export function TabFeed() {
  const [newPost, setNewPost] = useState('');
  const [expandedPosts, setExpandedPosts] = useState<Map<string, PostWithComments>>(new Map());
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  
  // Feed hooks
  const { posts, loading, error, submitting, createPost, toggleLike } = useCommunityFeed({ page: 1, page_size: 20 });
  const { comments, loading: loadingComments, submitting: submittingComment, createComment, deleteComment } = usePostComments(selectedPostId);
  const { user: currentUser } = useCurrentUser();
  const isAdmin = currentUser?.role === 'admin';

  // Handle post creation
  const handleCreatePost = async () => {
    if (!newPost.trim() || submitting) return;
    
    try {
      await createPost({ content: newPost.trim() });
      setNewPost('');
    } catch (err) {
      // Error is handled in the hook and displayed in the UI
    }
  };

  // Handle comment toggle
  const toggleComments = (postId: string) => {
    setExpandedPosts(prev => {
      const newMap = new Map(prev);
      const postData = newMap.get(postId) || { id: postId, showComments: false, newComment: '' };
      
      if (!postData.showComments) {
        // Expanding comments - set as selected post to load comments
        setSelectedPostId(postId);
        newMap.set(postId, { ...postData, showComments: true });
      } else {
        // Collapsing comments
        if (selectedPostId === postId) {
          setSelectedPostId(null);
        }
        newMap.set(postId, { ...postData, showComments: false });
      }
      
      return newMap;
    });
  };

  // Handle comment creation
  const handleCreateComment = async (postId: string) => {
    const postData = expandedPosts.get(postId);
    const commentText = postData?.newComment.trim();
    
    if (!commentText || submittingComment) return;

    try {
      await createComment({ content: commentText });
      // Clear comment input
      setExpandedPosts(prev => {
        const newMap = new Map(prev);
        const updatedPostData = newMap.get(postId);
        if (updatedPostData) {
          newMap.set(postId, { ...updatedPostData, newComment: '' });
        }
        return newMap;
      });
    } catch (err) {
      // Error is handled in the hook
    }
  };

  // Update comment input
  const updateCommentInput = (postId: string, value: string) => {
    setExpandedPosts(prev => {
      const newMap = new Map(prev);
      const postData = newMap.get(postId) || { id: postId, showComments: true, newComment: '' };
      newMap.set(postId, { ...postData, newComment: value });
      return newMap;
    });
  };

  // Loading and error states
  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-secondary">Cargando posts...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500 mb-2">Error al cargar el feed</div>
        <div className="text-secondary text-sm">{error}</div>
      </div>
    );
  }

  return (
    <div>
      {/* New post input */}
      <div className="border border-border rounded-[10px] p-4 mb-5">
        <textarea
          placeholder="Comparte algo con la comunidad"
          value={newPost}
          onChange={e => setNewPost(e.target.value)}
          disabled={submitting}
          rows={3}
          className="w-full mb-3 resize-none bg-transparent border-0 border-b-2 border-accent outline-none text-[0.9rem] text-main placeholder:text-secondary font-[family-name:var(--font-main)] leading-relaxed"
          style={{ fieldSizing: 'content' } as React.CSSProperties}
        />
        <div className="flex items-center justify-between">
          <button
            onClick={handleCreatePost}
            disabled={!newPost.trim() || submitting}
            className={cn(
              'px-4 py-1.5 rounded-md border-none text-[0.82rem] font-semibold font-[family-name:var(--font-main)] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2',
              newPost.trim() && !submitting
                ? 'bg-accent text-white cursor-pointer hover:bg-accent-dark'
                : 'bg-surface-2 text-secondary cursor-not-allowed'
            )}
          >
            {submitting ? 'Publicando...' : 'Publicar'}
          </button>
        </div>
      </div>

      {/* Error message for post creation */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
          <div className="text-red-600 text-sm">{error}</div>
        </div>
      )}

      {/* Posts list */}
      <div className="flex flex-col gap-4">
        {posts.length === 0 ? (
          <div className="text-center py-8 text-secondary">
            <div className="mb-2">No hay posts aún</div>
            <div className="text-sm">¡Sé el primero en compartir algo con la comunidad!</div>
          </div>
        ) : (
          posts.map(post => {
            const postData = expandedPosts.get(post.id);
            const showComments = postData?.showComments || false;
            const newComment = postData?.newComment || '';
            const isSelectedPost = selectedPostId === post.id;

            return (
              <div
                key={post.id}
                className="border border-border rounded-[10px] p-4"
              >
                {/* Author */}
                <div className="flex items-center gap-2.5 mb-2.5">
                  <Avatar name={post.author.name} src={post.author.avatar_url} size="sm" />
                  <div className="flex-1">
                    <span className="text-[0.85rem] font-semibold text-main">
                      {post.author.name}
                    </span>
                    <span className="text-xs text-secondary ml-2">
                      {post.author.role}
                    </span>
                  </div>
                  <span className="text-[0.72rem] text-secondary">
                    {post.time}
                  </span>
                </div>

                {/* Content */}
                <p className="text-[0.9rem] text-main leading-relaxed mb-3 whitespace-pre-wrap">
                  {post.content}
                </p>

                {/* Actions */}
                <div className="flex gap-4 mb-3">
                  <button
                    onClick={() => toggleLike(post.id)}
                    aria-label={post.is_liked_by_me ? 'Quitar me gusta' : 'Me gusta'}
                    className={cn(
                      'flex items-center gap-1 bg-transparent border-none text-[0.8rem] font-[family-name:var(--font-main)] cursor-pointer transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 rounded-sm',
                      post.is_liked_by_me ? 'text-red-500 hover:text-red-400' : 'text-secondary hover:text-main'
                    )}
                  >
                    <Heart
                      size={14}
                      className={post.is_liked_by_me ? 'fill-current' : ''}
                    />
                    {post.likes_count > 0 && (
                      <span className="text-xs">{post.likes_count}</span>
                    )}
                  </button>
                  <button
                    onClick={() => toggleComments(post.id)}
                    aria-label={`Comentarios, ${post.comments_count}`}
                    className="flex items-center gap-1 bg-transparent border-none text-secondary text-[0.8rem] font-[family-name:var(--font-main)] cursor-pointer hover:text-main transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 rounded-sm"
                  >
                    <MessageCircle size={14} />
                    {post.comments_count}
                    {showComments ? (
                      <ChevronUp size={12} className="ml-1" />
                    ) : (
                      <ChevronDown size={12} className="ml-1" />
                    )}
                  </button>
                </div>

                {/* Comments section */}
                {showComments && (
                  <div className="border-t border-border pt-3 mt-3">
                    {/* Comments list */}
                    {loadingComments && isSelectedPost ? (
                      <div className="text-secondary text-sm mb-3">Cargando comentarios...</div>
                    ) : (
                      <div className="mb-3">
                        {comments.length === 0 ? (
                          <div className="text-secondary text-sm">No hay comentarios aún</div>
                        ) : (
                          <div className="space-y-3">
                            {comments.map(comment => (
                              <div key={comment.id} className="flex gap-2 group">
                                <Avatar name={comment.author.name} src={comment.author.avatar_url} size="sm" />
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-[0.8rem] font-semibold text-main">
                                      {comment.author.name}
                                    </span>
                                    <span className="text-[0.7rem] text-secondary">
                                      {comment.author.role}
                                    </span>
                                    <span className="text-[0.7rem] text-secondary">
                                      {comment.time}
                                    </span>
                                    {isAdmin && (
                                      <button
                                        onClick={() => deleteComment(comment.id)}
                                        aria-label="Eliminar comentario"
                                        className="ml-auto opacity-0 group-hover:opacity-100 bg-transparent border-none cursor-pointer text-secondary hover:text-red-500 transition-all duration-150 focus-visible:outline-none focus-visible:opacity-100"
                                      >
                                        <Trash2 size={12} />
                                      </button>
                                    )}
                                  </div>
                                  <p className="text-[0.85rem] text-main">
                                    {comment.content}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* New comment input */}
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        placeholder="Escribe un comentario..."
                        value={newComment}
                        onChange={e => updateCommentInput(post.id, e.target.value)}
                        className="text-sm"
                        disabled={submittingComment}
                        onKeyDown={e => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleCreateComment(post.id);
                          }
                        }}
                      />
                      <button
                        onClick={() => handleCreateComment(post.id)}
                        disabled={!newComment.trim() || submittingComment}
                        className={cn(
                          'px-3 py-1.5 rounded-md border-none text-[0.8rem] font-semibold transition-colors duration-150',
                          newComment.trim() && !submittingComment
                            ? 'bg-accent text-white hover:bg-accent-dark'
                            : 'bg-surface-2 text-secondary cursor-not-allowed'
                        )}
                      >
                        {submittingComment ? '...' : 'Enviar'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
