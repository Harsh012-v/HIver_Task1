import React, { useState, useEffect } from 'react';
import { getCustomers, getEmails, predictTag } from './api';
import { Mail, Tag, AlertCircle, CheckCircle, User } from 'lucide-react';

function App() {
    const [customers, setCustomers] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState('');
    const [emails, setEmails] = useState([]);
    const [predictions, setPredictions] = useState({});
    const [loading, setLoading] = useState(false);

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
        try {
            const result = await predictTag(email.subject + " " + email.body, selectedCustomer);
            setPredictions(prev => ({
                ...prev,
                [email.id]: result
            }));
        } catch (error) {
            console.error("Error predicting tag:", error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Mail className="h-6 w-6 text-blue-600" />
                        <h1 className="text-xl font-bold text-gray-900">Hiver Email Tagger</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-500">Customer Context:</span>
                        <select
                            value={selectedCustomer}
                            onChange={(e) => setSelectedCustomer(e.target.value)}
                            className="block w-48 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                        >
                            {customers.map(c => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {loading ? (
                    <div className="text-center py-12">Loading...</div>
                ) : (
                    <div className="grid gap-6">
                        {emails.map(email => (
                            <div key={email.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 transition-all hover:shadow-md">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-1">{email.subject}</h3>
                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                            <User className="h-4 w-4" />
                                            <span>Customer ID: {email.customer_id}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                            GT: {email.ground_truth_tag}
                                        </span>
                                        {predictions[email.id] && (
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${predictions[email.id].tag === email.ground_truth_tag
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                Pred: {predictions[email.id].tag} ({Math.round(predictions[email.id].confidence * 100)}%)
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <p className="text-gray-600 mb-6 whitespace-pre-wrap">{email.body}</p>

                                <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                                    {!predictions[email.id] ? (
                                        <button
                                            onClick={() => handlePredict(email)}
                                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                        >
                                            <Tag className="h-4 w-4 mr-2" />
                                            Predict Tag
                                        </button>
                                    ) : (
                                        <div className="flex items-start gap-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-md w-full">
                                            {predictions[email.id].tag === email.ground_truth_tag ? (
                                                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                                            ) : (
                                                <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
                                            )}
                                            <div>
                                                <p className="font-medium text-gray-900">
                                                    Source: {predictions[email.id].source}
                                                </p>
                                                <p>{predictions[email.id].explanation}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}

export default App;
