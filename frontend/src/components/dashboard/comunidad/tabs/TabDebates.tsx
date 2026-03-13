'use client';

import { useState } from 'react';
import { MessageSquare, Users, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { useCommunityDebates, useDebateReplies } from '@/hooks/useCommunity';

interface DebateWithReplies {
  id: string;
  showReplies: boolean;
  newReply: string;
}

export function TabDebates() {
  const [expandedDebates, setExpandedDebates] = useState<Map<string, DebateWithReplies>>(new Map());
  const [selectedDebateId, setSelectedDebateId] = useState<string | null>(null);
  
  // Debates hooks
  const { debates, total, loading, error } = useCommunityDebates({ page: 1, page_size: 20 });
  const { replies, loading: loadingReplies, submitting: submittingReply, createReply } = useDebateReplies(selectedDebateId);

  // Handle replies toggle
  const toggleReplies = (debateId: string) => {
    setExpandedDebates(prev => {
      const newMap = new Map(prev);
      const debateData = newMap.get(debateId) || { id: debateId, showReplies: false, newReply: '' };
      
      if (!debateData.showReplies) {
        // Expanding replies - set as selected debate to load replies
        setSelectedDebateId(debateId);
        newMap.set(debateId, { ...debateData, showReplies: true });
      } else {
        // Collapsing replies
        if (selectedDebateId === debateId) {
          setSelectedDebateId(null);
        }
        newMap.set(debateId, { ...debateData, showReplies: false });
      }
      
      return newMap;
    });
  };

  // Handle reply creation
  const handleCreateReply = async (debateId: string) => {
    const debateData = expandedDebates.get(debateId);
    const replyText = debateData?.newReply.trim();
    
    if (!replyText || submittingReply) return;

    try {
      await createReply({ content: replyText });
      // Clear reply input
      setExpandedDebates(prev => {
        const newMap = new Map(prev);
        const updatedDebateData = newMap.get(debateId);
        if (updatedDebateData) {
          newMap.set(debateId, { ...updatedDebateData, newReply: '' });
        }
        return newMap;
      });
    } catch (err) {
      // Error is handled in the hook
    }
  };

  // Update reply input
  const updateReplyInput = (debateId: string, value: string) => {
    setExpandedDebates(prev => {
      const newMap = new Map(prev);
      const debateData = newMap.get(debateId) || { id: debateId, showReplies: true, newReply: '' };
      newMap.set(debateId, { ...debateData, newReply: value });
      return newMap;
    });
  };

  // Loading and error states
  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-secondary">Cargando debates...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500 mb-2">Error al cargar debates</div>
        <div className="text-secondary text-sm">{error}</div>
      </div>
    );
  }

  return (
    <div>
      <p className="text-[0.85rem] text-secondary mb-4">
        {total} debates activos
      </p>

      <div className="flex flex-col gap-2">
        {debates.length === 0 ? (
          <div className="text-center py-8 text-secondary">
            <div className="mb-2">No hay debates aún</div>
            <div className="text-sm">Los debates aparecerán aquí cuando estén disponibles</div>
          </div>
        ) : (
          debates.map(debate => {
            const debateData = expandedDebates.get(debate.id);
            const showReplies = debateData?.showReplies || false;
            const newReply = debateData?.newReply || '';
            const isSelectedDebate = selectedDebateId === debate.id;

            return (
              <div
                key={debate.id}
                className="border border-border rounded-[10px] px-5 py-4 transition-colors duration-150 hover:border-accent-glow hover:bg-surface-1"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[0.68rem] font-semibold text-accent bg-accent-light px-2 py-0.5 rounded-full">
                        {debate.category}
                      </span>
                      <span className="text-[0.72rem] text-secondary">
                        {debate.lastActivity}
                      </span>
                    </div>
                    <p className="text-[0.92rem] font-semibold text-main leading-snug mb-2">
                      {debate.title}
                    </p>
                    
                    {/* Debate content preview */}
                    <p className="text-[0.8rem] text-secondary leading-relaxed mb-3 line-clamp-2">
                      {debate.content}
                    </p>
                    
                    {/* Author info */}
                    <div className="flex items-center gap-2 mb-3">
                      <Avatar name={debate.author.name} size="sm" />
                      <span className="text-[0.8rem] font-semibold text-main">
                        {debate.author.name}
                      </span>
                      <span className="text-[0.75rem] text-secondary">
                        {debate.author.role}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-3 shrink-0 items-center">
                    <button
                      onClick={() => toggleReplies(debate.id)}
                      className="flex items-center gap-1 text-[0.78rem] text-secondary hover:text-main transition-colors cursor-pointer"
                    >
                      <MessageSquare size={13} />
                      {debate.replies_count}
                      {showReplies ? (
                        <ChevronUp size={12} className="ml-1" />
                      ) : (
                        <ChevronDown size={12} className="ml-1" />
                      )}
                    </button>
                    <span className="flex items-center gap-1 text-[0.78rem] text-secondary">
                      <Users size={13} />
                      {debate.participants_count}
                    </span>
                  </div>
                </div>

                {/* Replies section */}
                {showReplies && (
                  <div className="border-t border-border pt-4 mt-4">
                    {/* Replies list */}
                    {loadingReplies && isSelectedDebate ? (
                      <div className="text-secondary text-sm mb-4">Cargando respuestas...</div>
                    ) : (
                      <div className="mb-4">
                        {replies.length === 0 ? (
                          <div className="text-secondary text-sm">No hay respuestas aún</div>
                        ) : (
                          <div className="space-y-4">
                            {replies.map(reply => (
                              <div key={reply.id} className="flex gap-3">
                                <Avatar name={reply.author.name} size="sm" />
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className="text-[0.8rem] font-semibold text-main">
                                      {reply.author.name}
                                    </span>
                                    <span className="text-[0.75rem] text-secondary">
                                      {reply.author.role}
                                    </span>
                                    <span className="text-[0.75rem] text-secondary">
                                      {reply.time}
                                    </span>
                                  </div>
                                  <p className="text-[0.85rem] text-main leading-relaxed">
                                    {reply.content}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* New reply input */}
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <Input
                          type="text"
                          placeholder="Escribe tu respuesta..."
                          value={newReply}
                          onChange={e => updateReplyInput(debate.id, e.target.value)}
                          className="text-sm"
                          disabled={submittingReply}
                          onKeyDown={e => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleCreateReply(debate.id);
                            }
                          }}
                        />
                      </div>
                      <button
                        onClick={() => handleCreateReply(debate.id)}
                        disabled={!newReply.trim() || submittingReply}
                        className={cn(
                          'px-4 py-2 rounded-md border-none text-[0.8rem] font-semibold transition-colors duration-150',
                          newReply.trim() && !submittingReply
                            ? 'bg-accent text-white hover:bg-accent-dark'
                            : 'bg-surface-2 text-secondary cursor-not-allowed'
                        )}
                      >
                        {submittingReply ? 'Enviando...' : 'Responder'}
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
