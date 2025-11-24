import React, { useState, useEffect } from 'react';
import { getCustomers, getEmails, predictTag } from './api';
import { Mail, Tag, AlertCircle, CheckCircle, User, Layout, Settings, ChevronRight, RefreshCw } from 'lucide-react';

function App() {
    const [customers, setCustomers] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState('');
    const [emails, setEmails] = useState([]);
    const [predictions, setPredictions] = useState({});
    const [loading, setLoading] = useState(false);
    const [predicting, setPredicting] = useState({});

    useEffect(() => {
        loadCustomers();
    }, []);

    useEffect(() => {
        if (selectedCustomer) {
            loadEmails(selectedCustomer);
            setPredictions({});
        }
    }, [selectedCustomer]);

    const loadCustomers = async () => {
        try {
            const data = await getCustomers();
            setCustomers(data);
            if (data.length > 0) setSelectedCustomer(data[0]);
        } catch (error) {
            console.error("Error loading customers:", error);
        }
    };

    const loadEmails = async (customerId) => {
        setLoading(true);
        try {
            const data = await getEmails(customerId);
            setEmails(data);
        } catch (error) {
            console.error("Error loading emails:", error);
        }
        setLoading(false);
    };

    const handlePredict = async (email) => {
        setPredicting(prev => ({ ...prev, [email.id]: true }));
        try {
            const result = await predictTag(email.subject + " " + email.body, selectedCustomer);
            setPredictions(prev => ({
                ...prev,
                [email.id]: result
            }));
        } catch (error) {
            console.error("Error predicting tag:", error);
        }
        setPredicting(prev => ({ ...prev, [email.id]: false }));
    };

    return (
        <div className="flex h-screen bg-gray-50 font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-xl">
                <div className="p-6 border-b border-slate-800 flex items-center gap-3">
                    <div className="bg-blue-600 p-2 rounded-lg">
                        <Mail className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-xl font-bold tracking-tight">HiverAI</span>
                </div>

                <div className="p-6 flex-1">
                    <div className="mb-8">
                        <h3 className="text-xs uppercase text-slate-500 font-semibold mb-4 tracking-wider">Context</h3>
                        <div className="space-y-2">
                            {customers.map(c => (
                                <button
                                    key={c}
                                    onClick={() => setSelectedCustomer(c)}
                                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-all ${selectedCustomer === c
                                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                                            : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <User className="h-4 w-4" />
                                        {c}
                                    </div>
                                    {selectedCustomer === c && <ChevronRight className="h-4 w-4" />}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-slate-950 text-xs text-slate-500 text-center">
                    v1.0.0 • Deployment Ready
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden">
                {/* Top Bar */}
                <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-8 shadow-sm z-10">
                    <div className="flex items-center gap-4">
                        <h2 className="text-2xl font-bold text-gray-800">Inbox Analysis</h2>
                        <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100">
                            {selectedCustomer}
                        </span>
                    </div>
                    <button
                        onClick={() => loadEmails(selectedCustomer)}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </header>

                {/* Email List */}
                <div className="flex-1 overflow-y-auto p-8">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                            <RefreshCw className="h-8 w-8 animate-spin mb-4" />
                            <p>Loading emails...</p>
                        </div>
                    ) : (
                        <div className="grid gap-6 max-w-5xl mx-auto">
                            {emails.map(email => (
                                <div key={email.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
                                    <div className="p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="space-y-1">
                                                <h3 className="text-lg font-semibold text-gray-900 leading-tight">{email.subject}</h3>
                                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                                    <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">ID: {email.id}</span>
                                                </div>
                                            </div>

                                            <div className="flex flex-col items-end gap-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs text-gray-400 uppercase font-medium">Ground Truth</span>
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                                                        {email.ground_truth_tag}
                                                    </span>
                                                </div>

                                                {predictions[email.id] && (
                                                    <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4 duration-300">
                                                        <span className="text-xs text-gray-400 uppercase font-medium">Prediction</span>
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${predictions[email.id].tag === email.ground_truth_tag
                                                                ? 'bg-green-50 text-green-700 border-green-200'
                                                                : 'bg-amber-50 text-amber-700 border-amber-200'
                                                            }`}>
                                                            {predictions[email.id].tag}
                                                            <span className="ml-1 opacity-75">
                                                                ({Math.round(predictions[email.id].confidence * 100)}%)
                                                            </span>
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <p className="text-gray-600 mb-6 leading-relaxed bg-gray-50/50 p-4 rounded-lg border border-gray-100">
                                            {email.body}
                                        </p>

                                        <div className="flex items-center justify-between pt-2">
                                            {!predictions[email.id] ? (
                                                <button
                                                    onClick={() => handlePredict(email)}
                                                    disabled={predicting[email.id]}
                                                    className="inline-flex items-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                                >
                                                    {predicting[email.id] ? (
                                                        <>
                                                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                                            Analyzing...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Tag className="h-4 w-4 mr-2" />
                                                            Run Analysis
                                                        </>
                                                    )}
                                                </button>
                                            ) : (
                                                <div className={`flex items-start gap-3 text-sm p-4 rounded-lg w-full border ${predictions[email.id].tag === email.ground_truth_tag
                                                        ? 'bg-green-50 border-green-100'
                                                        : 'bg-amber-50 border-amber-100'
                                                    }`}>
                                                    {predictions[email.id].tag === email.ground_truth_tag ? (
                                                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                                                    ) : (
                                                        <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                                                    )}
                                                    <div>
                                                        <p className={`font-semibold mb-1 ${predictions[email.id].tag === email.ground_truth_tag ? 'text-green-900' : 'text-amber-900'
                                                            }`}>
                                                            Analysis Result: {predictions[email.id].source}
                                                        </p>
                                                        <p className={
                                                            predictions[email.id].tag === email.ground_truth_tag ? 'text-green-800' : 'text-amber-800'
                                                        }>
                                                            {predictions[email.id].explanation}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

export default App;
