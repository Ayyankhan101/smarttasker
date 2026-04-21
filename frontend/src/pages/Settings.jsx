import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, ShieldOff } from 'lucide-react';

export default function Settings() {
    const { user, setup2FA, disable2FA } = useAuth();
    const [loading, setLoading] = useState(false);
    const [qrCode, setQrCode] = useState('');
    const [secret, setSecret] = useState('');
    const [code, setCode] = useState('');
    const [showSetup, setShowSetup] = useState(false);

    const handleSetup = async () => {
        setLoading(true);
        try {
            const data = await setup2FA();
            setQrCode(data.qrCodeUrl);
            setSecret(data.secret);
            setShowSetup(true);
        } catch (error) {
            alert('Failed to setup 2FA');
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async () => {
        if (!code) return alert('Enter code from authenticator app');
        setLoading(true);
        try {
            await fetch('/api/auth/2fa/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tempToken: localStorage.getItem('temp2FAToken'), code }),
            });
            alert('2FA enabled!');
            setShowSetup(false);
            window.location.reload();
        } catch (error) {
            alert('Invalid code');
        } finally {
            setLoading(false);
        }
    };

    const handleDisable = async () => {
        if (!confirm('Disable 2FA?')) return;
        setLoading(true);
        try {
            await disable2FA();
            alert('2FA disabled');
        } catch (error) {
            alert('Failed to disable 2FA');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">Settings</h2>

            <div className="bg-white rounded-lg shadow-sm border p-6 max-w-2xl">
                <h3 className="font-semibold text-lg mb-4">Two-Factor Authentication</h3>
                
                {user?.role === 'admin' && (
                    <p className="text-sm text-gray-500 mb-4">
                        Protect your account with Google Authenticator
                    </p>
                )}

                {user?.is2FAEnabled ? (
                    <button
                        onClick={handleDisable}
                        disabled={loading}
                        className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50"
                    >
                        <ShieldOff size={20} />
                        Disable 2FA
                    </button>
                ) : (
                    <button
                        onClick={handleSetup}
                        disabled={loading}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                        <Shield size={20} />
                        {loading ? 'Setting up...' : 'Enable 2FA'}
                    </button>
                )}

                {showSetup && (
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm mb-2">Scan this QR code with Google Authenticator:</p>
                        <img src={qrCode} alt="2FA QR Code" className="w-48 h-48 mb-4" />
                        <p className="text-sm text-gray-500 mb-2">Or enter this secret manually:</p>
                        <code className="block p-2 bg-white border rounded text-sm font-mono">{secret}</code>
                        <div className="mt-4">
                            <input
                                type="text"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                placeholder="Enter 6-digit code"
                                className="w-full px-3 py-2 border rounded-md mb-2"
                            />
                            <button
                                onClick={handleVerify}
                                className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700"
                            >
                                Verify & Enable
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}