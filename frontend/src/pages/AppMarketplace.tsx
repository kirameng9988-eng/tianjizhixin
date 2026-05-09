import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStore, faFileAlt, faCheck, faTimes, faClock, faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import { getSystems, getApplications, createApplication, Application, System, SYSTEM_CATEGORIES } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import { useProductSwitcher } from '../components/ProductSwitcher';

type TabKey = 'all' | 'myApplications';

export default function AppMarketplace() {
  const { user } = useAuth();
  const { openDrawer } = useProductSwitcher();
  const [activeTab, setActiveTab] = useState<TabKey>('all');
  const [systems, setSystems] = useState<System[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedSystem, setSelectedSystem] = useState<System | null>(null);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [systemsData, applicationsData] = await Promise.all([
      getSystems(),
      getApplications(user?.id)
    ]);
    setSystems(systemsData);
    setApplications(applicationsData);
    setLoadError(null);
    setLoading(false);
  };

  const [loadError, setLoadError] = useState<string | null>(null);

  const handleApply = (system: System) => {
    setSelectedSystem(system);
    setReason('');
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!selectedSystem || !user || !reason.trim()) return;

    setSubmitting(true);
    try {
      await createApplication({
        systemId: selectedSystem.id,
        userId: user.id,
        username: user.username,
        systemName: selectedSystem.name,
        reason: reason.trim()
      });
      setShowModal(false);
      setActiveTab('myApplications');
      loadData();
    } catch (error) {
      console.error('Failed to submit application:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: Application['status']) => {
    const styles = {
      pending: 'bg-amber-50 text-amber-600 border-amber-200',
      approved: 'bg-emerald-50 text-emerald-600 border-emerald-200',
      rejected: 'bg-red-50 text-red-600 border-red-200',
      completed: 'bg-blue-50 text-blue-600 border-blue-200'
    };
    const icons = {
      pending: faClock,
      approved: faCheck,
      rejected: faTimes,
      completed: faCheck
    };
    const labels = {
      pending: '待处理',
      approved: '已通过',
      rejected: '未通过',
      completed: '已完成'
    };
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${styles[status]}`}>
        <FontAwesomeIcon icon={icons[status]} className="text-xs" />
        {labels[status]}
      </span>
    );
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isAlreadyApplied = (systemId: string) => {
    return applications.some(app => app.systemId === systemId && app.status === 'pending');
  };

  const getAppliedStatus = (systemId: string) => {
    return applications.find(app => app.systemId === systemId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar onMenuClick={openDrawer} />
        <div className="flex items-center justify-center h-[calc(100vh-56px)]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-500 font-medium">加载中...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar onMenuClick={openDrawer} />
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Tabs */}
        <div className="flex items-center gap-1 mb-6 bg-white rounded-xl p-1 shadow-sm border border-slate-200 w-fit">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition-all ${
              activeTab === 'all'
                ? 'bg-blue-500 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <FontAwesomeIcon icon={faStore} className="text-sm" />
            全部应用
          </button>
          <button
            onClick={() => setActiveTab('myApplications')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition-all ${
              activeTab === 'myApplications'
                ? 'bg-blue-500 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <FontAwesomeIcon icon={faFileAlt} className="text-sm" />
            我的申请
            {applications.filter(a => a.status === 'pending').length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 bg-amber-500 text-white text-xs rounded-full">
                {applications.filter(a => a.status === 'pending').length}
              </span>
            )}
          </button>
        </div>

        {/* All Tab */}
        {activeTab === 'all' && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {systems.map(system => {
                const appliedStatus = getAppliedStatus(system.id);
                const hasPending = isAlreadyApplied(system.id);
                const category = SYSTEM_CATEGORIES.find(c => c.value === system.category);

                return (
                  <div
                    key={system.id}
                    className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                        <FontAwesomeIcon icon={faStore} className="text-blue-500" />
                      </div>
                      {category && (
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded">
                          {category.label}
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-slate-800 mb-2">{system.name}</h3>
                    <p className="text-slate-500 text-sm mb-4 line-clamp-2">
                      {system.description || '暂无描述'}
                    </p>
                    {hasPending ? (
                      <div className="flex items-center gap-2 text-amber-600 text-sm">
                        <FontAwesomeIcon icon={faClock} className="text-xs" />
                        已申请，等待审批
                      </div>
                    ) : appliedStatus && appliedStatus.status !== 'pending' ? (
                      <div className="flex items-center gap-2">
                        {getStatusBadge(appliedStatus.status)}
                      </div>
                    ) : (
                      <button
                        onClick={() => handleApply(system)}
                        className="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors"
                      >
                        申请
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
            {systems.length === 0 && (
              <div className="text-center py-16">
                <FontAwesomeIcon icon={faStore} className="text-slate-300 text-4xl mb-3" />
                <p className="text-slate-500">暂无可申请的应用</p>
              </div>
            )}
          </div>
        )}

        {/* My Applications Tab */}
        {activeTab === 'myApplications' && (
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">应用名称</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">申请原因</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">状态</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">申请时间</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">处理说明</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {applications.map(app => (
                    <tr key={app.id} className="hover:bg-slate-50">
                      <td className="px-5 py-4">
                        <span className="font-medium text-slate-800">{app.systemName}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-slate-600 text-sm">{app.reason}</span>
                      </td>
                      <td className="px-5 py-4">
                        {getStatusBadge(app.status)}
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-slate-500 text-sm">{formatDate(app.applyTime)}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-slate-500 text-sm">{app.processNote || '-'}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {applications.length === 0 && (
              <div className="text-center py-16">
                <FontAwesomeIcon icon={faFileAlt} className="text-slate-300 text-4xl mb-3" />
                <p className="text-slate-500">暂无申请记录</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Apply Modal */}
      {showModal && selectedSystem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-800">申请 {selectedSystem.name}</h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
              >
                <FontAwesomeIcon icon={faTimes} className="text-sm" />
              </button>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">申请原因</label>
                <textarea
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm"
                  placeholder="请输入申请原因，说明您需要使用该系统的用途..."
                  rows={4}
                />
              </div>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-300 transition-all text-sm"
              >
                取消
              </button>
              <button
                onClick={handleSubmit}
                disabled={!reason.trim() || submitting}
                className="px-4 py-2 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
              >
                <FontAwesomeIcon icon={faPaperPlane} className="text-xs" />
                {submitting ? '提交中...' : '提交申请'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}