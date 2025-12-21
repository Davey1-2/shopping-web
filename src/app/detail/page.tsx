"use client";

import { useState, useEffect } from "react";
import { PieChart, CheckCircle, XCircle } from "lucide-react";
import { shoppingListService } from "@/services/shoppingListService";
import { ShoppingList } from "@/types";

export default function DetailPage() {
  const [lists, setLists] = useState<ShoppingList[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLists();
  }, []);

  const loadLists = async () => {
    try {
      const allLists = await shoppingListService.getAllShoppingLists();
      setLists(allLists);
    } catch (error) {
      console.error("Failed to load lists:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const doneCount = lists.filter((list) => list.done).length;
  const notDoneCount = lists.length - doneCount;
  const total = lists.length;

  // Calculate pie chart
  const donePercentage = total > 0 ? (doneCount / total) * 100 : 0;
  const notDonePercentage = total > 0 ? (notDoneCount / total) * 100 : 0;

  // SVG pie chart calculations
  const radius = 80;
  const centerX = 100;
  const centerY = 100;

  const doneAngle = (donePercentage / 100) * 360;
  const getCoordinatesForAngle = (angle: number) => {
    const angleRad = ((angle - 90) * Math.PI) / 180;
    return {
      x: centerX + radius * Math.cos(angleRad),
      y: centerY + radius * Math.sin(angleRad),
    };
  };

  const donePath = () => {
    if (donePercentage === 0) return "";
    if (donePercentage === 100) {
      return `M ${centerX} ${centerY} m -${radius}, 0 a ${radius},${radius} 0 1,0 ${radius * 2},0 a ${radius},${radius} 0 1,0 -${radius * 2},0`;
    }

    const end = getCoordinatesForAngle(doneAngle);
    const largeArc = doneAngle > 180 ? 1 : 0;

    return `M ${centerX} ${centerY} L ${centerX} ${centerY - radius} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y} Z`;
  };

  const notDonePath = () => {
    if (notDonePercentage === 0) return "";
    if (notDonePercentage === 100) {
      return `M ${centerX} ${centerY} m -${radius}, 0 a ${radius},${radius} 0 1,0 ${radius * 2},0 a ${radius},${radius} 0 1,0 -${radius * 2},0`;
    }

    const start = getCoordinatesForAngle(doneAngle);
    const largeArc = notDonePercentage > 50 ? 1 : 0;

    return `M ${centerX} ${centerY} L ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 1 ${centerX} ${centerY - radius} Z`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="bg-purple-100 p-4 rounded-full">
              <PieChart className="w-12 h-12 text-purple-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Statistiky nákupních seznamů
          </h1>
          <p className="text-lg text-gray-600">
            Přehled dokončených a nedokončených seznamů
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : total === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-600 text-lg">
              Zatím nemáte žádné nákupní seznamy
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-8">
            {/* Pie Chart */}
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                Graf dokončenosti
              </h2>
              <div className="flex justify-center mb-8">
                <svg width="200" height="200" viewBox="0 0 200 200">
                  {notDonePercentage > 0 && (
                    <path
                      d={notDonePath()}
                      fill="#ef4444"
                      stroke="white"
                      strokeWidth="2"
                    />
                  )}
                  {donePercentage > 0 && (
                    <path
                      d={donePath()}
                      fill="#22c55e"
                      stroke="white"
                      strokeWidth="2"
                    />
                  )}
                  <circle cx={centerX} cy={centerY} r="40" fill="white" />
                  <text
                    x={centerX}
                    y={centerY}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="text-2xl font-bold fill-gray-800"
                  >
                    {total}
                  </text>
                </svg>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    <span className="font-medium text-gray-800">Dokončeno</span>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">
                      {doneCount}
                    </div>
                    <div className="text-sm text-gray-600">
                      {donePercentage.toFixed(1)}%
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <XCircle className="w-6 h-6 text-red-600" />
                    <span className="font-medium text-gray-800">
                      Nedokončeno
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-red-600">
                      {notDoneCount}
                    </div>
                    <div className="text-sm text-gray-600">
                      {notDonePercentage.toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Lists */}
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Všechny seznamy ({total})
              </h2>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {lists.map((list) => (
                  <div
                    key={list.id}
                    className={`p-4 rounded-lg border-2 ${
                      list.done
                        ? "bg-green-50 border-green-200"
                        : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {list.done ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-600" />
                        )}
                        <div>
                          <div className="font-medium text-gray-800">
                            {list.name}
                          </div>
                          <div className="text-sm text-gray-600">
                            {list.category}
                          </div>
                        </div>
                      </div>
                      <div
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          list.done
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {list.done ? "Hotovo" : "Nedokončeno"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
