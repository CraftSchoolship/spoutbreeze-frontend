'use client';

import React, { useState } from 'react';
import { getJoinUrlWithName } from '@/actions/events';
import { useParams, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const JoinEventPage: React.FC = () => {
  const params = useParams();
  const searchParams = useSearchParams();
  
  const eventId = params.eventId as string;
  const role = (searchParams.get('role') as 'attendee' | 'moderator') || 'attendee';
  
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleJoinEvent = async () => {
    if (!fullName.trim()) {
      setError('Please enter your full name');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const joinUrl = await getJoinUrlWithName(eventId, fullName.trim(), role);
      if (joinUrl) {
        window.location.href = joinUrl;
      } else {
        setError('Failed to get join URL');
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      if (error.message === 'EVENT_NOT_FOUND') {
        setError('Event not found');
      } else if (error.message === 'EVENT_NOT_STARTED') {
        setError('Event has not started yet');
      } else {
        setError('Failed to join event. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center gradient-bg px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-sky-200/40 to-teal-200/40 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-blue-200/30 to-cyan-200/30 rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative max-w-md w-full">
        <div className="bg-white rounded-3xl shadow-xl shadow-sky-100/50 border border-sky-100 p-8 sm:p-10">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <Image
                src="/bluescale_logo.png"
                alt="BlueScale"
                width={64}
                height={64}
                className="object-contain"
              />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">
              Join Event
            </h2>
            <p className="text-slate-500">
              Enter your name to join as {role === 'moderator' ? 'a moderator' : 'an attendee'}
            </p>
          </div>
          
          <div className="space-y-6">
            <TextField
              id="fullName"
              label="Full Name"
              variant="outlined"
              fullWidth
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={isLoading}
              error={!!error && !fullName.trim()}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  '&:hover fieldset': {
                    borderColor: '#0ea5e9',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#0ea5e9',
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#0ea5e9',
                },
              }}
            />
            
            {error && (
              <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}
            
            <Button
              fullWidth
              variant="contained"
              size="large"
              endIcon={!isLoading && <ArrowForwardIcon />}
              onClick={handleJoinEvent}
              disabled={isLoading || !fullName.trim()}
              sx={{
                background: 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)',
                padding: '14px 24px',
                fontSize: '16px',
                fontWeight: 600,
                borderRadius: '12px',
                boxShadow: '0 4px 14px rgba(14, 165, 233, 0.35)',
                textTransform: 'none',
                '&:hover': {
                  background: 'linear-gradient(135deg, #0284c7 0%, #0891b2 100%)',
                  boxShadow: '0 6px 20px rgba(14, 165, 233, 0.45)',
                },
                '&.Mui-disabled': {
                  background: '#e2e8f0',
                  color: '#94a3b8',
                },
              }}
            >
              {isLoading ? 'Joining...' : 'Join Meeting'}
            </Button>
          </div>
          
          <p className="text-center text-xs text-slate-400 mt-6">
            Powered by <span className="font-semibold text-sky-500">BlueScale</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default JoinEventPage;
