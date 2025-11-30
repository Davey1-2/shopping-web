"use client";

import { useState, useEffect } from "react";
import { Settings, Wifi, WifiOff, Database, Globe } from "lucide-react";
import {
  shoppingListService,
  AppConfig,
  ConnectionStatus,
} from "@/services/shoppingListService";

interface ConfigPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ConfigPanel({ isOpen, onClose }: ConfigPanelProps) {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus | null>(null);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setConfig(shoppingListService.getConfig());
    setConnectionStatus(shoppingListService.getConnectionStatus());
  }, []);

  useEffect(() => {
    if (isOpen && isClient) {
      setConfig(shoppingListService.getConfig());
      setConnectionStatus(shoppingListService.getConnectionStatus());
    }
  }, [isOpen, isClient]);

  const handleConfigChange = (
    key: keyof AppConfig,
    value: string | boolean
  ) => {
    if (!config) return;
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
    shoppingListService.setConfig({ [key]: value });

    setTimeout(() => {
      setConnectionStatus(shoppingListService.getConnectionStatus());
    }, 100);
  };

  const testConnection = async () => {
    setIsTestingConnection(true);
    try {
      await shoppingListService.refreshConnection();
      setConnectionStatus(shoppingListService.getConnectionStatus());
    } catch (error) {
      console.error("Connection test failed:", error);
    } finally {
      setIsTestingConnection(false);
    }
  };

  if (!isOpen || !isClient || !config || !connectionStatus) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Settings className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-800">
              Nastavení aplikace
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        <div className="space-y-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-gray-800">Stav připojení</h3>
              <button
                onClick={testConnection}
                disabled={isTestingConnection}
                className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 disabled:opacity-50"
              >
                {isTestingConnection ? "Testování..." : "Test"}
              </button>
            </div>

            <div className="flex items-center gap-2 text-sm">
              {connectionStatus.isOnline ? (
                <Wifi className="w-4 h-4 text-green-600" />
              ) : (
                <WifiOff className="w-4 h-4 text-red-600" />
              )}
              <span
                className={
                  connectionStatus.isOnline ? "text-green-700" : "text-red-700"
                }
              >
                {connectionStatus.isOnline
                  ? "Připojeno k serveru"
                  : "Server nedostupný"}
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm mt-1">
              {connectionStatus.usingMock ? (
                <Database className="w-4 h-4 text-orange-600" />
              ) : (
                <Globe className="w-4 h-4 text-blue-600" />
              )}
              <span className="text-gray-600">
                Používá se: {connectionStatus.service}
              </span>
            </div>
          </div>

          <div>
            <label className="flex items-center justify-between">
              <span className="text-gray-700 font-medium">
                Použít mock data
              </span>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={config.useMockData}
                  onChange={(e) =>
                    handleConfigChange("useMockData", e.target.checked)
                  }
                  className="sr-only"
                />
                <div
                  className={`w-12 h-6 rounded-full transition-colors cursor-pointer ${
                    config.useMockData ? "bg-blue-600" : "bg-gray-300"
                  }`}
                  onClick={() =>
                    handleConfigChange("useMockData", !config.useMockData)
                  }
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
                      config.useMockData ? "translate-x-6" : "translate-x-0.5"
                    } mt-0.5`}
                  />
                </div>
              </div>
            </label>
            <p className="text-sm text-gray-500 mt-1">
              Když je zapnuto, aplikace používá lokální mock data místo serveru
            </p>
          </div>

          {!config.useMockData && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL serveru
                </label>
                <input
                  type="text"
                  value={config.apiBaseUrl}
                  onChange={(e) =>
                    handleConfigChange("apiBaseUrl", e.target.value)
                  }
                  placeholder="http://localhost:3001"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Identita uživatele
                </label>
                <input
                  type="text"
                  value={config.userIdentity}
                  onChange={(e) =>
                    handleConfigChange("userIdentity", e.target.value)
                  }
                  placeholder="frontend-user"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <h4 className="font-medium text-blue-800 mb-1">Informace</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Mock data: Rychlé testování bez serveru</li>
              <li>• API mode: Připojení k MongoDB backend</li>
              <li>• Automatické přepnutí při výpadku serveru</li>
            </ul>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Zavřít
          </button>
        </div>
      </div>
    </div>
  );
}
