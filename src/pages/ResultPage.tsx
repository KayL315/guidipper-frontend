import React, { useEffect, useMemo, useState } from 'react';
import Layout from '../components/Layout';
import ChatBox from '../components/ChatBox';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { ChatSession } from '../types/chat';
const API = process.env.REACT_APP_API_URL;

interface PendingDiff {
  messageId: number;
  diffContent: string;
  chatMessage: string;
}

function Spinner({ label = 'Loading...' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-10">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
      <p className="mt-3 text-sm text-gray-600">{label}</p>
    </div>
  );
}

function DiffViewer({ diff, onApprove, onReject }: {
  diff: string;
  onApprove: () => void;
  onReject: () => void;
}) {
  const lines = diff.split('\n');
  return (
    <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold mb-4 text-gray-800">Proposed Changes</h3>
      <div className="bg-gray-50 border border-gray-200 rounded p-4">
        <div className="bg-white rounded p-3 font-mono text-sm overflow-x-auto max-h-96 overflow-y-auto">
          {lines.map((line, idx) => {
            let className = 'block';
            if (line.startsWith('---') || line.startsWith('+++') || line.startsWith('@@')) {
              className += ' text-gray-500 font-semibold';
            } else if (line.startsWith('+')) {
              className += ' text-green-600 bg-green-50';
            } else if (line.startsWith('-')) {
              className += ' text-red-600 bg-red-50 line-through';
            }
            return <div key={idx} className={className}>{line}</div>;
          })}
        </div>
        <div className="mt-4 flex gap-2">
          <button
            onClick={onApprove}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
          >
            Approve Changes
          </button>
          <button
            onClick={onReject}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 text-sm"
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  );
}

function ResultPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [routeText, setRouteText] = useState('');
  const [isLoadingRoute, setIsLoadingRoute] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [chatSession, setChatSession] = useState<ChatSession | null>(null);
  const [generatedRouteId, setGeneratedRouteId] = useState<number | null>(null);
  const [pendingDiff, setPendingDiff] = useState<PendingDiff | null>(null);

  const token = localStorage.getItem('auth_token');

  const generatedRoute = useMemo(() => {
    const st: any = location.state;
    return st?.generatedRoute ?? '';
  }, [location.state]);

  const routeId = useMemo(() => {
    const st: any = location.state;
    return st?.generatedRouteId ?? null;
  }, [location.state]);

  useEffect(() => {
    setIsLoadingRoute(true);

    if (generatedRoute) {
      setRouteText(generatedRoute);
      setGeneratedRouteId(routeId);
      setIsLoadingRoute(false);
      return;
    }

    setRouteText('');
    setIsLoadingRoute(false);
  }, [generatedRoute, routeId]);

  const handleRouteUpdate = (newRouteText: string) => {
    setRouteText(newRouteText);
  };

  const handleBack = () => {
    navigate('/preferences');
  };

  const handleSave = async () => {
    if (!routeText.trim()) {
      alert('No route to save. Please generate a route first.');
      return;
    }

    try {
      setIsSaving(true);
      const res = await axios.post(
        `${API}/save-route`,
        { route_text: routeText },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // 保存成功后记录 ID，解锁 Chat
      if (res.data?.id) {
        setGeneratedRouteId(res.data.id);
      }
      alert('Route saved successfully!');
    } catch (err) {
      console.error('Failed to save route:', err);
      alert('Failed to save route.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleApproveDiff = async () => {
    if (!pendingDiff || !chatSession) return;

    try {
      const response = await axios.post(
        `${API}/chat/sessions/${chatSession.id}/messages/${pendingDiff.messageId}/apply-diff`,
        { route_text: routeText },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setRouteText(response.data.updated_route_text);
      setPendingDiff(null);
      alert('Changes applied successfully!');
    } catch (err) {
      console.error('Failed to apply diff:', err);
      alert('Failed to apply changes. Please try again.');
    }
  };

  const handleRejectDiff = () => {
    setPendingDiff(null);
  };

  return (
    <Layout>
      <div className="min-h-screen px-6 py-10 flex flex-col items-center">
        <div className="w-full max-w-6xl bg-white/80 backdrop-blur-md rounded-xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">
            Your Personalized Itinerary
          </h2>

          <p className="text-gray-700 mb-6 text-center">
            Based on your preferences, here is your recommended route:
          </p>

          {/* 推荐路线内容 / 加载动画 */}
          {isLoadingRoute ? (
            <Spinner label="Preparing your itinerary..." />
          ) : routeText ? (
            <pre className="whitespace-pre-wrap text-gray-800 bg-gray-50 p-4 rounded shadow">
              {routeText}
            </pre>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded">
              No route data found (maybe you refreshed this page). Please go back and generate again.
            </div>
          )}

          <div className="mt-8 flex justify-between items-center gap-3">
            <button
              onClick={handleBack}
              className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
              disabled={isSaving}
            >
              Back to Preferences
            </button>

            <button
              onClick={handleSave}
              disabled={isLoadingRoute || isSaving || !routeText.trim()}
              className={`px-4 py-2 rounded text-white flex items-center gap-2
                ${
                  isLoadingRoute || isSaving || !routeText.trim()
                    ? 'bg-blue-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
            >
              {isSaving && (
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-white" />
              )}
              {isSaving ? 'Saving...' : 'Save This Plan'}
            </button>
          </div>
        </div>

        <div className="w-full max-w-6xl mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DiffViewer
              diff={pendingDiff ? pendingDiff.diffContent : ''}
              onApprove={handleApproveDiff}
              onReject={handleRejectDiff}
            />
            <div>
              <ChatBox
                session={chatSession}
                onSessionUpdate={setChatSession}
                routeText={routeText}
                onRouteUpdate={handleRouteUpdate}
                generatedRouteId={generatedRouteId}
                pendingDiff={pendingDiff}
                setPendingDiff={setPendingDiff}
              />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default ResultPage;
