import * as React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Lock, User, ArrowRight } from 'lucide-react';
import { Button } from '@ui/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@ui/components/ui/card';

export default function LoginPage() {
  const [email] = useState('demo@healthmais.com');
  const [password] = useState('********');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Mocked user login
    setTimeout(() => {
      navigate('/dashboard');
      setLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg border border-zinc-200 rounded-lg overflow-hidden bg-white">
        <CardHeader className="pt-10 pb-6 text-center space-y-2">
          <div className="mx-auto bg-zinc-900 text-zinc-50 w-12 h-12 rounded-md flex items-center justify-center shadow-md mb-4">
            <Activity size={24} />
          </div>
          <CardTitle className="text-2xl font-bold text-zinc-900 tracking-tight">Healthmais</CardTitle>
          <CardDescription className="text-zinc-500 font-medium text-sm">Acesso restrito ao ecossistema de dados</CardDescription>
        </CardHeader>
        
        <CardContent className="px-8 pb-10">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-3">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400 group-focus-within:text-zinc-900 transition-colors">
                  <User size={16} />
                </div>
                <input
                  type="email"
                  value={email}
                  disabled
                  className="block w-full pl-10 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-md text-sm font-medium text-zinc-600 focus:ring-1 focus:ring-zinc-400 transition-all outline-none"
                  placeholder="Seu e-mail"
                />
              </div>
              
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400 group-focus-within:text-zinc-900 transition-colors">
                  <Lock size={16} />
                </div>
                <input
                  type="password"
                  value={password}
                  disabled
                  className="block w-full pl-10 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-md text-sm font-medium text-zinc-600 focus:ring-1 focus:ring-zinc-400 transition-all outline-none"
                  placeholder="Sua senha"
                />
              </div>
            </div>

            <div className="pt-2 flex flex-col gap-3">
              <Button 
                type="submit" 
                disabled={loading}
                className="w-full h-10 bg-zinc-900 hover:bg-zinc-800 text-zinc-50 rounded-md font-semibold text-sm shadow transition-all flex items-center justify-center gap-2"
              >
                {loading ? 'Autenticando...' : 'Entrar no Sistema'}
                {!loading && <ArrowRight size={16} />}
              </Button>

              <Button 
                type="button"
                variant="outline"
                onClick={() => {
                  setLoading(true);
                  setTimeout(() => { navigate('/admin'); setLoading(false); }, 500);
                }}
                className="w-full h-10 border border-zinc-200 text-zinc-600 rounded-md font-medium text-sm hover:bg-zinc-50 hover:text-zinc-900 transition-all"
              >
                Entrar como Mock Admin (Dev)
              </Button>
            </div>
            
            <p className="text-center text-[10px] text-zinc-400 font-medium mt-8 uppercase tracking-widest">
              © 2026 Healthmais Analytics
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
