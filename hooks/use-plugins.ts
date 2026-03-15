import { useState, useEffect } from 'react';
import { useAuth } from './use-auth';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';

export interface Plugin {
  id: string;
  name: string;
  description: string;
  icon: string;
  author: string;
  category: string;
  price: number;
  rating: number;
  reviews: number;
  installs: string;
  code: string;
  verified: boolean;
}

export function usePlugins() {
  const { user } = useAuth();
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [installedIds, setInstalledIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPlugins = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/plugins`);
      const data = await response.json();
      setPlugins(data);
    } catch (error) {
      console.error('Error fetching plugins:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInstalled = async () => {
    if (!user?.id) return;
    try {
      const response = await fetch(`${API_URL}/plugins/installed/${user.id}`);
      const data = await response.json();
      setInstalledIds(data.map((i: any) => i.pluginId));
    } catch (error) {
      console.error('Error fetching installed plugins:', error);
    }
  };

  const installPlugin = async (pluginId: string) => {
    if (!user?.id) return;
    try {
      const response = await fetch(`${API_URL}/plugins/install`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, pluginId }),
      });
      if (response.ok) {
        setInstalledIds(prev => [...prev, pluginId]);
        return true;
      }
    } catch (error) {
      console.error('Error installing plugin:', error);
    }
    return false;
  };

  useEffect(() => {
    fetchPlugins();
    fetchInstalled();
  }, [user?.id]);

  return {
    plugins,
    installedIds,
    loading,
    refresh: fetchPlugins,
    installPlugin,
  };
}
